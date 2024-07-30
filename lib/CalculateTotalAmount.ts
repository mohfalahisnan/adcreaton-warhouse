import { Prisma } from "@prisma/client";

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
  let totals = data.OrderItem.reduce((total, item) => {
    let strataValue = item.satuan?.strataValue || [];
    //@ts-ignore
    let applicableStrata = strataValue.reduce(
      //@ts-ignore
      (prev, curr) => {
        return item.quantity >= curr.quantity &&
          curr.quantity > (prev?.quantity || 0)
          ? curr
          : prev;
      },
      { quantity: 0, price: 0 } // Initial value for reduce
    );

    let price = item.satuan?.strata
      ? item.satuan.price - applicableStrata.price
      : item.satuan?.price || 0;
    let discount = item.discount || 0;

    return total + item.quantity * (price - discount);
  }, 0);

  return totals;
};

export const getApplicablePrice = (
  item: Prisma.OrderItemGetPayload<{
    include: {
      product: true;
      satuan: true;
    };
  }>
) => {
  let strataValue = item.satuan?.strataValue || [];
  //@ts-ignore
  let applicableStrata = strataValue.reduce(
    //@ts-ignore
    (prev, curr) => {
      return item.quantity >= curr.quantity &&
        curr.quantity > (prev?.quantity || 0)
        ? curr
        : prev;
    },
    { quantity: 0, price: 0 } // Initial value for reduce
  );

  return item.satuan?.strata ? applicableStrata.price : item.satuan?.price || 0;
};
