import TelegramBot, { Message, Metadata } from "node-telegram-bot-api";
import fs from "node:fs";
import { CommandStore } from "./store";
import { findOrCreateUser } from "../entities/user.entity";
import { findOrCreateGroup } from "../entities/group.entity";

const excuteCommandsFunc = (telegramClient: TelegramBot) =>
  telegramClient.on("message", async (message: Message, metadata: Metadata) => {
    if (message?.from?.is_bot || !message.from?.id) return;

    const prefix = process.env.PREFIX as string;

    if (!message || !message.text) return;

    if (!message.text.startsWith(prefix)) return;

    const [name, ...args] = message.text
      .slice(prefix.length)
      .trim()
      .split(/ +/g);

    if (message.chat.type === "group" || message.chat.type === "supergroup") {
      await findOrCreateGroup(message.chat.id);
    }

    const user = await findOrCreateUser(message.from.id);

    const command = CommandStore.get(name.replace("@BorsaSultani_Bot", ""));
    if (!command) return;

    try {
      return command.default.executeCommandFunc(telegramClient, message, args);
    } catch (error) {
      console.error(error);
    }
  });

export default { excuteCallbackFunc: excuteCommandsFunc };

const addCommandsToStore = () => {
  const callbackFiles = fs.readdirSync(`${__dirname}/../commands`);

  for (const file of callbackFiles) {
    const command = require(`${__dirname}/../commands/${file}`);
    CommandStore.set(command.default.name, command);
  }
};

addCommandsToStore();
