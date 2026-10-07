let targetTabId = null;

const YOUTUBE_PATTERNS = [
  "https://www.youtube.com/*",
  "https://music.youtube.com/*"
];

function isYouTubeTab(tab) {
  return !!tab?.url && (
    tab.url.startsWith("https://www.youtube.com/") ||
    tab.url.startsWith("https://music.youtube.com/")
  );
}

async function findTargetTab() {
  if (Number.isInteger(targetTabId)) {
    const target = await chrome.tabs.get(targetTabId).catch(() => null);
    if (isYouTubeTab(target)) return target;
  }

  const tabs = await chrome.tabs.query({
    active: true,
    lastFocusedWindow: true,
    url: YOUTUBE_PATTERNS
  });

  if (tabs[0]) {
    targetTabId = tabs[0].id;
    return tabs[0];
  }

  const anyTabs = await chrome.tabs.query({ url: YOUTUBE_PATTERNS });
  const fallback = anyTabs[0] || null;
  if (fallback) targetTabId = fallback.id;
  return fallback;
}

chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  const tab = await chrome.tabs.get(tabId).catch(() => null);
  if (isYouTubeTab(tab)) targetTabId = tabId;
});

chrome.tabs.onRemoved.addListener((tabId) => {
  if (tabId === targetTabId) targetTabId = null;
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tabId === targetTabId && changeInfo.url && !isYouTubeTab(tab)) {
    targetTabId = null;
  }
});

async function sendToTarget(message) {
  const tab = await findTargetTab();
  if (!tab?.id) {
    throw new Error("YouTube / YouTube Music の対象タブが見つかりません。");
  }
  return await chrome.tabs.sendMessage(tab.id, message);
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type !== "neon.dashboardRequest") return;

  (async () => {
    try {
      if (message.command === "getTarget") {
        const tab = await findTargetTab();
        sendResponse(tab ? {
          ok: true,
          tabId: tab.id,
          title: tab.title || "",
          url: tab.url || ""
        } : { ok: false });
        return;
      }

      if (message.command === "control") {
        const result = await sendToTarget({
          type: "neon.contentControl",
          command: message.action,
          value: message.value
        });
        sendResponse(result?.ok === false ? result : { ok: true, result });
        return;
      }

      if (message.command === "getMedia") {
        const result = await sendToTarget({ type: "neon.contentGetMedia" });
        sendResponse(result?.ok === false ? result : { ok: true, result });
        return;
      }

      throw new Error("Unknown dashboard command");
    } catch (error) {
      sendResponse({ ok: false, error: String(error?.message || error) });
    }
  })();

  return true;
});
