import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";

// export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
    // Use service role key for admin operations (updating user metadata)
    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
        return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    let event;
    const stripe = getStripe();
    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error";
        console.error("[DutyDocs] Webhook signature verification failed:", message);
        return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 });
    }

    try {
        switch (event.type) {
            case "checkout.session.completed": {
                const session = event.data.object;
                const userId = session.metadata?.supabase_user_id;
                if (userId) {
                    // Get the Stripe customer ID and subscription ID
                    const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id;
                    const subscriptionId = typeof session.subscription === "string" ? session.subscription : session.subscription?.id;

                    await supabaseAdmin.auth.admin.updateUserById(userId, {
                        user_metadata: {
                            plan: "pro",
                            stripe_customer_id: customerId,
                            stripe_subscription_id: subscriptionId,
                        },
                    });
                    console.log(`[DutyDocs] User ${userId} upgraded to Pro`);
                }
                break;
            }

            case "customer.subscription.deleted": {
                const subscription = event.data.object;
                const userId = subscription.metadata?.supabase_user_id;
                if (userId) {
                    await supabaseAdmin.auth.admin.updateUserById(userId, {
                        user_metadata: {
                            plan: "starter",
                            stripe_subscription_id: null,
                        },
                    });
                    console.log(`[DutyDocs] User ${userId} downgraded to Starter`);
                }
                break;
            }

            case "customer.subscription.updated": {
                const subscription = event.data.object;
                const userId = subscription.metadata?.supabase_user_id;
                if (userId) {
                    const isActive = subscription.status === "active" || subscription.status === "trialing";
                    await supabaseAdmin.auth.admin.updateUserById(userId, {
                        user_metadata: {
                            plan: isActive ? "pro" : "starter",
                        },
                    });
                    console.log(`[DutyDocs] User ${userId} subscription status: ${subscription.status}`);
                }
                break;
            }

            default:
                // Unhandled event type — that's fine
                break;
        }
    } catch (error) {
        console.error("[DutyDocs] Webhook handler error:", error);
        return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
    }

    return NextResponse.json({ received: true });
}
