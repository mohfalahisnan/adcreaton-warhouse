"use server";
import { prisma } from "@/lib/prisma";
import { Order, OrderItem, Prisma } from "@prisma/client";
import { handlePrismaError } from "../handlePrismaError";

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
    const errorMessage = handlePrismaError(error);
    console.error(errorMessage); // Logging ke konsol atau bisa juga ke sistem logging aplikasi

    // Melempar error dengan pesan yang lebih jelas untuk pengguna atau sistem monitoring
    throw new Error(`Failed to fetch categories: ${errorMessage}`);
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
    const errorMessage = handlePrismaError(error);
    console.error(errorMessage); // Logging ke konsol atau bisa juga ke sistem logging aplikasi

    // Melempar error dengan pesan yang lebih jelas untuk pengguna atau sistem monitoring
    throw new Error(`Failed to fetch categories: ${errorMessage}`);
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
