export type AdminSection =
  | "home"
  | "members"
  | "donations"
  | "analytics"
  | "referrals"
  | "receipts"
  | "enquiries"
  | "broadcasts"
  | "news"
  | "campaigns"
  | "gallery"
  | "visitorCertificates"
  | "siteSettings";

type SectionConfig = { slug: string; label: string; title: string; description: string };

export const ADMIN_SECTIONS: Record<AdminSection, SectionConfig> = {
  home: { slug: "", label: "Dashboard", title: "Dashboard", description: "Overview of members, donations and recent activity." },
  analytics: { slug: "analytics", label: "Analytics", title: "Analytics", description: "Donation trends and campaign performance." },
  members: { slug: "members", label: "Members", title: "Membership Management", description: "Approve, activate and manage PLF members." },
  donations: { slug: "donations", label: "Donations", title: "Donation Management", description: "Record donations, review payments and issue receipts." },
  referrals: { slug: "referrals", label: "Referral Tracking", title: "Referral Tracking", description: "Track member referrals and award achievement certificates." },
  receipts: { slug: "receipts", label: "Receipts", title: "Receipt Dashboard", description: "Find and download membership and donation receipts." },
  visitorCertificates: { slug: "visitor-certificates", label: "Visitor Certificates", title: "Visitor Certificates", description: "Issue and manage certificates for visitors and participants." },
  campaigns: { slug: "campaigns", label: "Campaigns", title: "Campaign Management", description: "Create and update crowdfunding campaigns." },
  news: { slug: "news", label: "News", title: "News Management", description: "Publish and edit news articles." },
  gallery: { slug: "activity-posts", label: "Activity Posts", title: "Activity Posts", description: "Share photos and videos from PLF activities." },
  enquiries: { slug: "enquiries", label: "Enquiries", title: "Enquiry Management", description: "Reply to messages sent through the website." },
  broadcasts: { slug: "member-messages", label: "Member Messages", title: "Member Messages", description: "Publish announcements shown to members." },
  siteSettings: { slug: "settings", label: "Site Settings", title: "Site Settings", description: "Language and payment settings for the website." },
};

export const ADMIN_NAV_GROUPS: Array<{ label: string; items: AdminSection[] }> = [
  { label: "Overview", items: ["home", "analytics"] },
  { label: "People & Money", items: ["members", "donations", "referrals", "receipts", "visitorCertificates"] },
  { label: "Content", items: ["campaigns", "news", "gallery", "enquiries", "broadcasts"] },
  { label: "Settings", items: ["siteSettings"] },
];

export function sectionHref(section: AdminSection) {
  const { slug } = ADMIN_SECTIONS[section];
  return slug ? `/dashboard/${slug}` : "/dashboard";
}

export function sectionFromSlug(slug: string | undefined): AdminSection | null {
  if (!slug) return "home";
  const match = (Object.keys(ADMIN_SECTIONS) as AdminSection[]).find((key) => ADMIN_SECTIONS[key].slug === slug);
  return match ?? null;
}

export function sectionFromPathname(pathname: string | null): AdminSection {
  const slug = pathname?.replace(/^\/dashboard\/?/, "").split("/")[0];
  return sectionFromSlug(slug) ?? "home";
}
