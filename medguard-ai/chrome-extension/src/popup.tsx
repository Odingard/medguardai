import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

import {
  demoPayload,
  detectEhr,
  EHR_NOTE_TEMPLATES,
  formatSoapForEhr,
  getExtensionSettings,
  type EhrNoteTemplate,
  type MedGuardPushPayload,
} from "./shared";
import "./popup.css";

type LatestNoteResponse = {
  payload?: MedGuardPushPayload;
  formatted?: string;
  source?: "api" | "demo";
};

function Popup() {
  const [ehrName, setEhrName] = useState("Checking EHR...");
  const [payload, setPayload] = useState<MedGuardPushPayload>(demoPayload);
  const [source, setSource] = useState<"api" | "demo">("demo");
  const [selectedTemplate, setSelectedTemplate] = useState<EhrNoteTemplate>("soap");
  const [appUrl, setAppUrl] = useState("http://localhost:3000");
  const [message, setMessage] = useState(
    "MVP mode copies or inserts formatted SOAP text. Review before signing.",
  );

  useEffect(() => {
    async function initialize() {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      const url = tabs[0]?.url ? new URL(tabs[0].url) : null;
      const ehr = url ? detectEhr(url.hostname) : null;
      const settings = await getExtensionSettings();
      const latest = (await chrome.runtime.sendMessage({
        type: "MEDGUARD_GET_LATEST_NOTE",
      })) as LatestNoteResponse;

      setEhrName(ehr ? `Detected: ${ehr.name}` : "Unsupported EHR page");
      setPayload(latest?.payload ?? demoPayload);
      setSource(latest?.source ?? "demo");
      setAppUrl(settings.medguardAppUrl);
    }

    initialize();
  }, []);

  async function copyNote() {
    await navigator.clipboard.writeText(formatSoapForEhr(payload, selectedTemplate));
    setMessage("Formatted SOAP note copied to clipboard.");
  }

  async function pushToEhr() {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const tabId = tabs[0]?.id;

    if (!tabId) {
      setMessage("No active tab detected.");
      return;
    }

    await chrome.scripting.executeScript({
      target: { tabId },
      func: () => {
        document.getElementById("medguard-ehr-push-button")?.click();
      },
    });
    setMessage("Push simulated. If no field was detected, the note was copied.");
  }

  return (
    <main className="popup-shell">
      <header className="popup-header">
        <div className="logo">MG</div>
        <div>
          <h1>MedGuard AI</h1>
          <p>EHR Push</p>
        </div>
      </header>

      <section className="status-card">
        <span className="badge">{ehrName}</span>
        <h2>{payload.patient.name}</h2>
        <p>{payload.latestNote.title}</p>
        <p className="source">Source: {source === "api" ? "MedGuard API" : "Demo fallback"}</p>
      </section>

      <label className="template-label" htmlFor="note-template">
        Copy as Formatted Note
      </label>
      <select
        id="note-template"
        className="template-select"
        value={selectedTemplate}
        onChange={(event) => setSelectedTemplate(event.target.value as EhrNoteTemplate)}
      >
        {EHR_NOTE_TEMPLATES.map((template) => (
          <option key={template.id} value={template.id}>
            {template.label}
          </option>
        ))}
      </select>
      <p className="template-help">
        {EHR_NOTE_TEMPLATES.find((template) => template.id === selectedTemplate)?.description}
      </p>

      <button className="primary-button" type="button" onClick={pushToEhr}>
        Push Latest Note
      </button>
      <button className="secondary-button" type="button" onClick={copyNote}>
        Copy SOAP Note
      </button>
      <a className="link-button" href={`${appUrl}/dashboard`} target="_blank">
        Open MedGuard Dashboard
      </a>

      <p className="message">{message}</p>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(<Popup />);
