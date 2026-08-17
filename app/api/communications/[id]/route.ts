import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession, AuthError } from "@/lib/auth/server";
import { ensurePortalToken } from "@/lib/communication/engine";
import { sendMail, buildNewMessageEmail } from "@/lib/mail";

export const dynamic = "force-dynamic";

/**
 * POST /api/communications/[id]/send — the manual Send click.
 * Marks the message SENT so it appears on the parent portal, and
 * (best-effort) emails the parent that a new message is waiting.
 */
export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await requireSession();

    const message = await prisma.parentMessage.findUnique({
      where: { id: params.id },
      include: { student: { select: { id: true, name: true, parentName: true, parentEmail: true } } },
    });
    if (!message) return NextResponse.json({ error: "Message not found" }, { status: 404 });
    if (message.status !== "DRAFT") {
      return NextResponse.json({ error: "Message was already sent" }, { status: 409 });
    }

    const token = await ensurePortalToken(message.student.id);
    const origin = req.headers.get("origin") || `http://${req.headers.get("host") || "localhost:3000"}`;
    const portalUrl = `${origin}/p/${token}`;

    const updated = await prisma.parentMessage.update({
      where: { id: message.id },
      data: { status: "SENT", sentAt: new Date(), sentByName: session.name },
    });

    // Best-effort email notification — the portal is the source of truth
    let emailed = false;
    if (message.student.parentEmail && process.env.BREVO_API_KEY) {
      try {
        const mail = buildNewMessageEmail({
          parentName: message.student.parentName,
          studentName: message.student.name,
          title: message.title,
          portalUrl,
        });
        await sendMail({ to: { email: message.student.parentEmail, name: message.student.parentName }, ...mail });
        emailed = true;
      } catch (e) {
        console.warn("[communications/send] email notify failed:", e);
      }
    }

    return NextResponse.json({ message: updated, emailed, portalUrl });
  } catch (error) {
    if (error instanceof AuthError) return NextResponse.json({ error: error.message }, { status: error.status });
    console.error("[api/communications/send] failed:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}

/** DELETE /api/communications/[id] — discard a draft. */
export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    await requireSession();
    const message = await prisma.parentMessage.findUnique({ where: { id: params.id } });
    if (!message) return NextResponse.json({ error: "Message not found" }, { status: 404 });
    if (message.status !== "DRAFT") {
      return NextResponse.json({ error: "Only drafts can be deleted" }, { status: 409 });
    }
    await prisma.parentMessage.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof AuthError) return NextResponse.json({ error: error.message }, { status: error.status });
    console.error("[api/communications/delete] failed:", error);
    return NextResponse.json({ error: "Failed to delete draft" }, { status: 500 });
  }
}
