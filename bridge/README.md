# Motion Atelier AI Bridge

A local MCP server that lets a compatible AI client (Claude Code, Claude Desktop, Cursor, or another MCP client) inspect and edit the open Motion Atelier browser tab.

## Requirements

- Node.js 22 or newer
- Chrome, Edge, or Firefox on the same computer
- An MCP-compatible client
- Internet access for the hosted Motion Atelier page and its 3D libraries

## Install

From the repository root:

```bash
cd bridge
npm install
npm start
```

Keep the terminal open. The bridge listens only on `127.0.0.1:47821`; it is not exposed to your network.

## Connect the editor

1. Open https://motion-atelier-lab-mat-only.vercel.app in Chrome, Edge, or Firefox on the same computer.
2. Click **AI Bridge** in the editor, then **Connect**.
3. The editor shows a six-character pairing code.
4. Add this MCP server to your AI client (examples below), then ask the agent to connect using the code.
5. Approve the access request in the editor. You can disconnect at any time.

## MCP client configuration

Use the absolute path to this repository.

### Claude Desktop

Add to the MCP server configuration:

```json
{
  "mcpServers": {
    "motion-atelier": {
      "command": "node",
      "args": ["/ABSOLUTE/PATH/MAT-STUDIO/bridge/server.mjs"]
    }
  }
}
```

### Claude Code

```bash
claude mcp add motion-atelier -- node /ABSOLUTE/PATH/MAT-STUDIO/bridge/server.mjs
```

### Cursor

Add the same `command` and `args` under `mcpServers` in Cursor's MCP configuration.

## Available tools

- `editor_connect` — one-time code + explicit user approval
- `editor_status` — connection state
- `scene_summary` — active character, rig and timeline summary
- `clips_list` — animation clips and key counts
- `clip_create` — create an editable clip
- `pose_set` — set body-control keyframes at 30 fps
- `keys_read` — inspect keyframes
- `playback_control` — play, pause, stop, seek
- `save_custom_clips` — save custom clips to this browser's local storage

## Safety and limitations

- The WebSocket binds to loopback only and checks the editor origin.
- The pairing code is valid for the current server process; the editor must approve the connection.
- The editor grants read/edit access together in this first version. Disconnecting clears the pairing.
- This bridge controls the current Motion Atelier animation controls; it does not import Ekza's 40 MCP tools or provide Ekza's auto-rigging engine.
- VRMA export, automatic rigging, facial curve editing and undo-history integration are not included yet.
- Use a rigged VRM/GLB character for real skeletal motion. The built-in placeholder is only for testing.
