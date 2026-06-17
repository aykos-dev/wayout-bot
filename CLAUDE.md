# Tour Hub Bot (Telegraf)

**Project.** Minimal Telegram launcher bot for the Outway/Tour Hub MiniApp. Currently only handles `/start` and presents an inline WebApp button that opens the `web/` MiniApp. One of 5 sibling repos (backend, admin, web, **bot**, mobile).

## Commands

Package manager: **npm** (no pnpm lockfile here, unlike sibling repos).

```bash
npm install
npm run dev     # ts-node src/index.ts
npm run build   # tsc
npm start       # node dist/index.js
```

No lint or test scripts configured.

## Architecture

Single-file. Everything lives in `src/index.ts`:

- Loads env via `dotenv`.
- Constructs a Telegraf bot with `BOT_TOKEN`.
- Registers `bot.start(...)` which replies with a greeting and a `Markup.button.webApp('Open Tour Hub', MINIAPP_URL)` inline keyboard.
- `bot.launch()` (long polling, no webhook).
- SIGINT/SIGTERM handlers call `bot.stop()`.

There are no scenes, middlewares, session store, or `handlers/` folder yet — the bot does not call the backend.

## Conventions

- TypeScript strict mode (`tsconfig.json`).
- Fluent Telegraf API (`bot.start`, `bot.command`, ...). When adding commands, keep handlers in `src/index.ts` until file growth justifies a split.

## External Contracts

- **Outbound API calls: none.** The bot does not currently consume any backend endpoint.
- **MiniApp link:** `MINIAPP_URL` should point at the deployed `web/` repo (or a tunneled dev URL during local work). Telegram requires HTTPS for production WebApps.
- **Telegram updates:** long polling via `getUpdates` (no webhook). Backend has `TELEGRAM_WEBHOOK_SECRET` and `BOT_SECRET` env vars but they aren't consumed here — verify before assuming a webhook setup exists.

## Gotchas

- **Env vars are required at startup.** Missing `BOT_TOKEN` or `MINIAPP_URL` will throw synchronously — there's no graceful fallback.
- **Long polling.** Only one bot instance can poll a given token at a time; running `npm run dev` while another instance polls will 409. Stop one before starting another.
- **No auth/session linking.** The bot reads `ctx.from.first_name` but does not call the backend to associate Telegram users with backend accounts. All auth currently happens inside the MiniApp itself (via `quick-register`).
- **No unknown-message handler.** Any non-`/start` input is silently ignored.
- **WebApp HTTPS in production.** Telegram refuses HTTP MiniApp URLs in production — use `https://` (and a trusted cert) when deploying.
- **`Markup.button.webApp` ≠ regular URL button.** It opens inside Telegram's WebView with the `tgWebAppData` payload; the `web/` MiniApp may need to parse that on entry.

## Env Vars (`.env.example`)

```
BOT_TOKEN=<telegram bot token>
MINIAPP_URL=<https URL to web/ MiniApp>
```

## Unsure / Verify Manually

- Whether the production deployment uses long polling or has been switched to webhooks (backend declares `TELEGRAM_WEBHOOK_SECRET` — investigate before changing transport).
- Whether the MiniApp passes Telegram initData back to the backend for auth, and if so, which backend endpoint validates it.
- Hosting/runtime: pm2? Docker? Not configured in this repo — likely external.
- Whether future plans include scene-based flows (the current single-file shape will need restructuring at that point).
