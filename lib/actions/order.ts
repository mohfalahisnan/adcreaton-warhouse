"use server";
import { prisma } from "@/lib/prisma";
import { Order, OrderItem, Prisma, Product, StatusOrder } from "@prisma/client";
import { handlePrismaError } from "../handlePrismaError";

export interface ISelectedProduct extends Product {
  count: number;
}

export interface TierPrice {
  id: number;
  from: number;
  to: number;
  price: number;
}

function withTax(item: any) {
  const total = totalPrice(item) + (totalPrice(item) * 10) / 100;
  return total;
}

// Fungsi untuk menghitung total harga berdasarkan count dan tier price
const calculateTotalPrice = (product: ISelectedProduct): number => {
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

  // Menghitung total harga
  if (applicableTier) {
    return product.count * applicableTier.price;
  } else {
    return product.count * product.sell_price;
  }
};

const totalPrice = (
  selectedProducts:
    | Prisma.OrderGetPayload<{
        include: { OrderItem: { include: { product: true } } };
      }>
    | undefined
): number => {
  if (selectedProducts) {
    return selectedProducts.OrderItem.reduce(
      (total, orderItem) =>
        total +
        calculateTotalPrice({
          ...orderItem.product,
          count: orderItem.quantity,
        }),
      0
    );
  }
  return 0; // Pastikan untuk mengembalikan nilai default jika selectedProducts adalah undefined
};

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
            quantity: existingItem.quantity + data.quantity,
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
    console.error(errorMessage);
    throw new Error(`Failed to fetch categories: ${errorMessage}`);
  }
};

export const getOrderById = async (
  id: string
): Promise<Prisma.OrderGetPayload<{
  include: {
    OrderItem: { include: { product: true } };
    customer_name: true;
    sales_name: true;
  };
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
        customer_name: true,
        sales_name: true,
      },
    });
    return order;
  } catch (error) {
    console.log(error);
    throw new Error("Failed to fetch");
  }
};

export const getOrder = async (warehouse_id: number) => {
  try {
    const order = await prisma.order.findMany({
      where: {
        warehouse_id: warehouse_id,
      },
      include: {
        _count: true,
        OrderItem: true,
        sales_name: true,
        customer_name: true,
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

export const deleteOrder = async (id: string) => {
  try {
    const order = await prisma.order.delete({
      where: {
        order_id: id,
      },
    });
    return order;
  } catch (error) {
    console.log(error);
    throw new Error("Failed to fetch");
  }
};

export const updateStatusOrder = async ({
  id,
  status,
}: {
  id: string;
  status: StatusOrder;
}) => {
  try {
    const orders = await prisma.order.findUnique({
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

    console.log(withTax(orders || undefined));
    const order = await prisma.order.update({
      where: {
        order_id: id,
      },
      data: {
        status: status,
        totalAmount: withTax(orders || undefined),
      },
    });
    return order;
  } catch (error) {
    console.log(error);
    throw new Error("Failed to fetch");
  }
};
