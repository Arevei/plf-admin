import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ADMIN_SECTIONS, sectionFromSlug } from "@/lib/admin-sections";

type Props = { params: Promise<{ section: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const section = sectionFromSlug((await params).section);
  return { title: `${section ? ADMIN_SECTIONS[section].title : "Dashboard"} | PLF Admin` };
}

// The dashboard layout renders the admin panel; this route only validates the section slug.
export default async function DashboardSectionPage({ params }: Props) {
  if (!sectionFromSlug((await params).section)) redirect("/dashboard");
  return null;
}
