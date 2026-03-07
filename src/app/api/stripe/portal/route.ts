import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";

// export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
    try {
        const { customerId } = await req.json();

        if (!customerId) {
            return NextResponse.json({ error: "Missing customerId" }, { status: 400 });
        }

        const stripe = getStripe();
        const session = await stripe.billingPortal.sessions.create({
            customer: customerId,
            return_url: `${req.nextUrl.origin}/settings`,
        });

        return NextResponse.json({ url: session.url });
    } catch (error: unknown) {
        console.error("[DutyDocs] Portal session error:", error);
        const message = error instanceof Error ? error.message : "Internal server error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
