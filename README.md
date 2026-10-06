# Islamic Center Registration

Mobile-first registration form that collects information from Islamic centers:
center details, the management system they want, how we can help, contact details,
and a 10-question survey. No pricing, no checkout.

Every completed response is forwarded as Discord embeds by `api/submit.js`.

- Live: https://islamic-center-registration.vercel.app
- Start: `node dev.mjs` → http://localhost:8788
- Webhook: set `DISCORD_WEBHOOK_URL` in the Vercel project env (a default is in the function).

## Flow
Welcome → Your Center → Your System (features / parents / teachers / other) →
How Can We Help? → Your Contact → Survey 1–10 → You're Done → Submit → Thank you.

Answers are kept in `localStorage` (`icr.v1`) so nothing is lost when going Back or reloading.
