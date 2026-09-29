import { getDb } from "@/lib/db";

export type SiteLanguage = "en" | "hi";
export type PaymentMode = "razorpay" | "manual";

type SiteSettingDoc = {
  key: string;
  value: string;
  updatedAt: Date;
};

const DEFAULT_LANGUAGE_KEY = "defaultLanguage";
const MEMBERSHIP_PAYMENT_MODE_KEY = "membershipPaymentMode";
const DONATION_PAYMENT_MODE_KEY = "donationPaymentMode";

export async function getDefaultLanguage(): Promise<SiteLanguage> {
  const db = await getDb();
  const row = await db.collection<SiteSettingDoc>("siteSettings").findOne({ key: DEFAULT_LANGUAGE_KEY });
  if (row?.value === "en" || row?.value === "hi") {
    return row.value;
  }
  return "hi";
}

export async function setDefaultLanguage(language: SiteLanguage) {
  const db = await getDb();
  await db.collection<SiteSettingDoc>("siteSettings").updateOne(
    { key: DEFAULT_LANGUAGE_KEY },
    {
      $set: {
        key: DEFAULT_LANGUAGE_KEY,
        value: language,
        updatedAt: new Date(),
      },
    },
    { upsert: true },
  );
}

async function getPaymentMode(key: string, envValue?: string): Promise<PaymentMode> {
  const db = await getDb();
  const row = await db.collection<SiteSettingDoc>("siteSettings").findOne({ key });
  if (row?.value === "manual" || row?.value === "razorpay") return row.value;
  return envValue === "manual" ? "manual" : "razorpay";
}

async function setPaymentMode(key: string, value: PaymentMode) {
  const db = await getDb();
  await db.collection<SiteSettingDoc>("siteSettings").updateOne(
    { key },
    { $set: { key, value, updatedAt: new Date() } },
    { upsert: true },
  );
}

export function getMembershipPaymentMode() {
  return getPaymentMode(MEMBERSHIP_PAYMENT_MODE_KEY, "razorpay");
}

export function getDonationPaymentMode() {
  return getPaymentMode(DONATION_PAYMENT_MODE_KEY, "razorpay");
}

export function setMembershipPaymentMode(value: PaymentMode) {
  return setPaymentMode(MEMBERSHIP_PAYMENT_MODE_KEY, value);
}

export function setDonationPaymentMode(value: PaymentMode) {
  return setPaymentMode(DONATION_PAYMENT_MODE_KEY, value);
}
