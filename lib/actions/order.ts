"use server";
import { prisma } from "@/lib/prisma";
import { Order, OrderItem, Prisma, Product, StatusOrder } from "@prisma/client";
import { handlePrismaError } from "../handlePrismaError";
import { CustomError } from "../CustomError";
import { CalculateTotalAmount } from "../CalculateTotalAmount";

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

export const updateOrder = async ({ data }: { data: Order }) => {
  const saved = await prisma.order.findUnique({
    where: {
      order_id: data.order_id,
    },
    include: {
      OrderItem: {
        include: {
          product: true,
          satuan: true,
        },
      },
    },
  });
  if (!saved) {
    throw new Error("Order not found");
  }
  const order = await prisma.order.update({
    where: {
      order_id: data.order_id,
    },
    data: {
      customer_id: data.customer_id,
      totalAmount: CalculateTotalAmount({ data: saved }),
      sales_id: data.sales_id,
      warehouse_id: data.warehouse_id,
    },
  });
  return order;
};

export const addItem = async ({
  data,
}: {
  data: Omit<OrderItem, "order_item_id"> & {
    inputby: string;
    warehouse_id: number;
  };
}) => {
  try {
    const product = await prisma.product.findUnique({
      where: {
        product_id: data.product_id,
      },
    });
    if (!product) {
      throw new CustomError("Product not found", {
        productId: data.product_id,
      });
    }

    const stock = await prisma.stock.findFirst({
      where: {
        product_id: data.product_id,
        warehouse_id: data.warehouse_id,
      },
    });
    if (!stock) {
      throw new CustomError("Stock not found", {
        productId: data.product_id,
        warehouseId: data.warehouse_id,
      });
    }
    if (stock.total <= 0) {
      throw new CustomError("Stock not enough", { currentStock: stock.total });
    }

    const order = await prisma.order.findUnique({
      where: {
        order_id: data.order_id || "",
      },
    });

    let dikali: number = 1;
    const satuan = await prisma.satuan.findUnique({
      where: {
        satuan_id: data.satuan_id || 1,
      },
    });
    if (!satuan) {
      dikali = 1;
    } else {
      dikali = satuan.multiplier;
    }

    let totalStock = data.quantity * dikali;
    console.log("--------- stock :", totalStock);
    if (stock.total < totalStock) {
      throw new CustomError(
        `Insufficient stock: ${totalStock} ${product.name}, current stock ${stock.total}`
      );
    }

    await prisma.orderItem.create({
      data: {
        quantity: data.quantity,
        notes: data.notes || "",
        product_id: data.product_id,
        discount: data.discount,
        order_id: data.order_id,
        satuan_id: data.satuan_id,
      },
    });

    await prisma.outbound.create({
      data: {
        quantity: data.quantity * dikali,
        notes: `#TRANSACTION Outbound for: #ORDER-${order?.order_code} ${data.notes}`,
        inputBy: data.inputby || "",
        warehouse_id: data.warehouse_id || 1,
        product_id: data.product_id,
      },
    });

    await prisma.stock.update({
      where: {
        stock_id: stock.stock_id,
      },
      data: {
        total: stock.total - data.quantity * dikali,
      },
    });
  } catch (error) {
    if (error instanceof CustomError) {
      console.error("CustomError:", error.message, error.details);
      throw new Error(`Failed to process request: ${error.message}`);
    } else {
      console.error("Unexpected Error:", error);
      throw new Error(
        `An unexpected error occurred: ${(error as Error).message}`
      );
    }
  }
};
export const getOrderById = async (
  id: string
): Promise<Prisma.OrderGetPayload<{
  include: {
    OrderItem: {
      include: { product: { include: { Satuan: true } }; satuan: true };
    };
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
            product: {
              include: {
                Satuan: true,
              },
            },
            satuan: true,
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

export const getOrdersByIds = async (
  ids: string[]
): Promise<
  | Prisma.OrderGetPayload<{
      include: {
        OrderItem: {
          include: { product: { include: { Satuan: true } }; satuan: true };
        };
        customer_name: true;
        sales_name: true;
      };
    }>[]
  | null
> => {
  try {
    const orders = await prisma.order.findMany({
      where: {
        order_id: {
          in: ids,
        },
      },
      include: {
        OrderItem: {
          include: {
            product: {
              include: {
                Satuan: true,
              },
            },
            satuan: true,
          },
        },
        customer_name: true,
        sales_name: true,
      },
    });
    return orders;
  } catch (error) {
    console.log(error);
    throw new Error("Failed to fetch orders");
  }
};

export const updateOrderStatus = async (id: string, status: string) => {
  try {
    return await prisma.order.update({
      where: {
        order_id: id,
      },
      data: {
        status: status as StatusOrder,
      },
    });
  } catch (error) {
    console.log(error);
    throw new Error("Failed to fetch");
  }
};

export const getOrder = async (warehouse_id: number, depth?: boolean) => {
  try {
    const order = await prisma.order.findMany({
      where: {
        warehouse_id: warehouse_id,
      },
      include: {
        _count: true,
        OrderItem: depth ? { include: { product: true, satuan: true } } : true,
        sales_name: true,
        customer_name: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 500,
    });
    return order;
  } catch (error) {
    console.log(error);
    throw new Error("Failed to fetch");
  }
};

export const deleteOrders = async (orders: Order[]) => {
  try {
    const deleteOrders = await prisma.order.deleteMany({
      where: {
        order_id: {
          in: orders.map((order) => order.order_id),
        },
      },
    });
    return deleteOrders;
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
