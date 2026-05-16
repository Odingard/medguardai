import { detectEhr, formatSoapForEhr, type MedGuardPushPayload } from "./shared";

type LatestNoteResponse = {
  payload?: MedGuardPushPayload;
  formatted?: string;
  source?: "api" | "demo";
};

const ehr = detectEhr(window.location.hostname);

function createPushButton() {
  const existingButton = document.getElementById("medguard-ehr-push-button");
  if (existingButton || !ehr) {
    return;
  }

  const button = document.createElement("button");
  button.id = "medguard-ehr-push-button";
  button.type = "button";
  button.textContent = "MedGuard Push";
  button.title = `Push latest MedGuard note into ${ehr.name}`;
  button.addEventListener("click", handlePushClick);
  document.body.appendChild(button);
}

async function getLatestNote(): Promise<LatestNoteResponse> {
  return chrome.runtime.sendMessage({ type: "MEDGUARD_GET_LATEST_NOTE" });
}

async function copyFormattedNote(formatted: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(formatted);
    return true;
  }

  const textarea = document.createElement("textarea");
  textarea.value = formatted;
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand("copy");
  textarea.remove();
  return copied;
}

function findLikelyEhrTextArea() {
  return (
    document.querySelector<HTMLTextAreaElement>(
      "textarea:not([readonly]):not([disabled])",
    ) || document.querySelector<HTMLElement>('[contenteditable="true"]')
  );
}

async function handlePushClick() {
  const button = document.getElementById("medguard-ehr-push-button");
  if (!button) {
    return;
  }

  button.textContent = "Preparing...";

  const response = await getLatestNote();
  const formatted = response?.formatted || formatSoapForEhr(response?.payload);
  const target = findLikelyEhrTextArea();

  if (target instanceof HTMLTextAreaElement) {
    target.value = `${target.value ? `${target.value}\n\n` : ""}${formatted}`;
    target.dispatchEvent(new Event("input", { bubbles: true }));
    button.textContent = "Inserted";
  } else if (target instanceof HTMLElement) {
    target.textContent = `${target.textContent ? `${target.textContent}\n\n` : ""}${formatted}`;
    target.dispatchEvent(new InputEvent("input", { bubbles: true }));
    button.textContent = "Inserted";
  } else {
    await copyFormattedNote(formatted);
    button.textContent = "Copied";
  }

  window.setTimeout(() => {
    button.textContent = "MedGuard Push";
  }, 1800);
}

createPushButton();
