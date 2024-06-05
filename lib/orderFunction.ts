import { Prisma } from "@prisma/client";
import { ISelectedProduct, TierPrice } from "./actions/order";

export const orderCalculate = {
  total: (
    order: Prisma.OrderGetPayload<{
      include: {
        OrderItem: {
          include: {
            product: true;
          };
        };
        shipment: true;
      };
    }>
  ) => {
    return order.OrderItem.reduce((acc, item) => {
      return acc + item.quantity * item.product.sell_price;
    }, 0);
  },
  discount: (price: number, discount: number) => {
    return price - discount;
  },
  price: (product: ISelectedProduct) => {
    // Memeriksa apakah product dan tier_price tersedia
    if (!product || !product.tier_price) {
      return { tierPrice: 0, price: product.sell_price }; // Kembali ke sell_price atau 0 jika product undefined
    }
    // Parse JSON string tier_price menjadi array objek TierPrice
    const tiers: TierPrice[] = JSON.parse(product.tier_price);

    // Mencari tier yang sesuai dengan count
    const applicableTier = tiers.find(
      (tier) => product.count >= tier.from && product.count <= tier.to
    );

    // Menghitung total harga
    if (applicableTier) {
      return { tierPrice: applicableTier.price, price: product.sell_price };
    }

    // Jika tidak ada tier yang cocok, kembalikan 0 atau mungkin handle error sesuai kebutuhan
    return { tierPrice: 0, price: product.sell_price };
  },
};

export const calculate = {
  total: (
    order: Prisma.OrderGetPayload<{
      include: {
        OrderItem: {
          include: {
            product: true;
          };
        };
      };
    }>
  ) => {
    return order.OrderItem.reduce((acc, item) => {
      const priceInfo = orderCalculate.price(item.product as ISelectedProduct);
      let harga = 0;
      if (priceInfo.tierPrice !== 0) {
        harga = acc + priceInfo.tierPrice * item.quantity;
      }
      if (item.discount && item.discount >= 0) {
        let potongan = harga - item.discount;
        harga = potongan;
      }
      return acc + priceInfo.price * item.quantity;
    }, 0);
  },
};
