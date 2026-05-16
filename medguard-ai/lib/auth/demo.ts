export const demoSessionCookieName = "medguard_demo_session";
export const demoSessionCookieValue = "enabled";

export function isDemoAuthEnabled() {
  return (
    process.env.DEMO_AUTH_ENABLED === "true" ||
    process.env.NODE_ENV === "development"
  );
}
