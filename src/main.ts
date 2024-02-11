import TelegramBot from "node-telegram-bot-api";
require("dotenv").config();
import commandHandler from "./lib/command.handler";
import { getStockData } from "./helpers/data-taker";
import connectMongo from "./utils/connectMongo";

const telegramBot = new TelegramBot(process.env.BOT_TOKEN as string, {});

const run = async () => {
  commandHandler.excuteCallbackFunc(telegramBot);
  await connectMongo();

  telegramBot.startPolling().then((value) => {
    console.log("Bot started.");
  });
};

run();
getStockData();
