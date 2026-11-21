#!/usr/bin/env node
import { randomBytes } from "node:crypto";
import { createInterface } from "node:readline";
import { WebSocketServer, WebSocket } from "ws";

const HOST = "127.0.0.1";
const PORT = Number(process.env.MOTION_ATELIER_BRIDGE_PORT || 47821);
const PATH = "/motion-atelier-bridge";
const APP_ORIGINS = new Set(["https://mat-studio.vercel.app", "https://motion-atelier-lab-mat-only.vercel.app", "https://motion-atelier-lab.vercel.app"]);
const PAIR_CODE = randomBytes(4).toString("hex").toUpperCase().slice(0, 6);
const PROTOCOL_VERSION = "2025-03-26";
let editor = null;
let paired = false;
let nextId = 1;
const pending = new Map();

const log = (...args) => process.stderr.write("[motion-atelier-bridge] " + args.join(" ") + "\n");
function allowedOrigin(origin) {
  if (!origin) return false;
  if (APP_ORIGINS.has(origin)) return true;
  try {
    const u = new URL(origin);
    return ["localhost", "127.0.0.1"].includes(u.hostname) && ["http:", "https:"].includes(u.protocol);
  } catch { return false; }
}
const wss = new WebSocketServer({
  host: HOST, port: PORT, path: PATH,
  verifyClient: ({ origin }, done) => {
    const ok = allowedOrigin(origin);
    done(ok, ok ? 200 : 403, "Origin not allowed");
  }
});

function sendEditor(message) {
  if (!editor || editor.readyState !== WebSocket.OPEN) throw new Error("Motion Atelier is not connected. Open the editor and click AI Bridge → Connect.");
  editor.send(JSON.stringify(message));
}
function requestEditor(type, payload = {}, timeoutMs = 20000) {
  const id = nextId++;
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => { pending.delete(id); reject(new Error("Editor did not respond in time.")); }, timeoutMs);
    pending.set(id, { resolve, reject, timer });
    try { sendEditor({ type, id, ...payload }); }
    catch (error) { clearTimeout(timer); pending.delete(id); reject(error); }
  });
}
function settle(id, value, error) {
  const item = pending.get(id);
  if (!item) return;
  clearTimeout(item.timer);
  pending.delete(id);
  error ? item.reject(new Error(error)) : item.resolve(value);
}

wss.on("connection", (socket) => {
  if (editor && editor.readyState === WebSocket.OPEN) editor.close(4001, "New editor tab connected");
  editor = socket;
  paired = false;
  log("Editor tab connected.");
  socket.send(JSON.stringify({ type: "bridge_info", code: PAIR_CODE }));
  socket.on("message", (raw) => {
    let msg;
    try { msg = JSON.parse(raw.toString()); } catch { return; }
    if (msg.type === "hello") socket.send(JSON.stringify({ type: "bridge_ready", app: "Motion Atelier" }));
    if (msg.type === "pair_result") {
      if (msg.approved === true) {
        paired = true;
        settle(msg.id, { connected: true, grants: ["read", "edit"] });
        log("Pairing approved by the user.");
      } else {
        paired = false;
        settle(msg.id, null, "The user denied the AI bridge connection.");
      }
    }
    if (msg.type === "response") settle(msg.id, msg.result, msg.error);
  });
  socket.on("close", () => {
    if (editor !== socket) return;
    editor = null;
    paired = false;
    for (const [id, item] of pending) {
      clearTimeout(item.timer);
      item.reject(new Error("Motion Atelier disconnected."));
      pending.delete(id);
    }
    log("Editor disconnected; pairing cleared.");
  });
  socket.on("error", (error) => log("WebSocket error:", error.message));
});

const tools = [
  ["editor_connect", "Pair with the open editor; the user must approve.", { code: { type: "string", description: "Six-character code shown in the AI Bridge panel." } }, ["code"]],
  ["editor_status", "Read the editor connection and pairing status.", {}, []],
  ["scene_summary", "Read the active character, rig readiness, clips and timeline state.", {}, []],
  ["clips_list", "List animation clips, duration and key counts.", {}, []],
  ["clip_create", "Create an editable animation clip.", { name: { type: "string", minLength: 1, maxLength: 48 }, durationSeconds: { type: "number", minimum: 0.25, maximum: 60 }, loop: { type: "boolean" } }, ["name", "durationSeconds"]],
  ["pose_set", "Set body-control keyframes. Use rotationDeg for joints and positionM only for root. Timeline is 30 fps.", {
    clip: { type: "string" }, frame: { type: "integer", minimum: 0, maximum: 1800 },
    keys: { type: "array", minItems: 1, maxItems: 30, items: { type: "object", properties: {
      bone: { type: "string" }, rotationDeg: { type: "array", items: { type: "number" }, minItems: 3, maxItems: 3 },
      positionM: { type: "array", items: { type: "number" }, minItems: 3, maxItems: 3 },
      easing: { type: "string", enum: ["linear", "smooth", "in", "out", "hold"] }
    }, required: ["bone"], additionalProperties: false } }
  }, ["frame", "keys"]],
  ["keys_read", "Read keyframes for selected controls.", { clip: { type: "string" }, bones: { type: "array", minItems: 1, maxItems: 20, items: { type: "string" } } }, ["bones"]],
  ["playback_control", "Play, pause, stop, or seek the timeline.", {
    action: { type: "string", enum: ["play", "pause", "stop", "seek"] }, clip: { type: "string" },
    seconds: { type: "number", minimum: 0, maximum: 60 }
  }, ["action"]],
  ["save_custom_clips", "Save custom clips in this browser's local storage.", {}, []]
].map(([name, description, properties, required]) => ({
  name, description,
  inputSchema: { type: "object", properties, required, additionalProperties: false }
}));

async function callTool(name, args = {}) {
  if (name === "editor_status") return { editorConnected: !!editor && editor.readyState === WebSocket.OPEN, paired };
  if (name === "editor_connect") {
    if (args.code !== PAIR_CODE) throw new Error("Incorrect code. Copy the current code from Motion Atelier.");
    if (!editor || editor.readyState !== WebSocket.OPEN) throw new Error("Open Motion Atelier and click AI Bridge → Connect first.");
    if (paired) return { connected: true, grants: ["read", "edit"], message: "Already paired." };
    return await requestEditor("pair_request", { client: "MCP agent", grants: ["read", "edit"] }, 120000);
  }
  if (!paired) throw new Error("Not paired. Call editor_connect with the code shown in Motion Atelier.");
  const read = ["scene_summary", "clips_list", "keys_read"];
  const edit = ["clip_create", "pose_set", "playback_control", "save_custom_clips"];
  if (![...read, ...edit].includes(name)) throw new Error("Unknown tool: " + name);
  return await requestEditor("command", { method: name, args });
}
const toolResult = (value, isError = false) => ({
  content: [{ type: "text", text: JSON.stringify(value, null, 2) }],
  ...(isError ? { isError: true } : {})
});
const write = (message) => process.stdout.write(JSON.stringify(message) + "\n");

async function handle(message) {
  const { id, method, params = {} } = message || {};
  if (method === "notifications/initialized" || method === "notifications/cancelled") return;
  if (method === "ping") return write({ jsonrpc: "2.0", id, result: {} });
  if (method === "initialize") return write({ jsonrpc: "2.0", id, result: {
    protocolVersion: params.protocolVersion || PROTOCOL_VERSION,
    capabilities: { tools: {} },
    serverInfo: { name: "motion-atelier-ai-bridge", version: "0.1.0" },
    instructions: "Open Motion Atelier, click AI Bridge → Connect, then call editor_connect with the six-character code. The user must approve."
  }});
  if (method === "tools/list") return write({ jsonrpc: "2.0", id, result: { tools } });
  if (method === "tools/call") {
    try {
      const value = await callTool(params.name, params.arguments || {});
      return write({ jsonrpc: "2.0", id, result: toolResult(value) });
    } catch (error) {
      return write({ jsonrpc: "2.0", id, result: toolResult({ error: error.message || String(error) }, true) });
    }
  }
  if (id !== undefined) write({ jsonrpc: "2.0", id, error: { code: -32601, message: "Method not found: " + method } });
}

const rl = createInterface({ input: process.stdin, crlfDelay: Infinity });
rl.on("line", (line) => {
  if (!line.trim()) return;
  try { handle(JSON.parse(line)); } catch (error) { log("Request error:", error.message); }
});
rl.on("close", () => { try { editor?.close(1000, "MCP client closed"); } catch {} wss.close(); });
log("Listening only on ws://" + HOST + ":" + PORT + PATH);
log("Open Motion Atelier, click AI Bridge → Connect, then give its code to your MCP client.");
