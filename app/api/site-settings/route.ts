import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getDefaultLanguage, getDonationPaymentMode, getMembershipPaymentMode, setDefaultLanguage, setDonationPaymentMode, setMembershipPaymentMode, type PaymentMode, type SiteLanguage } from "@/lib/site-settings";

export async function GET() {
  const session = await getSession();
  if (!session.isAdmin) {
    return NextResponse.json({ error: "Admin authentication required" }, { status: 401 });
  }

  const [defaultLanguage, membershipPaymentMode, donationPaymentMode] = await Promise.all([
    getDefaultLanguage(), getMembershipPaymentMode(), getDonationPaymentMode(),
  ]);
  return NextResponse.json({ defaultLanguage, membershipPaymentMode, donationPaymentMode });
}

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session.isAdmin) {
    return NextResponse.json({ error: "Admin authentication required" }, { status: 401 });
  }

  const body = (await req.json()) as { defaultLanguage?: SiteLanguage; membershipPaymentMode?: PaymentMode; donationPaymentMode?: PaymentMode };
  if (body.defaultLanguage !== "en" && body.defaultLanguage !== "hi") {
    return NextResponse.json({ error: "defaultLanguage must be 'en' or 'hi'" }, { status: 400 });
  }
  if (!body.membershipPaymentMode || !["manual", "razorpay"].includes(body.membershipPaymentMode)) {
    return NextResponse.json({ error: "membershipPaymentMode must be 'manual' or 'razorpay'" }, { status: 400 });
  }
  if (!body.donationPaymentMode || !["manual", "razorpay"].includes(body.donationPaymentMode)) {
    return NextResponse.json({ error: "donationPaymentMode must be 'manual' or 'razorpay'" }, { status: 400 });
  }

  await Promise.all([setDefaultLanguage(body.defaultLanguage), setMembershipPaymentMode(body.membershipPaymentMode), setDonationPaymentMode(body.donationPaymentMode)]);
  return NextResponse.json(body);
}
