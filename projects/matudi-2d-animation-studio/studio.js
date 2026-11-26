(() => {
  "use strict";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const clone = value => JSON.parse(JSON.stringify(value));
  const FRAME_RATE = 24;
  const TOTAL_FRAMES = 240;
  const STORAGE_KEY = "matudi-animation-studio-v1";

  const state = {
    projectName: "Untitled Character Film",
    frame: 0,
    fps: FRAME_RATE,
    duration: 10,
    playing: false,
    loop: true,
    zoom: 1,
    timelineZoom: 1,
    tool: "select",
    selectedTrack: "transform",
    selectedKey: null,
    selectedLayer: "head",
    expression: "neutral",
    mouth: 0,
    headTilt: 0,
    armRaise: 0,
    transform: { x: 480, y: 410, rotation: 0, scale: 1 },
    shirtColor: "#d7d8df",
    outlineColor: "#292a31",
    characterName: "Matudi",
    backgroundUrl: null,
    backgroundImage: null,
    audioUrl: null,
    audioName: "",
    audioDuration: 0,
    audioElement: null,
    audioVolume: 1,
    keys: {
      transform: [{ frame: 0, value: { x: 480, y: 410, rotation: 0, scale: 1 }, easing: "ease" }],
      face: [{ frame: 0, value: { expression: "neutral", mouth: 0, headTilt: 0 }, easing: "ease" }],
      motion: [],
      audio: []
    },
    history: [],
    future: [],
    lastTick: 0,
    raf: 0,
    dirty: false,
    drag: null,
    customTracks: []
  };

  const stage = $("#stage");
  const root = $("#characterRoot");
  const head = $("#headGroup");
  const mouth = $("#mouth");
  const arms = $("#armsGroup");
  const legLeft = $("#legLeft");
  const legRight = $("#legRight");
  const playhead = $("#playhead");
  const lanes = $("#trackLanes");
  const ruler = $("#timelineRuler");
  const timelineScroll = $("#timelineScroll");
  const toast = $("#toast");

  function notify(message) {
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(notify.timer);
    notify.timer = setTimeout(() => toast.classList.remove("show"), 2200);
  }

  function markDirty(message = "Unsaved changes") {
    state.dirty = true;
    $("#saveState").textContent = message;
  }

  function setSaved() {
    state.dirty = false;
    $("#saveState").textContent = "All changes saved";
  }

  function snapshot() {
    return {
      frame: state.frame,
      expression: state.expression,
      mouth: state.mouth,
      headTilt: state.headTilt,
      armRaise: state.armRaise,
      transform: clone(state.transform),
      shirtColor: state.shirtColor,
      outlineColor: state.outlineColor,
      keys: clone(state.keys)
    };
  }

  function pushHistory() {
    state.history.push(snapshot());
    if (state.history.length > 60) state.history.shift();
    state.future.length = 0;
    updateHistoryButtons();
  }

  function restoreSnapshot(data) {
    state.frame = data.frame;
    state.expression = data.expression;
    state.mouth = data.mouth;
    state.headTilt = data.headTilt;
    state.armRaise = data.armRaise;
    state.transform = clone(data.transform);
    state.shirtColor = data.shirtColor;
    state.outlineColor = data.outlineColor;
    state.keys = clone(data.keys);
    renderFrame();
    renderTimeline();
    syncInspector();
    markDirty();
  }

  function undo() {
    if (!state.history.length) return notify("Nothing to undo");
    state.future.push(snapshot());
    restoreSnapshot(state.history.pop());
    updateHistoryButtons();
  }

  function redo() {
    if (!state.future.length) return notify("Nothing to redo");
    state.history.push(snapshot());
    restoreSnapshot(state.future.pop());
    updateHistoryButtons();
  }

  function updateHistoryButtons() {
    $("#undoBtn").disabled = !state.history.length;
    $("#redoBtn").disabled = !state.future.length;
  }

  function easingValue(t, easing = "ease") {
    if (easing === "linear") return t;
    if (easing === "ease-in") return t * t;
    if (easing === "ease-out") return 1 - (1 - t) * (1 - t);
    if (easing === "step") return t < 1 ? 0 : 1;
    return t * t * (3 - 2 * t);
  }

  function interpolateValue(a, b, t) {
    if (typeof a === "number" && typeof b === "number") return a + (b - a) * t;
    if (typeof a === "string" && typeof b === "string") return t < .5 ? a : b;
    if (Array.isArray(a) && Array.isArray(b)) return b.map((value, index) => interpolateValue(a[index], value, t));
    if (a && b && typeof a === "object" && typeof b === "object") {
      const result = {};
      for (const key of new Set([...Object.keys(a), ...Object.keys(b)])) {
        result[key] = interpolateValue(a[key] ?? b[key], b[key] ?? a[key], t);
      }
      return result;
    }
    return t < 1 ? a : b;
  }

  function valueAt(track, frame) {
    const keys = [...(state.keys[track] || [])].sort((a, b) => a.frame - b.frame);
    if (!keys.length) return null;
    if (frame <= keys[0].frame) return clone(keys[0].value);
    if (frame >= keys[keys.length - 1].frame) return clone(keys[keys.length - 1].value);
    let left = keys[0];
    let right = keys[keys.length - 1];
    for (let index = 0; index < keys.length - 1; index++) {
      if (frame >= keys[index].frame && frame <= keys[index + 1].frame) {
        left = keys[index];
        right = keys[index + 1];
        break;
      }
    }
    const span = Math.max(1, right.frame - left.frame);
    const t = easingValue((frame - left.frame) / span, left.easing || "ease");
    return interpolateValue(left.value, right.value, t);
  }

  function applyTrackValues() {
    const transformValue = valueAt("transform", state.frame);
    const faceValue = valueAt("face", state.frame);
    if (transformValue) state.transform = { ...state.transform, ...transformValue };
    if (faceValue) {
      state.expression = faceValue.expression || state.expression;
      state.mouth = faceValue.mouth ?? state.mouth;
      state.headTilt = faceValue.headTilt ?? state.headTilt;
    }
  }

  function renderFrame() {
    applyTrackValues();
    const { x, y, rotation, scale } = state.transform;
    root.setAttribute("transform", `translate(${x} ${y}) rotate(${rotation}) scale(${scale})`);
    head.setAttribute("transform", `translate(0 -254) rotate(${state.headTilt})`);
    $("#torso").setAttribute("fill", state.shirtColor);
    $("#torso").setAttribute("stroke", state.outlineColor);
    $$("#characterArt path,#characterArt circle,#characterArt ellipse").forEach(node => {
      if (node.id !== "torso" && node.closest("#headGroup")) node.setAttribute("stroke", state.outlineColor);
    });
    renderExpression();
    renderMouth();
    renderArms();
    updateTransport();
    syncInspector();
  }

  function renderExpression() {
    const brows = $("#brows");
    const eyes = $("#eyesGroup");
    const eyeNodes = $$("ellipse", eyes);
    const shapes = {
      neutral: "M-36 -22 Q-22 -29 -10 -22 M10 -22 Q24 -29 36 -22",
      happy: "M-36 -22 Q-22 -30 -10 -22 M10 -22 Q24 -30 36 -22",
      sad: "M-36 -17 Q-22 -28 -10 -20 M10 -20 Q24 -28 36 -17",
      surprised: "M-36 -27 Q-22 -32 -10 -27 M10 -27 Q24 -32 36 -27",
      angry: "M-36 -28 L-10 -18 M10 -18 L36 -28",
      blink: "M-35 -4 Q-22 -1 -10 -4 M10 -4 Q24 -1 35 -4"
    };
    brows.setAttribute("d", shapes[state.expression] || shapes.neutral);
    eyeNodes.forEach(eye => {
      eye.setAttribute("ry", state.expression === "blink" ? 1.4 : state.expression === "surprised" ? 10 : 8);
    });
    $$(".expression").forEach(button => button.classList.toggle("active", button.dataset.expression === state.expression));
  }

  function renderMouth() {
    const amount = clamp(state.mouth, 0, 100) / 100;
    if (amount > .08) {
      mouth.setAttribute("d", `M-14 27 Q0 ${27 + amount * 29} 14 27 Q0 ${32 + amount * 24} -14 27Z`);
      mouth.setAttribute("fill", "#7c3e48");
    } else {
      const expressions = {
        neutral: "M-14 29 Q0 37 14 29",
        happy: "M-18 25 Q0 46 18 25",
        sad: "M-17 37 Q0 20 17 37",
        surprised: "M-8 27 Q0 22 8 27 Q12 42 0 45 Q-12 42 -8 27Z",
        angry: "M-15 32 L15 32",
        blink: "M-14 29 Q0 37 14 29"
      };
      mouth.setAttribute("d", expressions[state.expression] || expressions.neutral);
      mouth.setAttribute("fill", state.expression === "surprised" ? "#7c3e48" : "none");
    }
  }

  function renderArms() {
    const amount = state.armRaise;
    const leftY = -113 - amount * .9;
    const rightY = -113 - amount * .9;
    const leftX = -86 - Math.max(0, amount) * .25;
    const rightX = 86 + Math.max(0, amount) * .25;
    $("#armLeft").setAttribute("d", `M-48 -190 Q-87 ${-162 - amount * .55} ${leftX} ${leftY}`);
    $("#armRight").setAttribute("d", `M48 -190 Q87 ${-162 - amount * .55} ${rightX} ${rightY}`);
    $$("circle", $("#handsGroup"))[0].setAttribute("cx", leftX);
    $$("circle", $("#handsGroup"))[0].setAttribute("cy", leftY + 4);
    $$("circle", $("#handsGroup"))[1].setAttribute("cx", rightX);
    $$("circle", $("#handsGroup"))[1].setAttribute("cy", rightY + 4);
  }

  function syncInspector() {
    $("#posX").value = Math.round(state.transform.x);
    $("#posY").value = Math.round(state.transform.y);
    $("#rotation").value = Math.round(state.transform.rotation);
    $("#scale").value = Number(state.transform.scale.toFixed(2));
    $("#tilt").value = state.headTilt;
    $("#tiltValue").textContent = `${state.headTilt}°`;
    $("#armRaise").value = state.armRaise;
    $("#armValue").textContent = `${state.armRaise}%`;
    $("#mouthOpen").value = state.mouth;
    $("#mouthValue").textContent = `${state.mouth}%`;
    $("#shirtColor").value = state.shirtColor;
    $("#outlineColor").value = state.outlineColor;
    $("#characterName").value = state.characterName;
  }

  function updateTransport() {
    const seconds = state.frame / state.fps;
    const hh = String(Math.floor(seconds / 3600)).padStart(2, "0");
    const mm = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
    const ss = String(Math.floor(seconds % 60)).padStart(2, "0");
    const ff = String(state.frame % state.fps).padStart(2, "0");
    $("#timecode").textContent = `${hh}:${mm}:${ss}:${ff}`;
    $("#frameReadout").textContent = `Frame ${String(state.frame + 1).padStart(3, "0")} / ${String(TOTAL_FRAMES).padStart(3, "0")}`;
    $("#playBtn").textContent = state.playing ? "Ⅱ" : "▶";
    const left = state.frame / (TOTAL_FRAMES - 1) * 100;
    playhead.style.left = `${left}%`;
  }

  function setFrame(frame) {
    state.frame = clamp(Math.round(frame), 0, TOTAL_FRAMES - 1);
    renderFrame();
    updateTimelineCursor();
  }

  function updateTimelineCursor() {
    const left = state.frame / (TOTAL_FRAMES - 1) * 100;
    playhead.style.left = `${left}%`;
  }

  function addKey(track = state.selectedTrack) {
    pushHistory();
    let value;
    if (track === "transform") value = clone(state.transform);
    else if (track === "face") value = { expression: state.expression, mouth: state.mouth, headTilt: state.headTilt };
    else value = { action: "pose", armRaise: state.armRaise };
    const keys = state.keys[track] || (state.keys[track] = []);
    const existing = keys.findIndex(key => key.frame === state.frame);
    const key = { frame: state.frame, value, easing: $("#easing").value || "ease" };
    if (existing >= 0) keys[existing] = key;
    else keys.push(key);
    state.selectedKey = { track, frame: state.frame };
    markDirty("Keyframe added");
    renderTimeline();
    updateKeyCount();
    notify("Keyframe added at frame " + (state.frame + 1));
  }

  function removeSelectedKey() {
    if (!state.selectedKey) return notify("Select a keyframe first");
    pushHistory();
    const { track, frame } = state.selectedKey;
    state.keys[track] = (state.keys[track] || []).filter(key => key.frame !== frame);
    state.selectedKey = null;
    renderTimeline();
    updateKeyCount();
    markDirty();
  }

  function updateKeyCount() {
    const count = Object.values(state.keys).reduce((sum, keys) => sum + keys.length, 0);
    $("#keyCount").textContent = count + " keyframes";
  }

  function renderTimeline() {
    const width = Math.max(960, 960 * state.timelineZoom);
    lanes.style.width = width + "px";
    ruler.innerHTML = "";
    const step = Math.max(1, Math.round(24 / state.timelineZoom));
    for (let frame = 0; frame < TOTAL_FRAMES; frame += step) {
      const mark = document.createElement("span");
      mark.className = "ruler-mark";
      mark.style.left = (frame / (TOTAL_FRAMES - 1) * 100) + "%";
      mark.textContent = frame + 1;
      ruler.appendChild(mark);
    }
    $$(".track-lane", lanes).forEach(lane => {
      const track = lane.dataset.track;
      lane.innerHTML = "";
      (state.keys[track] || []).forEach(key => {
        const node = document.createElement("button");
        node.className = "keyframe " + (track === "face" ? "face" : track === "motion" ? "motion" : "");
        node.style.left = (key.frame / (TOTAL_FRAMES - 1) * 100) + "%";
        node.title = track + " · frame " + (key.frame + 1);
        node.setAttribute("aria-label", node.title);
        if (state.selectedKey?.track === track && state.selectedKey?.frame === key.frame) node.classList.add("selected");
        node.addEventListener("click", event => {
          event.stopPropagation();
          state.selectedKey = { track, frame: key.frame };
          state.selectedTrack = track;
          setFrame(key.frame);
          renderTimeline();
        });
        lane.appendChild(node);
      });
    });
    const audioLane = $('[data-track="audio"]');
    if (state.audioDuration) {
      const clip = document.createElement("div");
      clip.className = "audio-clip";
      clip.style.width = Math.min(100, state.audioDuration / state.duration * 100) + "%";
      clip.textContent = "♫ " + state.audioName;
      audioLane.appendChild(clip);
    }
    updateTimelineCursor();
    updateKeyCount();
  }

  function changeTool(tool) {
    state.tool = tool;
    $$(".tool").forEach(button => button.classList.toggle("active", button.dataset.tool === tool));
    $("#boneOverlay").setAttribute("opacity", tool === "bone" ? "1" : "0");
    $("#selectionOverlay").setAttribute("opacity", tool === "select" ? "1" : "0");
    const hints = {
      select: "SELECT TOOL · DRAG TO MOVE CHARACTER",
      move: "MOVE TOOL · DRAG THE CHARACTER TO REPOSITION",
      bone: "BONE TOOL · RIG OVERLAY PREVIEW",
      draw: "DRAW TOOL · IMPORT SVG ARTWORK TO BEGIN",
      text: "TEXT TOOL · TEXT LAYER SUPPORT COMING NEXT",
      audio: "AUDIO TOOL · USE THE AUDIO INSPECTOR"
    };
    $("#stageHint").textContent = hints[tool] || hints.select;
  }

  function setExpression(expression) {
    pushHistory();
    state.expression = expression;
    if (expression === "blink") state.mouth = 0;
    renderFrame();
    markDirty();
  }

  function setTransformField(key, value) {
    const number = Number(value);
    if (!Number.isFinite(number)) return;
    pushHistory();
    state.transform[key] = key === "scale" ? clamp(number, .2, 3) : key === "x" || key === "y" ? clamp(number, -1000, 2000) : clamp(number, -360, 360);
    renderFrame();
    markDirty();
  }

  function buildAction(action) {
    pushHistory();
    const start = state.frame;
    const add = (track, offset, value) => {
      const keys = state.keys[track] || (state.keys[track] = []);
      keys.push({ frame: clamp(start + offset, 0, TOTAL_FRAMES - 1), value: clone(value), easing: "ease" });
    };
    if (action === "wave") {
      add("motion", 0, { action: "wave", armRaise: 0 });
      add("motion", 8, { action: "wave", armRaise: 58 });
      add("motion", 18, { action: "wave", armRaise: 32 });
      add("motion", 28, { action: "wave", armRaise: 58 });
      add("motion", 42, { action: "wave", armRaise: 0 });
      state.armRaise = 0;
    } else if (action === "walk") {
      for (let i = 0; i <= 6; i++) add("transform", i * 12, { ...state.transform, x: state.transform.x + (i % 2 ? 14 : -14), y: state.transform.y + (i % 2 ? -4 : 4), rotation: i % 2 ? 2 : -2 });
      add("transform", 72, clone(state.transform));
    } else if (action === "nod") {
      add("face", 0, { expression: state.expression, mouth: state.mouth, headTilt: 0 });
      add("face", 6, { expression: state.expression, mouth: state.mouth, headTilt: 12 });
      add("face", 13, { expression: state.expression, mouth: state.mouth, headTilt: -5 });
      add("face", 22, { expression: state.expression, mouth: state.mouth, headTilt: 0 });
    } else if (action === "idle") {
      for (let i = 0; i <= 4; i++) add("transform", i * 24, { ...state.transform, y: state.transform.y + (i % 2 ? -3 : 3) });
    }
    renderTimeline();
    markDirty("Action added");
    notify("Motion keys created. Scrub the timeline to preview.");
  }

  function play() {
    if (state.playing) {
      state.playing = false;
      cancelAnimationFrame(state.raf);
      if (state.audioElement) state.audioElement.pause();
      updateTransport();
      return;
    }
    state.playing = true;
    state.lastTick = performance.now();
    if (state.audioElement && state.audioElement.paused) {
      state.audioElement.currentTime = state.frame / state.fps;
      state.audioElement.play().catch(() => {});
    }
    const tick = now => {
      if (!state.playing) return;
      const delta = Math.min(80, now - state.lastTick);
      state.lastTick = now;
      const frames = delta / 1000 * state.fps;
      const next = state.frame + frames;
      if (next >= TOTAL_FRAMES) {
        if (state.loop) state.frame = next % TOTAL_FRAMES;
        else {
          state.frame = TOTAL_FRAMES - 1;
          state.playing = false;
        }
      } else state.frame = next;
      renderFrame();
      renderTimelineCursor();
      if (state.playing) state.raf = requestAnimationFrame(tick);
      else updateTransport();
    };
    state.raf = requestAnimationFrame(tick);
  }

  function renderTimelineCursor() {
    const left = state.frame / (TOTAL_FRAMES - 1) * 100;
    playhead.style.left = left + "%";
  }

  function stopPlayback() {
    state.playing = false;
    cancelAnimationFrame(state.raf);
    if (state.audioElement) state.audioElement.pause();
    updateTransport();
  }

  function saveProject() {
    const project = {
      format: "matudi-animation-project",
      version: 1,
      name: state.projectName,
      fps: state.fps,
      duration: state.duration,
      character: {
        name: state.characterName,
        transform: state.transform,
        shirtColor: state.shirtColor,
        outlineColor: state.outlineColor
      },
      keys: state.keys,
      audio: state.audioName ? { name: state.audioName, duration: state.audioDuration } : null
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
    setSaved();
    notify("Project saved in this browser.");
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function exportProject() {
    const project = {
      format: "matudi-animation-project",
      version: 1,
      name: state.projectName,
      fps: state.fps,
      duration: state.duration,
      character: { name: state.characterName, transform: state.transform, shirtColor: state.shirtColor, outlineColor: state.outlineColor },
      keys: state.keys
    };
    downloadBlob(new Blob([JSON.stringify(project, null, 2)], { type: "application/json" }), "matudi-animation-project.json");
    notify("Editable project data exported.");
  }

  function exportSVG() {
    const svg = stage.cloneNode(true);
    svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    ["onionGhost", "selectionOverlay", "boneOverlay"].forEach(id => $("#" + id, svg)?.remove());
    downloadBlob(new Blob([new XMLSerializer().serializeToString(svg)], { type: "image/svg+xml" }), "matudi-frame-" + (state.frame + 1) + ".svg");
    notify("SVG frame exported.");
  }

  function exportPNG() {
    const svg = stage.cloneNode(true);
    svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    ["onionGhost", "selectionOverlay", "boneOverlay"].forEach(id => $("#" + id, svg)?.remove());
    const source = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 1920;
      canvas.height = 1080;
      const context = canvas.getContext("2d");
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(png => downloadBlob(png, "matudi-frame-" + (state.frame + 1) + ".png"), "image/png");
      URL.revokeObjectURL(url);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      notify("PNG export failed. Try SVG instead.");
    };
    image.src = url;
  }

  function importProject(file) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const project = JSON.parse(reader.result);
        if (project.format !== "matudi-animation-project" || !project.keys) throw new Error("Unsupported project file");
        pushHistory();
        state.projectName = project.name || "Imported Project";
        state.fps = project.fps || FRAME_RATE;
        state.duration = project.duration || 10;
        state.characterName = project.character?.name || "Matudi";
        state.transform = { ...state.transform, ...(project.character?.transform || {}) };
        state.shirtColor = project.character?.shirtColor || state.shirtColor;
        state.outlineColor = project.character?.outlineColor || state.outlineColor;
        state.keys = project.keys;
        $("#projectName").textContent = state.projectName;
        renderTimeline();
        renderFrame();
        markDirty("Imported project");
        notify("Project imported.");
      } catch (error) {
        notify(error.message || "Could not read this project.");
      }
    };
    reader.readAsText(file);
  }

  function importBackground(file) {
    if (!file) return;
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      state.backgroundUrl = url;
      state.backgroundImage = image;
      const old = $("#uploadedBackground");
      old?.remove();
      const svgImage = document.createElementNS("http://www.w3.org/2000/svg", "image");
      svgImage.setAttribute("id", "uploadedBackground");
      svgImage.setAttribute("href", url);
      svgImage.setAttribute("x", "0");
      svgImage.setAttribute("y", "0");
      svgImage.setAttribute("width", "960");
      svgImage.setAttribute("height", "540");
      svgImage.setAttribute("preserveAspectRatio", "xMidYMid slice");
      $("#backgroundArt").appendChild(svgImage);
      markDirty("Background imported");
      notify("Background image added.");
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      notify("Could not load this image.");
    };
    image.src = url;
  }

  function importAudio(file) {
    if (!file) return;
    if (state.audioUrl) URL.revokeObjectURL(state.audioUrl);
    state.audioUrl = URL.createObjectURL(file);
    state.audioName = file.name;
    const audio = new Audio(state.audioUrl);
    audio.preload = "metadata";
    audio.volume = state.audioVolume;
    audio.addEventListener("loadedmetadata", () => {
      state.audioDuration = Number.isFinite(audio.duration) ? audio.duration : 0;
      state.audioElement = audio;
      $("#audioName").textContent = state.audioName;
      $("#audioDuration").textContent = formatDuration(state.audioDuration);
      $("#audioInfo").classList.remove("hidden");
      $("#audioDrop").classList.add("hidden");
      $("#audioAssetLabel").textContent = formatDuration(state.audioDuration) + " · Local audio";
      renderTimeline();
      markDirty("Audio imported");
      notify("Audio loaded locally.");
    }, { once: true });
    audio.addEventListener("error", () => notify("Audio format could not be loaded."));
  }

  function formatDuration(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return String(mins).padStart(2, "0") + ":" + String(secs).padStart(2, "0");
  }

  function fitStage() {
    state.zoom = 1;
    $("#zoomLabel").textContent = "100%";
    stage.style.transform = "";
  }

  function setZoom(amount) {
    state.zoom = clamp(amount, .5, 1.6);
    stage.style.transform = "scale(" + state.zoom + ")";
    $("#zoomLabel").textContent = Math.round(state.zoom * 100) + "%";
  }

  function bindRange(id, key, output, suffix = "%") {
    const input = $("#" + id);
    input.addEventListener("input", () => {
      state[key] = Number(input.value);
      $(output).textContent = input.value + suffix;
      renderFrame();
      markDirty();
    });
    input.addEventListener("change", pushHistory);
  }

  function bindUI() {
    $("#playBtn").addEventListener("click", play);
    $("#firstFrame").addEventListener("click", () => { stopPlayback(); setFrame(0); });
    $("#lastFrame").addEventListener("click", () => { stopPlayback(); setFrame(TOTAL_FRAMES - 1); });
    $("#prevFrame").addEventListener("click", () => setFrame(state.frame - 1));
    $("#nextFrame").addEventListener("click", () => setFrame(state.frame + 1));
    $("#loopBtn").addEventListener("click", () => {
      state.loop = !state.loop;
      $("#loopBtn").classList.toggle("active", state.loop);
    });
    $("#addKey").addEventListener("click", () => addKey());
    $("#deleteKey").addEventListener("click", removeSelectedKey);
    $("#undoBtn").addEventListener("click", undo);
    $("#redoBtn").addEventListener("click", redo);
    $("#saveBtn").addEventListener("click", saveProject);
    $("#exportBtn").addEventListener("click", () => $("#exportModal").classList.remove("hidden"));
    $("#closeExport").addEventListener("click", () => $("#exportModal").classList.add("hidden"));
    $("#exportModal").addEventListener("click", event => {
      if (event.target.id === "exportModal") $("#exportModal").classList.add("hidden");
    });
    $$(".export-option").forEach(button => button.addEventListener("click", () => {
      $("#exportModal").classList.add("hidden");
      if (button.dataset.export === "json") exportProject();
      if (button.dataset.export === "svg") exportSVG();
      if (button.dataset.export === "png") exportPNG();
    }));
    $("#renameProject").addEventListener("click", () => {
      const name = prompt("Project name", state.projectName);
      if (name?.trim()) {
        state.projectName = name.trim();
        $("#projectName").textContent = state.projectName;
        markDirty();
      }
    });
    $("#addAsset").addEventListener("click", () => $("#assetInput").click());
    $("#assetInput").addEventListener("change", event => importBackground(event.target.files[0]));
    $("#audioImportBtn").addEventListener("click", () => $("#audioInput").click());
    $("#audioInput").addEventListener("change", event => importAudio(event.target.files[0]));
    $("#removeAudio").addEventListener("click", () => {
      stopPlayback();
      if (state.audioUrl) URL.revokeObjectURL(state.audioUrl);
      state.audioUrl = null; state.audioElement = null; state.audioName = ""; state.audioDuration = 0;
      $("#audioInfo").classList.add("hidden"); $("#audioDrop").classList.remove("hidden");
      $("#audioAssetLabel").textContent = "No audio loaded";
      renderTimeline(); markDirty();
    });
    $("#audioVolume").addEventListener("input", event => {
      state.audioVolume = Number(event.target.value) / 100;
      $("#volumeValue").textContent = event.target.value + "%";
      if (state.audioElement) state.audioElement.volume = state.audioVolume;
    });
    $("#timelineZoomIn").addEventListener("click", () => { state.timelineZoom = clamp(state.timelineZoom + .15, .5, 2); renderTimeline(); });
    $("#timelineZoomOut").addEventListener("click", () => { state.timelineZoom = clamp(state.timelineZoom - .15, .5, 2); renderTimeline(); });
    $("#gridToggle").addEventListener("click", () => $("#stageGrid").classList.toggle("hidden"));
    $("#onionToggle").addEventListener("click", () => {
      const ghost = $("#onionGhost");
      ghost.setAttribute("opacity", ghost.getAttribute("opacity") === "0" ? ".12" : "0");
    });
    $("#fitStage").addEventListener("click", fitStage);
    $("#zoomIn").addEventListener("click", () => setZoom(state.zoom + .1));
    $("#zoomOut").addEventListener("click", () => setZoom(state.zoom - .1));
    $("#addTrack").addEventListener("click", () => {
      const name = prompt("New track name");
      if (!name?.trim()) return;
      const track = "custom" + (state.customTracks.length + 1);
      state.customTracks.push({ id: track, name: name.trim() });
      state.keys[track] = [];
      const label = document.createElement("div");
      label.className = "track-label";
      label.innerHTML = '<span class="track-color violet"></span>' + name.replace(/[<>&"]/g, "");
      $("#trackLabels").appendChild(label);
      const lane = document.createElement("div");
      lane.className = "track-lane";
      lane.dataset.track = track;
      lanes.appendChild(lane);
      renderTimeline();
      notify("Track created.");
    });
    $("#addLayer").addEventListener("click", () => notify("Layer creation will be enabled with the vector drawing tools."));
    $("#resetCharacter").addEventListener("click", () => {
      pushHistory();
      state.transform = { x: 480, y: 410, rotation: 0, scale: 1 };
      state.headTilt = 0; state.armRaise = 0; state.mouth = 0; state.expression = "neutral";
      renderFrame(); markDirty();
    });
    $("#posX").addEventListener("change", event => setTransformField("x", event.target.value));
    $("#posY").addEventListener("change", event => setTransformField("y", event.target.value));
    $("#rotation").addEventListener("change", event => setTransformField("rotation", event.target.value));
    $("#scale").addEventListener("change", event => setTransformField("scale", event.target.value));
    bindRange("tilt", "headTilt", "#tiltValue", "°");
    bindRange("armRaise", "armRaise", "#armValue");
    bindRange("mouthOpen", "mouth", "#mouthValue");
    $("#shirtColor").addEventListener("input", event => { state.shirtColor = event.target.value; renderFrame(); markDirty(); });
    $("#outlineColor").addEventListener("input", event => { state.outlineColor = event.target.value; renderFrame(); markDirty(); });
    $("#characterName").addEventListener("change", event => { state.characterName = event.target.value.trim() || "Matudi"; markDirty(); });
    $$(".expression").forEach(button => button.addEventListener("click", () => setExpression(button.dataset.expression)));
    $$(".action-card").forEach(button => button.addEventListener("click", () => buildAction(button.dataset.action)));
    $$(".tool").forEach(button => button.addEventListener("click", () => changeTool(button.dataset.tool)));
    $$(".inspector-tab").forEach(button => button.addEventListener("click", () => {
      $$(".inspector-tab").forEach(tab => tab.classList.toggle("active", tab === button));
      ["properties", "motion", "audio"].forEach(tab => $("#" + tab + "Tab").classList.toggle("hidden", tab !== button.dataset.tab));
    }));
    $$(".key-dot").forEach(button => button.addEventListener("click", () => addKey(button.dataset.key)));
    $$(".asset-row").forEach(button => button.addEventListener("click", () => {
      $$(".asset-row").forEach(row => row.classList.remove("selected"));
      button.classList.add("selected");
      if (button.dataset.asset === "audio") {
        $$('.inspector-tab[data-tab="audio"]')[0].click();
      }
    }));
    $$(".layer-row").forEach(button => button.addEventListener("click", () => {
      $$(".layer-row").forEach(row => row.classList.remove("selected"));
      button.classList.add("selected");
      state.selectedLayer = button.dataset.layer;
    }));
    timelineScroll.addEventListener("pointerdown", event => {
      if (event.target.closest(".keyframe")) return;
      const rect = timelineScroll.getBoundingClientRect();
      const x = event.clientX - rect.left + timelineScroll.scrollLeft;
      const frame = x / (timelineScroll.scrollWidth || 1) * TOTAL_FRAMES;
      setFrame(frame);
    });
    timelineScroll.addEventListener("pointermove", event => {
      if (!(event.buttons & 1)) return;
      const rect = timelineScroll.getBoundingClientRect();
      const x = event.clientX - rect.left + timelineScroll.scrollLeft;
      setFrame(x / (timelineScroll.scrollWidth || 1) * TOTAL_FRAMES);
    });
    stage.addEventListener("pointerdown", event => {
      if (state.tool !== "select" && state.tool !== "move") return;
      const rect = stage.getBoundingClientRect();
      state.drag = { startX: event.clientX, startY: event.clientY, originX: state.transform.x, originY: state.transform.y, width: rect.width, height: rect.height };
      stage.setPointerCapture(event.pointerId);
    });
    stage.addEventListener("pointermove", event => {
      if (!state.drag || !(event.buttons & 1)) return;
      const dx = (event.clientX - state.drag.startX) / state.drag.width * 960;
      const dy = (event.clientY - state.drag.startY) / state.drag.height * 540;
      state.transform.x = state.drag.originX + dx;
      state.transform.y = state.drag.originY + dy;
      renderFrame();
    });
    stage.addEventListener("pointerup", () => {
      if (state.drag) { state.drag = null; markDirty(); }
    });
    $("#fps").addEventListener("change", event => { state.fps = Number(event.target.value); updateTransport(); markDirty(); });
    $("#duration").addEventListener("change", event => { state.duration = clamp(Number(event.target.value) || 10, 1, 30); markDirty(); });
  }

  function bindKeyboard() {
    document.addEventListener("keydown", event => {
      const tag = document.activeElement?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (event.code === "Space") { event.preventDefault(); play(); }
      if (event.key.toLowerCase() === "k") addKey();
      if (event.key === "ArrowLeft") setFrame(state.frame - (event.shiftKey ? 10 : 1));
      if (event.key === "ArrowRight") setFrame(state.frame + (event.shiftKey ? 10 : 1));
      if (event.ctrlKey && event.key.toLowerCase() === "z") { event.preventDefault(); undo(); }
      if (event.ctrlKey && event.key.toLowerCase() === "y") { event.preventDefault(); redo(); }
      if (event.key.toLowerCase() === "v") changeTool("select");
      if (event.key.toLowerCase() === "g") changeTool("move");
      if (event.key.toLowerCase() === "b") changeTool("bone");
      if (event.key.toLowerCase() === "p") changeTool("draw");
      if (event.key === "Escape") $("#exportModal").classList.add("hidden");
    });
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stopPlayback();
    });
    window.addEventListener("beforeunload", event => {
      if (state.dirty) { event.preventDefault(); event.returnValue = ""; }
    });
  }

  function restoreLocalProject() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const project = JSON.parse(raw);
      if (project.format !== "matudi-animation-project") return;
      state.projectName = project.name || state.projectName;
      state.fps = project.fps || FRAME_RATE;
      state.duration = project.duration || 10;
      state.characterName = project.character?.name || "Matudi";
      state.transform = { ...state.transform, ...(project.character?.transform || {}) };
      state.shirtColor = project.character?.shirtColor || state.shirtColor;
      state.outlineColor = project.character?.outlineColor || state.outlineColor;
      state.keys = project.keys || state.keys;
      $("#projectName").textContent = state.projectName;
      notify("Recovered your last local project.");
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  function initialize() {
    bindUI();
    bindKeyboard();
    restoreLocalProject();
    renderTimeline();
    renderFrame();
    updateHistoryButtons();
    setSaved();
    changeTool("select");
    if (!localStorage.getItem(STORAGE_KEY)) {
      state.keys.transform = [{ frame: 0, value: clone(state.transform), easing: "ease" }];
      state.keys.face = [{ frame: 0, value: { expression: "neutral", mouth: 0, headTilt: 0 }, easing: "ease" }];
      renderTimeline();
    }
  }

  initialize();
})();