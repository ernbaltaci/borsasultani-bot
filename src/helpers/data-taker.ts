import { getDate } from "../utils/utils";
import { tabletojson } from "tabletojson";

const getStockData = async () => {
  const tables = await tabletojson.convertUrl(
    "https://borsa.doviz.com/hisseler"
  );

  if (tables && tables.length > 0) {
    return tables[0].map((row: { [x: string]: string }) => {
      const nameParts = row["0"].split("\n");

      const shortName = nameParts[0].trim();
      const longName = nameParts[1].trim();

      const duzenlenmisVeri = duzenleVeri(row) as any;

      return {
        shortName,
        longName,
        time: row["6"].trim(),
        lastPrice: duzenlenmisVeri["Son"],
        highestPrice: duzenlenmisVeri["En Yüksek"],
        lowestPrice: duzenlenmisVeri["En Düşük"],
        volume: row["Hacim(TL)"].trim(),
        change: row["Değişim"].trim(),
      };
    });
  }

  return [];
};

export { getStockData };

// Değerleri düzenleme fonksiyonu
function duzenleDeger(deger: string) {
  // Eğer değer bir string ise ve içinde nokta ve virgül varsa, noktaları kaldır ve virgülle ayrılmış ondalık kısmı noktaya çevir
  if (typeof deger === "string" && deger.includes(".") && deger.includes(",")) {
    return parseFloat(deger.replace(/\./g, "").replace(",", ".")).toFixed(2);
  }
  // Değer TL cinsinde değilse veya nokta ve virgülle ayrılmış ondalık kısmı yoksa olduğu gibi döndür
  return deger;
}

// Veriyi düzenleme fonksiyonu
function duzenleVeri(veri: any) {
  const duzenlenmisVeri = {};
  for (const key in veri) {
    if (Object.hasOwnProperty.call(veri, key)) {
      // @ts-ignore
      duzenlenmisVeri[key] = duzenleDeger(veri[key]);
    }
  }
  return duzenlenmisVeri;
}
