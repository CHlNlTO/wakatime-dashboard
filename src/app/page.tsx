// src/app/page.tsx
import { redirect } from "next/navigation";

export default function HomePage() {
  // Redirect to dashboard since this is a dashboard app
  redirect("/dashboard");
}
