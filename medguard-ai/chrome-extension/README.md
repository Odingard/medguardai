# MedGuard AI EHR Push Chrome Extension

Manifest V3 TypeScript/React skeleton for pushing MedGuard AI patient context and SOAP notes into supported EHR workflows.

## MVP behavior

- Detects common EHR hosts:
  - Epic / EpicCare Link
  - athenahealth
  - eClinicalWorks
  - Practice Fusion
  - NextGen
  - Cerner / Oracle Health
- Shows a floating **MedGuard** button on supported EHR pages.
- Popup includes **Push Latest Note** and **Copy SOAP Note** actions.
- Uses a secure auth placeholder stored in Chrome sync storage:
  - MedGuard app URL
  - Supabase session / short-lived JWT placeholder
- Attempts to fetch latest note from `GET /api/extension/latest-note` with `Authorization: Bearer <token>`.
- Falls back to demo data until the MedGuard API endpoint is implemented.
- Attempts to insert into the first editable textarea/contenteditable element.
- Falls back to copying formatted SOAP text to clipboard.

## Build

```bash
cd chrome-extension
npm install
npm run typecheck
npm run build
```

The build output is written to `chrome-extension/dist/`.

## Local install in Chrome

1. Open Chrome and go to `chrome://extensions`.
2. Enable **Developer mode**.
3. Click **Load unpacked**.
4. Select `chrome-extension/dist/`.
5. Visit a supported EHR URL or a test page matching the manifest host permissions.

## Production path

- Implement `GET /api/extension/latest-note` in the MedGuard web app.
- Exchange Supabase session for a short-lived extension JWT.
- Add EHR-specific DOM adapters instead of generic textarea insertion.
- Add user confirmation, audit logging, and policy controls for every push.
- Package and publish through the Chrome Web Store after security review.
