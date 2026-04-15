import posthog from "posthog-js";

posthog.init(process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN!, {
  api_host: "/ingest",
  ui_host: "https://us.posthog.com",
  defaults: "2026-01-30",
  capture_pageview: "history_change",
  capture_exceptions: true,
  autocapture: false,
  disable_session_recording: true,
  person_profiles: "identified_only",
  debug: process.env.NODE_ENV === "development",
});
