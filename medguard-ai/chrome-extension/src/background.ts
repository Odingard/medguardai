import { detectEhr, fetchLatestNotePayload } from "./shared";

chrome.runtime.onInstalled.addListener(async () => {
  await chrome.storage.sync.set({
    medguardAppUrl: "http://localhost:3000",
    medguardAuthToken: "",
  });
});

chrome.runtime.onMessage.addListener((
  message: { type?: string },
  sender: chrome.runtime.MessageSender,
  sendResponse: (response?: unknown) => void,
) => {
  if (message?.type === "MEDGUARD_GET_EHR_STATUS") {
    const url = sender.tab?.url ? new URL(sender.tab.url) : null;
    const ehr = url ? detectEhr(url.hostname) : null;
    sendResponse({
      supported: Boolean(ehr),
      ehr,
    });
    return true;
  }

  if (message?.type === "MEDGUARD_GET_LATEST_NOTE") {
    fetchLatestNotePayload().then(sendResponse);
    return true;
  }

  return false;
});
