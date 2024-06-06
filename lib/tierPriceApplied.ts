import { ISelectedProduct, TierPrice } from "./actions/order";

export const tierPriceApplied = (product: ISelectedProduct): number => {
  // Memeriksa apakah product dan tier_price tersedia
  if (!product || !product.tier_price) {
    return product ? product.sell_price : 0; // Kembali ke sell_price atau 0 jika product undefined
  }
  // Parse JSON string tier_price menjadi array objek TierPrice
  const tiers: TierPrice[] = JSON.parse(product.tier_price);

  // Mencari tier yang sesuai dengan count
  const applicableTier = tiers.find(
    (tier) => product.count >= tier.from && product.count <= tier.to
  );

  // Menghitung total harga jika tier yang sesuai ditemukan
  if (applicableTier) {
    return applicableTier.price;
  }

  // Jika tidak ada tier yang cocok dan count lebih dari tier tertinggi
  const highestTier = tiers.reduce((prev, current) => {
    return prev.to > current.to ? prev : current;
  });

  if (product.count > highestTier.to) {
    return highestTier.price;
  }

  // Jika tidak ada tier yang cocok, kembalikan harga jual asli
  return product.sell_price;
};
