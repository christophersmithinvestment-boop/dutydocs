import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";

// export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
    try {
        const { email, userId } = await req.json();

        if (!email || !userId) {
            return NextResponse.json({ error: "Missing email or userId" }, { status: 400 });
        }

        const stripe = getStripe();

        // Check if customer already exists in Stripe
        const existingCustomers = await stripe.customers.list({ email, limit: 1 });
        let customerId: string;

        if (existingCustomers.data.length > 0) {
            customerId = existingCustomers.data[0].id;
        } else {
            const customer = await stripe.customers.create({
                email,
                metadata: { supabase_user_id: userId },
            });
            customerId = customer.id;
        }

        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            mode: "subscription",
            payment_method_types: ["card"],
            line_items: [
                {
                    price: process.env.STRIPE_PRO_PRICE_ID!,
                    quantity: 1,
                },
            ],
            success_url: `${req.nextUrl.origin}/settings?upgrade=success`,
            cancel_url: `${req.nextUrl.origin}/settings?upgrade=cancelled`,
            subscription_data: {
                metadata: { supabase_user_id: userId },
            },
            metadata: { supabase_user_id: userId },
        });

        return NextResponse.json({ url: session.url });
    } catch (error: unknown) {
        console.error("[DutyDocs] Stripe checkout error:", error);
        const message = error instanceof Error ? error.message : "Internal server error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
