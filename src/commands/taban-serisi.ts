import TelegramBot, { Message } from "node-telegram-bot-api";

import { adsButtons } from "../helpers/ads-buttons";
import { getStockData } from "../helpers/data-taker";
const maxDay = 15;

const TabanSerisi = {
  name: "taban",
  id: "taban-serisi",
  executeCommandFunc: async (
    telegramClient: TelegramBot,
    message: Message,
    args: any[],
    db: any
  ) => {
    if (args.length !== 1) {
      telegramClient.sendMessage(
        message.chat.id,
        "Hatalı komut kullanımı. Örnek: /taban KCHOL"
      );
      return;
    }

    const stockDataList = await getStockData();

    if (!stockDataList) {
      telegramClient.sendMessage(
        message.chat.id,
        "Belirtilen hisse verisi bulunamadı."
      );
      return;
    }

    const selectedStock = stockDataList.find(
      (stock: { shortName: any }) => stock.shortName === args[0].toUpperCase()
    );

    if (
      !selectedStock ||
      !selectedStock.shortName ||
      !selectedStock.lastPrice
    ) {
      telegramClient.sendMessage(
        message.chat.id,
        "Belirtilen hisse verisi bulunamadı."
      );
      return;
    }

    const startValue = parseFloat(String(selectedStock?.lastPrice));
    if (isNaN(startValue) || startValue <= 0) {
      telegramClient.sendMessage(
        message.chat.id,
        "Geçerli bir başlangıç değeri alınamadı."
      );
      return;
    }

    const growthRate = 0.1; // %10 artış
    let currentValue = startValue;
    let resultMessage = `📉 *Taban Serisi* (${
      selectedStock.shortName
    })\n\n*➜ Başlangış Seviyesi* → ${startValue.toLocaleString("tr-TR")}₺ (${
      selectedStock.time
    })\n\n`;

    for (let day = 1; day <= maxDay; day++) {
      currentValue *= 1 - growthRate;
      resultMessage += `*${day}. gün →* \`${currentValue.toLocaleString(
        "tr-TR"
      )}₺\`\n`;
    }

    telegramClient.sendMessage(message.chat.id, resultMessage, {
      parse_mode: "Markdown",
      ...adsButtons,
      reply_to_message_id: message.message_id,
    });
  },
};

export default TabanSerisi;
