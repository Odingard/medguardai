import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

import { MEDGUARD_DEFAULT_APP_URL } from "./shared";
import "./options.css";

function Options() {
  const [appUrl, setAppUrl] = useState(MEDGUARD_DEFAULT_APP_URL);
  const [authToken, setAuthToken] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadOptions() {
      const options = await chrome.storage.sync.get([
        "medguardAppUrl",
        "medguardAuthToken",
      ]);
      setAppUrl(
        typeof options.medguardAppUrl === "string"
          ? options.medguardAppUrl
          : MEDGUARD_DEFAULT_APP_URL,
      );
      setAuthToken(
        typeof options.medguardAuthToken === "string"
          ? options.medguardAuthToken
          : "",
      );
    }

    loadOptions();
  }, []);

  async function saveOptions() {
    await chrome.storage.sync.set({
      medguardAppUrl: appUrl || MEDGUARD_DEFAULT_APP_URL,
      medguardAuthToken: authToken,
    });
    setMessage("Options saved.");
  }

  return (
    <main className="options-shell">
      <section className="card">
        <h1>MedGuard AI EHR Push Options</h1>
        <p>
          Configure the MedGuard web app URL and a secure MVP auth placeholder.
          Production can replace this with a Supabase session or short-lived JWT.
        </p>

        <label htmlFor="app-url">MedGuard web app URL</label>
        <input
          id="app-url"
          type="url"
          value={appUrl}
          onChange={(event) => setAppUrl(event.target.value)}
        />

        <label htmlFor="auth-token">Supabase session / JWT placeholder</label>
        <input
          id="auth-token"
          type="password"
          value={authToken}
          onChange={(event) => setAuthToken(event.target.value)}
          placeholder="Paste test token"
        />

        <button type="button" onClick={saveOptions}>
          Save Options
        </button>
        <a href={`${appUrl}/dashboard`} target="_blank">
          Open MedGuard Dashboard
        </a>
        <p className="message">{message}</p>
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(<Options />);
