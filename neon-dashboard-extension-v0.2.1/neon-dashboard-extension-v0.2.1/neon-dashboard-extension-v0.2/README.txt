Neon Dashboard Media Bridge v0.2.0

Purpose:
Connect the PC Web Dashboard to a YouTube / YouTube Music tab without TCP.

Install:
1. Extract this folder.
2. Open chrome://extensions/ or edge://extensions/.
3. Enable Developer mode.
4. Choose "Load unpacked" and select this folder.
5. If the Dashboard is opened as a local file, enable "Allow access to file URLs" for this extension.
6. Reload the YouTube / YouTube Music tab and the Dashboard.

Target tab behavior:
- The last YouTube / YouTube Music tab activated in the browser becomes the target.
- Switching to the Dashboard does not change the target.
- If no remembered target exists, the extension falls back to an available YouTube tab.

The Dashboard PC build uses window.postMessage -> dashboard-bridge.js -> background.js -> content.js.
No raw TCP connection is used by the PC Dashboard.
