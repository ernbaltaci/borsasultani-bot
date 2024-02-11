import TelegramBot, { Message } from "node-telegram-bot-api";

import { adsButtons } from "../helpers/ads-buttons";
import { getStockData } from "../helpers/data-taker";
import { createCanvas, loadImage } from "canvas";
import path from "path";
import fs from "node:fs";
import axios from "axios";
import { IStockInfo } from "../types";
const HisseBilgi = {
  name: "hisse",
  id: "hisse-bilgi",
  executeCommandFunc: async (
    telegramClient: TelegramBot,
    message: Message,
    args: any[]
  ) => {
    if (args.length !== 1) {
      telegramClient.sendMessage(
        message.chat.id,
        `Hatalı komut kullanımı. Örnek: /${HisseBilgi.name} kchol`
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
    ) as IStockInfo;

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

    const backgroundImg: string = path.join(
      __dirname,
      "../../assets/hissebilgi.png"
    );

    loadImage(backgroundImg).then(async (backgroundImage) => {
      const genislik: number = backgroundImage.width;
      const yukseklik: number = backgroundImage.height;

      const canvas = createCanvas(genislik, yukseklik);
      const context = canvas.getContext("2d");

      context.drawImage(backgroundImage, 0, 0, genislik, yukseklik);

      const RED_COLOR = "#FF4040";
      const GREEN_COLOR = "#00FF00";
      context.imageSmoothingEnabled = false;
      // Change Value
      context.fillStyle = !selectedStock.change.includes("-")
        ? GREEN_COLOR
        : RED_COLOR;
      context.font = "Bold 24px Arial";

      context.fillText(`${selectedStock.change}`, 90, 277);
      // Price Value
      context.fillStyle = !selectedStock.change.includes("-")
        ? GREEN_COLOR
        : RED_COLOR;

      const priceX = selectedStock.lastPrice.length > 6 ? 220 : 240;

      context.font = `Bold ${24}px Anton`;

      context.fillText(
        `₺${selectedStock.lastPrice.toLocaleString()}`,
        priceX,
        277
      );
      context.imageSmoothingEnabled = true;

      // Highest Lowest Value
      context.fillStyle = GREEN_COLOR;

      const highestPx = selectedStock.highestPrice.length > 6 ? 17 : 21;
      context.font = `Bold ${highestPx}px Anton`;

      const highestText = `₺${selectedStock.highestPrice.toLocaleString()}`;

      const highestX = selectedStock.highestPrice.length > 7 ? 110 : 120;

      context.fillText(`${highestText}`, highestX, 345);
      context.imageSmoothingEnabled = true;

      context.fillStyle = RED_COLOR;
      const lowestPx = selectedStock.highestPrice.length > 6 ? 17 : 21;

      context.font = `Bold ${lowestPx}px Anton`;

      const lowestText = `₺${selectedStock.lowestPrice.toLocaleString()}`;
      const lowestX = selectedStock.highestPrice.length > 7 ? 200 : 210;

      context.fillText(lowestText, lowestX, 345);
      context.imageSmoothingEnabled = true;
      // Time Value

      context.fillStyle = "#fff";

      context.font = "Bold 20px Anton";

      context.fillText(selectedStock.time, 18, 487);
      context.imageSmoothingEnabled = true;

      //

      const upDownIcon: string = path.join(
        __dirname,
        `../../assets/${
          !selectedStock.change.includes("-") ? "upicon" : "downicon"
        }.png`
      );
      const upDownImage = await loadImage(upDownIcon);

      // İkon boyutu
      const iconWidth = 40;
      const iconHeight = 40;

      // İkonun merkez koordinatları
      const iconCenterX = 45;
      const iconCenterY = 273;

      // İkonun sol üst köşesinin koordinatları
      const iconX = iconCenterX - iconWidth / 2;
      const iconY = iconCenterY - iconHeight / 2;

      // İkonu yerleştirme
      context.drawImage(upDownImage, iconX, iconY, iconWidth, iconHeight);

      // Yuvarlak maskeyi kaldırma
      context.restore();

      //

      context.fillStyle = selectedStock.change.includes("-")
        ? RED_COLOR
        : GREEN_COLOR;

      context.font = "Bold 24px Anton";

      const volumeText = `${selectedStock.volume}`;
      const volumeWitdh = context.measureText(volumeText).width;
      const volumeX = (genislik - volumeWitdh) / 2;
      const volumeY = 413;
      context.fillText(volumeText, volumeX, volumeY);
      context.imageSmoothingEnabled = true;

      //

      context.fillStyle = "#fff";

      context.font = "Bold 24px Anton";

      const nameText = `${selectedStock.shortName}`;
      const nameWidth = context.measureText(nameText).width;
      const nameX = (genislik - nameWidth) / 2;
      const nameY = 220;
      context.fillText(nameText, nameX, nameY);
      context.imageSmoothingEnabled = true;

      //

      await loadImage(
        `https://static.doviz.com/images/stock/${selectedStock.shortName}.png`
      )
        .then((image) => {
          const radius = Math.min(image.width, image.height) / 1.7; // Dairenin yarı çapı, resmin boyutlarına göre belirleniyor
          context.beginPath();
          context.arc(201, 112, radius, 0, Math.PI * 2); // Dairenin merkez koordinatlarını (150, 150) olarak belirliyoruz
          context.closePath();
          context.clip();

          // Resmi canvas üzerine yerleştirme
          const resimX = 201 - radius; // Resmin x koordinatını dairenin merkezinden çıkartarak ayarlıyoruz
          const resimY = 112 - radius; // Resmin y koordinatını dairenin merkezinden çıkartarak ayarlıyoruz
          context.drawImage(image, resimX, resimY, radius * 2, radius * 2); // Resmi yerleştirirken boyutlarını da dairenin çapına göre ayarlıyoruz

          // Yuvarlak maskeyi kaldırma
          context.restore();
        })
        .catch((error) => {});

      const buffer = canvas.toBuffer("image/png");
      telegramClient.sendPhoto(
        message.chat.id,
        buffer,
        {
          reply_to_message_id: message.message_id,
          ...adsButtons,
        },
        { filename: "borsasultani_bot", contentType: "png" }
      );
    });
  },
};

export default HisseBilgi;
