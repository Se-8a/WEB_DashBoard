function getVideo() {
  return document.querySelector("video");
}

function getMediaState() {
  const video = getVideo();
  if (!video) {
    return {
      available: false,
      title: document.title || "",
      url: location.href
    };
  }

  const title = document.querySelector("h1.ytd-watch-metadata")?.textContent?.trim()
    || document.querySelector("h1.title")?.textContent?.trim()
    || document.title.replace(/\s*-\s*YouTube.*$/i, "").trim();

  const artist = document.querySelector("ytd-channel-name a")?.textContent?.trim()
    || document.querySelector("yt-formatted-string.ytmusic-player-bar-byline")?.textContent?.trim()
    || "";

  let artwork = "";

  // YouTube Music: use the image currently displayed by the player bar first.
  if (location.hostname === "music.youtube.com") {
    const playerImages = [
      document.querySelector("ytmusic-player-bar img"),
      document.querySelector("ytmusic-player img"),
      document.querySelector("ytmusic-player-bar yt-img-shadow img")
    ];
    artwork = playerImages.find(img => img?.currentSrc || img?.src)?.currentSrc
      || playerImages.find(img => img?.src)?.src
      || "";
  }

  // Normal YouTube: derive the thumbnail from the current video ID.
  // This avoids stale og:image values during SPA navigation.
  if (!artwork) {
    const videoId = new URL(location.href).searchParams.get("v");
    if (videoId && /^[A-Za-z0-9_-]{6,20}$/.test(videoId)) {
      artwork = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
    }
  }

  // Final fallback for pages where the player image / video ID is unavailable.
  if (!artwork) {
    artwork = document.querySelector('meta[property="og:image"]')?.content || "";
  }

  return {
    available: true,
    title,
    artist,
    currentTime: Number(video.currentTime) || 0,
    duration: Number(video.duration) || 0,
    paused: video.paused,
    ended: video.ended,
    url: location.href,
    artwork
  };
}

async function control(command, value) {
  const video = getVideo();
  if (!video) throw new Error("video要素が見つかりません。");

  switch (command) {
    case "play":
      await video.play();
      break;
    case "pause":
      video.pause();
      break;
    case "playPause":
      if (video.paused) await video.play();
      else video.pause();
      break;
    case "seek":
      video.currentTime = Math.max(0, Math.min(Number(value) || 0, video.duration || Infinity));
      break;
    case "next": {
      const button = document.querySelector(".ytp-next-button")
        || document.querySelector("ytmusic-player-bar #next-button");
      if (button) button.click();
      else throw new Error("次へボタンが見つかりません。");
      break;
    }
    case "previous": {
      const button = document.querySelector(".ytp-prev-button")
        || document.querySelector("ytmusic-player-bar #previous-button");
      if (button) button.click();
      else {
        video.currentTime = 0;
      }
      break;
    }
    default:
      throw new Error(`Unknown command: ${command}`);
  }

  return getMediaState();
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  (async () => {
    try {
      if (message?.type === "neon.contentGetMedia") {
        sendResponse({ ok: true, media: getMediaState() });
        return;
      }

      if (message?.type === "neon.contentControl") {
        const media = await control(message.command, message.value);
        sendResponse({ ok: true, media });
        return;
      }

      sendResponse({ ok: false, error: "Unknown content message" });
    } catch (error) {
      sendResponse({ ok: false, error: String(error?.message || error) });
    }
  })();
  return true;
});
