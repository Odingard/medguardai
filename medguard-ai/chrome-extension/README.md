# MedGuard AI EHR Push Chrome Extension

Manifest V3 skeleton for pushing MedGuard AI patient context and SOAP notes into
supported EHR workflows.

## MVP behavior

- Detects common EHR hosts:
  - Epic / EpicCare Link
  - athenahealth
  - eClinicalWorks
  - Practice Fusion
  - NextGen
  - Cerner / Oracle Health
- Shows a floating **MedGuard Push** button on supported EHR pages.
- Popup includes **Push to EHR** and **Copy SOAP Note** actions.
- Uses demo patient/note payloads for now.
- Attempts to insert into the first editable textarea/contenteditable element.
- Falls back to copying formatted SOAP text to clipboard.
- Options page stores:
  - MedGuard app URL
  - MVP API key / Supabase token placeholder

## Local install

1. Open Chrome and go to `chrome://extensions`.
2. Enable **Developer mode**.
3. Click **Load unpacked**.
4. Select this `chrome-extension/` folder.
5. Visit a supported EHR URL or a test page that matches the manifest host
   permissions.

## Production path

- Replace demo payload with a secure MedGuard API call.
- Use a Supabase session token or short-lived extension API token.
- Add EHR-specific DOM adapters instead of generic textarea insertion.
- Add user confirmation and audit logging for every push.
- Package and publish through the Chrome Web Store after security review.
