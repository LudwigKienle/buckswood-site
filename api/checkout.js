// POST /api/checkout – starts a Stripe Checkout for the monthly Premium subscription.
import {configured, stripe, json, fail, SITE} from './_lib.js';

export async function POST() {
  if (!configured()) return json({error: 'Premium is not open yet.'}, 503);
  try {
    const session = await stripe('POST', '/checkout/sessions', {
      mode: 'subscription',
      line_items: [{price: process.env.STRIPE_PRICE_ID, quantity: 1}],
      success_url: SITE + '/premium?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: SITE + '/#plans',
      allow_promotion_codes: true,
      locale: 'auto',
      // Digital content: the buyer agrees to the terms and to Premium starting now,
      // which ends the right of withdrawal (§ 356 Abs. 5 BGB).
      consent_collection: {terms_of_service: 'required'},
      custom_text: {
        terms_of_service_acceptance: {
          message: 'I agree to the [terms](https://www.buckswood.art/agb) and want Premium to start right away. I know that this ends my [right of withdrawal](https://www.buckswood.art/widerruf).'
        }
      },
      ...(process.env.STRIPE_AUTOMATIC_TAX === '1' ? {automatic_tax: {enabled: true}} : {})
    });
    return json({url: session.url});
  } catch (err) {
    return fail(err);
  }
}
