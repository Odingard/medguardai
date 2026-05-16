import { demoPayload, detectEhr, formatSoapForEhr } from "./shared.js";

const ehrStatus = document.getElementById("ehr-status");
const patientName = document.getElementById("patient-name");
const noteTitle = document.getElementById("note-title");
const pushButton = document.getElementById("push-button");
const copyButton = document.getElementById("copy-button");
const message = document.getElementById("message");
const openApp = document.getElementById("open-app");

async function getActiveTab() {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  return tabs[0];
}

async function getLatestNote() {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ type: "MEDGUARD_GET_LATEST_NOTE" }, resolve);
  });
}

async function initializePopup() {
  const tab = await getActiveTab();
  const url = tab?.url ? new URL(tab.url) : null;
  const ehr = url ? detectEhr(url.hostname) : null;
  const { medguardAppUrl } = await chrome.storage.sync.get("medguardAppUrl");

  if (openApp && medguardAppUrl) {
    openApp.href = `${medguardAppUrl}/dashboard`;
  }

  ehrStatus.textContent = ehr ? `Detected: ${ehr.name}` : "Unsupported EHR page";
  const latest = await getLatestNote();
  const payload = latest?.payload ?? demoPayload;
  patientName.textContent = payload.patient.name;
  noteTitle.textContent = payload.latestNote.title;
}

async function copyNote() {
  const latest = await getLatestNote();
  const formatted = latest?.formatted ?? formatSoapForEhr();
  await navigator.clipboard.writeText(formatted);
  message.textContent = "Formatted SOAP note copied to clipboard.";
}

async function pushToEhr() {
  const tab = await getActiveTab();

  if (!tab?.id) {
    message.textContent = "No active tab detected.";
    return;
  }

  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => {
      const button = document.getElementById("medguard-ehr-push-button");
      button?.click();
    },
  });
  message.textContent = "Push simulated. If no field was detected, the note was copied.";
}

copyButton.addEventListener("click", copyNote);
pushButton.addEventListener("click", pushToEhr);

initializePopup();
