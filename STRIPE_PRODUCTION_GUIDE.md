# Stripe Production Guide: Webhook Setup

To ensure your subscription logic works correctly in production, you must set up a Stripe webhook. This allows Stripe to notify your application when a subscription is created, updated, or canceled.

## 1. Local Development (Testing)

For local testing, use the Stripe CLI to forward events:

```bash
# Install Stripe CLI and login
brew install stripe/stripe-cli/stripe
stripe login

# Forward events to your local API
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Copy the **Webhook Signing Secret** (starts with `whsec_`) and add it to your `.env.local`:
`STRIPE_WEBHOOK_SECRET=whsec_...`

## 2. Production Environment (Vercel/DigitalOcean/etc.)

### Step A: Create the Webhook in Stripe
1. Go to the [Stripe Dashboard](https://dashboard.stripe.com/webhooks).
2. Click **Add endpoint**.
3. **Endpoint URL**: `https://your-domain.com/api/webhooks/stripe`
4. **Events to listen for**:
   - `checkout.session.completed` (Crucial for initial subscription)
   - `customer.subscription.updated` (Plan changes, renewals)
   - `customer.subscription.deleted` (Cancellations)
5. Click **Add endpoint**.

### Step B: Configure Environment Variables
Copy the **Signing Secret** from the new production webhook and add it to your production environment variables:

- `STRIPE_SECRET_KEY`: Your live secret key
- `STRIPE_WEBHOOK_SECRET`: The `whsec_` secret for this specific endpoint
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Your live publishable key

### Step C: Verify the Integration
1. Perform a test checkout in "Test Mode".
2. Check the **Webhooks** tab in Stripe to see if the event was delivered successfully (200 OK).
3. Verify that the user's `plan` bit in your database (or metadata) was updated to `pro`.

## Troubleshooting

- **401 Unauthorized**: Your `STRIPE_WEBHOOK_SECRET` is likely incorrect or missing.
- **500 Internal Server Error**: Check your server logs. Ensure your webhook handler is correctly parsing the raw body (Next.js requires special handling for raw bodies in API routes).
- **Events not arriving**: Ensure the endpoint URL in Stripe is exactly correct (including `https://`).
