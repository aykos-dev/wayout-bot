import 'dotenv/config';
import { Telegraf, Markup } from 'telegraf';

const token = process.env.BOT_TOKEN;
const miniappUrl = process.env.MINIAPP_URL;

if (!token) throw new Error('BOT_TOKEN is not set');
if (!miniappUrl) throw new Error('MINIAPP_URL is not set');

const bot = new Telegraf(token);

bot.start((ctx) =>
  ctx.reply(
    `Welcome to Tour Hub, ${ctx.from.first_name}! Tap the button below to open the app.`,
    Markup.inlineKeyboard([
      Markup.button.webApp('Open Tour Hub', miniappUrl),
    ]),
  ),
);

bot.launch().then(() => console.log('Bot started'));

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
