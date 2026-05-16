const appUrlInput = document.getElementById("app-url");
const apiKeyInput = document.getElementById("api-key");
const saveButton = document.getElementById("save-button");
const openDashboard = document.getElementById("open-dashboard");
const message = document.getElementById("message");

async function loadOptions() {
  const options = await chrome.storage.sync.get([
    "medguardAppUrl",
    "medguardApiKey",
  ]);
  appUrlInput.value = options.medguardAppUrl ?? "http://localhost:3000";
  apiKeyInput.value = options.medguardApiKey ?? "";
  openDashboard.href = `${appUrlInput.value}/dashboard`;
}

async function saveOptions() {
  await chrome.storage.sync.set({
    medguardAppUrl: appUrlInput.value || "http://localhost:3000",
    medguardApiKey: apiKeyInput.value || "",
  });
  openDashboard.href = `${appUrlInput.value}/dashboard`;
  message.textContent = "Options saved.";
}

saveButton.addEventListener("click", saveOptions);
loadOptions();
