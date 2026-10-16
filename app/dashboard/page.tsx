import type { Metadata } from "next";
import { ADMIN_SECTIONS } from "@/lib/admin-sections";

export const metadata: Metadata = { title: `${ADMIN_SECTIONS.home.title} | PLF Admin` };

// The dashboard layout renders the admin panel; the active section comes from the URL.
export default function DashboardHomePage() {
  return null;
}
