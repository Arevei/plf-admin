import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSession } from "@/lib/session";
import type { DonationDoc } from "@/lib/types";
import { sendDonationReceiptEmail } from "@/lib/email";
import { issueReferralAchievementIfEligible } from "@/lib/referral-achievement-service";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const session = await getSession();
  if (!session.isAdmin) return NextResponse.json({ error: "Admin authentication required" }, { status: 401 });
  const id = Number.parseInt((await params).id, 10);
  if (Number.isNaN(id)) return NextResponse.json({ error: "Invalid donation ID" }, { status: 400 });
  const body = (await req.json()) as { action?: "approve" | "reject" };
  if (body.action !== "approve" && body.action !== "reject") return NextResponse.json({ error: "Invalid review action" }, { status: 400 });

  const db = await getDb();
  const reviewedAt = new Date();
  const donation = await db.collection<DonationDoc>("donations").findOneAndUpdate(
    { id, status: "pending_review", "payment.status": "pending_review" },
    { $set: {
      status: body.action === "approve" ? "paid" : "rejected",
      "payment.status": body.action === "approve" ? "paid" : "rejected",
      ...(body.action === "approve" ? { "payment.paidAt": reviewedAt } : {}),
      reviewedAt,
      reviewedBy: session.adminEmail || `admin:${session.adminId || "unknown"}`,
    } },
    { returnDocument: "after" },
  );
  if (!donation) {
    const existing = await db.collection<DonationDoc>("donations").findOne({ id });
    if (!existing) return NextResponse.json({ error: "Donation not found" }, { status: 404 });
    return NextResponse.json({ error: `Donation is already ${existing.status || existing.payment?.status}` }, { status: 409 });
  }

  if (body.action === "approve") {
    if (donation.campaignId) await db.collection("campaigns").updateOne({ id: donation.campaignId }, { $inc: { raisedAmount: donation.amount, donorCount: 1 } });
    if (donation.referral) await issueReferralAchievementIfEligible(db, donation.referral.memberId, req.url);
    try {
      await sendDonationReceiptEmail(donation, req.url);
      return NextResponse.json({ donation, emailSent: true });
    } catch (error) {
      console.error("Approved donation receipt email failed", error);
      return NextResponse.json({ donation, emailSent: false, error: "Donation approved but receipt email failed" }, { status: 207 });
    }
  }
  return NextResponse.json({ donation, emailSent: false });
}

function isPaidDonation(donation: DonationDoc) {
  return donation.status === "paid" || donation.payment?.status === "paid" || !donation.payment;
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const session = await getSession();
  if (!session.isAdmin) {
    return NextResponse.json({ error: "Admin authentication required" }, { status: 401 });
  }

  const id = Number.parseInt((await params).id, 10);
  if (Number.isNaN(id)) {
    return NextResponse.json({ error: "Invalid donation ID" }, { status: 400 });
  }

  const db = await getDb();
  const donation = await db.collection<DonationDoc>("donations").findOne({ id });
  if (!donation) {
    return NextResponse.json({ error: "Donation not found" }, { status: 404 });
  }

  if (isPaidDonation(donation)) {
    return NextResponse.json({ error: "Paid donations cannot be deleted from this action." }, { status: 409 });
  }

  await db.collection<DonationDoc>("donations").deleteOne({ id });
  return new NextResponse(null, { status: 204 });
}
