import TelegramBot, { Message } from "node-telegram-bot-api";

import { adsButtons } from "../helpers/ads-buttons";
import { getStockData } from "../helpers/data-taker";
import { IStockInfo } from "../types";
import { CommandStore } from "../lib/store";
const maxLot = 10;

const StartCommand = {
  name: "start",
  id: "start",
  executeCommandFunc: async (
    telegramClient: TelegramBot,
    message: Message,
    args: any[]
  ) => {
    const commands = CommandStore as any;

    const commandList = [];

    for (const command of commands) {
      commandList.push(`→ \`/${command[0]}\``);
    }

    const startMessage = `Merhaba, ${
      message.from?.first_name
    }! Komutlarımız aşağıdaki gibidir. \n\n${commandList.join(
      "\n"
    )} \n\nTwitter'dan bizi takip etmeyi unutma!`;

    telegramClient.sendMessage(message.chat.id, `${startMessage}`, {
      parse_mode: "Markdown",
      ...adsButtons,
      reply_to_message_id: message.message_id,
    });
  },
};

export default StartCommand;
