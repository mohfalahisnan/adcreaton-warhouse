"use server";
import { prisma } from "@/lib/prisma";
import { Order, OrderItem, Prisma } from "@prisma/client";

export const initialOrder = async ({
  data,
}: {
  data: Omit<Order, "order_id">;
}) => {
  try {
    const order = await prisma.order.create({
      data: data,
    });
    return order;
  } catch (error) {
    console.log(error);
    throw new Error("Failed to fetch");
  }
};

export const addItem = async ({
  data,
}: {
  data: Omit<OrderItem, "order_item_id">;
}) => {
  try {
    const existingItem = await prisma.orderItem.findFirst({
      where: {
        order_id: data.order_id, // Ganti dengan nama field yang sesuai jika nama field yang digunakan berbeda
        product_id: data.product_id, // Ganti dengan nama field yang sesuai jika nama field yang digunakan berbeda
      },
    });

    if (existingItem) {
      try {
        const exist = await prisma.orderItem.update({
          where: {
            order_item_id: existingItem.order_item_id,
            product_id: data.product_id,
            order_id: data.order_id,
          },
          data: {
            quantity: existingItem.quantity + 1,
          },
        });
        return exist;
      } catch (error) {
        console.log(error);
        throw new Error("Failed to fetch");
      }
    }

    const item = await prisma.orderItem.create({
      data: data,
    });
    return item;
  } catch (error) {
    console.log(error);
    throw new Error("Failed to fetch");
  }
};

export const getOrderById = async (
  id: string
): Promise<Prisma.OrderGetPayload<{
  include: { OrderItem: { include: { product: true } } };
}> | null> => {
  try {
    const order = await prisma.order.findUnique({
      where: {
        order_id: id,
      },
      include: {
        OrderItem: {
          include: {
            product: true,
          },
        },
      },
    });
    return order;
  } catch (error) {
    console.log(error);
    throw new Error("Failed to fetch");
  }
};

export const deleteOrderItem = async (id: string) => {
  try {
    const order = await prisma.orderItem.delete({
      where: {
        order_item_id: id,
      },
    });
    return order;
  } catch (error) {
    console.log(error);
    throw new Error("Failed to fetch");
  }
};
