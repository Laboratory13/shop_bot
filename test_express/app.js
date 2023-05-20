import express from "express";
import { Telegraf } from "telegraf";

const bot = new Telegraf('477383024:AAE33xFWSas6jRROncgrsVOacJrrsDtHCkI');
const app = express();

// Set the bot API endpoint
app.use(await bot.createWebhook({ domain: "test.lazijonov.uz" }));

bot.on("text", ctx => ctx.reply("Hello"));

app.listen(3000, () => console.log("Listening on port", 3000));