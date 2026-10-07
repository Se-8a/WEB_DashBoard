window.addEventListener("message", (event) => {
  if (event.source !== window) return;
  const message = event.data;
  if (!message || message.source !== "neon-dashboard" || !message.requestId) return;

  chrome.runtime.sendMessage({
    type: "neon.dashboardRequest",
    command: message.type === "control" ? "control" : message.type,
    action: message.command,
    value: message.value
  }, (response) => {
    const error = chrome.runtime.lastError;
    window.postMessage({
      source: "neon-dashboard-extension",
      requestId: message.requestId,
      ok: !error && !!response?.ok,
      result: response?.result,
      error: error?.message || response?.error || "拡張機能から応答がありません。"
    }, "*");
  });
});
