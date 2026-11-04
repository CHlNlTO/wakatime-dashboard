// src/app/settings/page.tsx
// Settings now open as a modal on the dashboard. Keep old links working.
import { redirect } from "next/navigation";

export default function SettingsPage() {
  redirect("/dashboard#settings");
}
