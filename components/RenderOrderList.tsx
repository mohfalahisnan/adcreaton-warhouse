import { getOrderById } from "@/lib/actions/order";
import { Order, Prisma } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import React from "react";

type Props = {
  orderId: string;
};

const RenderOrderList = ({ orderId }: Props) => {
  const { data } = useQuery({
    queryKey: ["order", orderId],
    queryFn: async () => await getOrderById(orderId),
  });
  return (
    <div>
      {data &&
        data.OrderItem.map((item, i) => {
          return (
            <li key={i}>
              {item.product.name} {item.quantity}
              {item.product.unit}
            </li>
          );
        })}
    </div>
  );
};

export default RenderOrderList;
