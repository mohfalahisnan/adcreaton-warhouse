import { Prisma } from "@prisma/client";
import { tierPriceApplied } from "./tierPriceApplied";

export const CalculateTotalAmount = ({
  data,
}: {
  data: Prisma.OrderGetPayload<{
    include: {
      OrderItem: {
        include: {
          product: true;
          satuan: true;
        };
      };
    };
  }>;
}) => {
  let totalItem = 0;
  data.OrderItem.forEach((item) => {
    totalItem +=
      item.quantity *
        (tierPriceApplied({ ...item.product, count: item.quantity }) *
          (item.satuan?.multiplier || 1)) -
      (item.discount || 0);
  });
  return totalItem;
};
