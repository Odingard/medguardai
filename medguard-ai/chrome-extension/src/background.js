import { demoPayload, detectEhr, formatSoapForEhr } from "./shared.js";

chrome.runtime.onInstalled.addListener(async () => {
  await chrome.storage.sync.set({
    medguardAppUrl: "http://localhost:3000",
    medguardApiKey: "",
  });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
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
    // MVP: return demo data. Production: call MedGuard API with Supabase token/API key.
    sendResponse({
      payload: demoPayload,
      formatted: formatSoapForEhr(demoPayload),
    });
    return true;
  }

  return false;
});
