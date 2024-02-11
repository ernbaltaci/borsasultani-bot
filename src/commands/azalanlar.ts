import TelegramBot, { Message } from "node-telegram-bot-api";

import { adsButtons } from "../helpers/ads-buttons";
import { getStockData } from "../helpers/data-taker";
import { IStockInfo } from "../types";
const maxLot = 10;

const AzalanHisseler = {
  name: "azalanlar",
  id: "azalanlar",
  executeCommandFunc: async (
    telegramClient: TelegramBot,
    message: Message,
    args: any[],
    db: any
  ) => {
    const stockDataList = (await getStockData()) as IStockInfo[];

    if (!stockDataList) {
      telegramClient.sendMessage(
        message.chat.id,
        "Belirtilen hisse verisi bulunamadı."
      );
      return;
    }

    const sortedByChangeData = sortByChange(stockDataList)
      .reverse()
      .slice(0, maxLot);

    let title = `📉 *Günlük En Çok Aazalan Hisseler* \n\n`;

    const sortedMessage = sortedByChangeData
      .map(
        (
          stock: {
            shortName: any;
            lastPrice: any;
            change: any;
            longName: string;
          },
          index: number
        ) => {
          let emojiSymbol = "";
          if (index === 0) {
            emojiSymbol = "🥇";
          } else if (index === 1) {
            emojiSymbol = "🥈";
          } else if (index === 2) {
            emojiSymbol = "🥉";
          } else {
            emojiSymbol = "🔴";
          }
          return `${emojiSymbol} *${stock.longName} (${stock.shortName})* \n📉 Son Fiyat: ₺${stock.lastPrice} (${stock.change}) \n`;
        }
      )
      .join("\n");

    telegramClient.sendMessage(message.chat.id, `${title}${sortedMessage}`, {
      parse_mode: "Markdown",
      ...adsButtons,
      reply_to_message_id: message.message_id,
    });
  },
};

export default AzalanHisseler;

function sortByChange(data: any) {
  const sortedData = data.sort((a: any, b: any) => {
    const aChange = parseFloat(a.change.replace("%", "").replace(",", "."));
    const bChange = parseFloat(b.change.replace("%", "").replace(",", "."));

    // Karşılaştırma yapma
    if (aChange > bChange) {
      return -1;
    } else if (aChange < bChange) {
      return 1;
    } else {
      return 0;
    }
  });

  return sortedData;
}
