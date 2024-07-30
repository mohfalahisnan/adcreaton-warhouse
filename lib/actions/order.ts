"use server";
import { prisma } from "@/lib/prisma";
import { Order, OrderItem, Prisma, Product, StatusOrder } from "@prisma/client";
import { handlePrismaError } from "../handlePrismaError";
import { CustomError } from "../CustomError";
import { CalculateTotalAmount } from "../CalculateTotalAmount";
import { format } from "date-fns";

export interface ISelectedProduct extends Product {
  count: number;
}

export interface TierPrice {
  id: number;
  from: number;
  to: number;
  price: number;
}

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
        unit_id: data.satuan_id || 1,
      },
    });
    if (!stock) {
      throw new CustomError("Stock not found", {
        productId: data.product_id,
        warehouseId: data.warehouse_id,
        unitId: data.satuan_id || 1,
      });
    }
    if (stock.total <= 0) {
      throw new CustomError("Stock not enough", { currentStock: stock.total });
    }

    // const order = await prisma.order.findUnique({
    //   where: {
    //     order_id: data.order_id || "",
    //   },
    // });

    let dikali: number = 1;

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

    // const price = await prisma.satuan.findUnique({
    //   where: {
    //     satuan_id: data.satuan_id || 1,
    //   },
    // });

    // if (!price) {
    //   throw new CustomError("Price not found", {
    //     productId: data.product_id,
    //     warehouseId: data.warehouse_id,
    //     unitId: data.satuan_id || 1,
    //   });
    // }
    // await prisma.outbound.create({
    //   data: {
    //     quantity: data.quantity * dikali,
    //     notes: `#TRANSACTION Outbound for: #ORDER-${order?.order_code} ${data.notes}`,
    //     inputBy: data.inputby || "",
    //     warehouse_id: data.warehouse_id || 1,
    //     product_id: data.product_id,
    //     price: price.price,
    //     satuan_id: data.satuan_id || 1,
    //   },
    // });

    // await prisma.stock.update({
    //   where: {
    //     stock_id: stock.stock_id,
    //   },
    //   data: {
    //     total: stock.total - data.quantity * dikali,
    //   },
    // });
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
      include: {
        product: { include: { Satuan: true } };
        satuan: true;
      };
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

export const updateOrderStatus = async (id: string, status: StatusOrder) => {
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

export const getOrderItem = async (id: string) => {
  try {
    const order = await prisma.orderItem.findUnique({
      where: {
        order_item_id: id,
      },
      include: {
        product: true,
        satuan: true,
        ReturItem: true,
      },
    });
    return order;
  } catch (error) {
    console.log(error);
    throw new Error("Failed to fetch");
  }
};

export const editItem = async ({
  data,
}: {
  data: OrderItem & {
    inputby: string;
    warehouse_id: number;
  };
}) => {
  try {
    const currentOrderItem = await prisma.orderItem.findUnique({
      where: {
        order_item_id: data.order_item_id,
      },
    });

    if (!currentOrderItem) {
      throw new CustomError("Order item not found", {
        orderItemId: data.order_item_id,
      });
    }

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

    // const stock = await prisma.stock.findFirst({
    //   where: {
    //     product_id: data.product_id,
    //     warehouse_id: data.warehouse_id,
    //   },
    // });
    // if (!stock) {
    //   throw new CustomError("Stock not found", {
    //     productId: data.product_id,
    //     warehouseId: data.warehouse_id,
    //   });
    // }

    const order = await prisma.order.findUnique({
      where: {
        order_id: data.order_id || "",
      },
    });

    // const currentSatuan = await prisma.satuan.findUnique({
    //   where: {
    //     satuan_id: currentOrderItem.satuan_id || 0,
    //   },
    // });

    // const newSatuan = await prisma.satuan.findUnique({
    //   where: {
    //     satuan_id: data.satuan_id || 0,
    //   },
    // });

    // const currentMultiplier = currentSatuan ? currentSatuan.multiplier : 1;
    // const newMultiplier = newSatuan ? newSatuan.multiplier : 1;

    // const currentTotalStock = currentOrderItem.quantity * currentMultiplier;
    // const newTotalStock = data.quantity * newMultiplier;

    // // Step 1: Return the stock for the current order item
    // await prisma.inbound.create({
    //   data: {
    //     quantity: currentTotalStock,
    //     notes: `#EDIT-TRANSACTION Inbound for: #ORDER-${order?.order_code} ${data.notes}`,
    //     inputBy: data.inputby || "",
    //     warehouse_id: data.warehouse_id || 1,
    //     product_id: data.product_id,
    //   },
    // });

    // // Update stock to add the returned quantity first
    // await prisma.stock.update({
    //   where: {
    //     stock_id: stock.stock_id,
    //   },
    //   data: {
    //     total: stock.total + currentTotalStock,
    //   },
    // });

    // // Check if new total stock is available after returning current stock
    // const updatedStock = await prisma.stock.findUnique({
    //   where: {
    //     stock_id: stock.stock_id,
    //   },
    // });

    // if (!updatedStock) {
    //   throw new CustomError("Stock not found", {
    //     productId: data.product_id,
    //     warehouseId: data.warehouse_id,
    //   });
    // }

    // if (updatedStock.total < newTotalStock) {
    //   throw new CustomError(
    //     `Insufficient stock: ${newTotalStock} ${product.name}, current stock ${updatedStock.total}`
    //   );
    // }

    // Step 2: Proceed with the outbound process for the new order item
    await prisma.orderItem.update({
      where: {
        order_item_id: data.order_item_id,
      },
      data: {
        quantity: data.quantity,
        notes: data.notes || "",
        product_id: data.product_id,
        discount: data.discount,
        order_id: data.order_id,
        satuan_id: data.satuan_id,
      },
    });

    // await prisma.outbound.create({
    //   data: {
    //     quantity:data.quantity,
    //     notes: `#EDIT-TRANSACTION Outbound for: #ORDER-${order?.order_code} ${data.notes}`,
    //     inputBy: data.inputby || "",
    //     warehouse_id: data.warehouse_id || 1,
    //     product_id: data.product_id,
    //   },
    // });

    // // Update stock to deduct the quantity for the outbound process
    // await prisma.stock.update({
    //   where: {
    //     stock_id: stock.stock_id,
    //   },
    //   data: {
    //     total: updatedStock.total - newTotalStock,
    //   },
    // });
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

export const cancelOrder = async (id: string) => {
  try {
    const order = await prisma.order.update({
      where: {
        order_id: id,
      },
      data: {
        status: "CANCELED",
      },
    });
    return order;
  } catch (error) {
    console.log(error);
    throw new Error("Failed to fetch");
  }
};
export const updateOrderItem = async (id: string, qty: number) => {
  try {
    return await prisma.orderItem.update({
      where: {
        order_item_id: id,
      },
      data: {
        quantity: qty,
      },
    });
  } catch (error) {
    console.log(error);
    throw new Error("Failed to fetch");
  }
};

export const returByOrderId = async (id: string) => {
  try {
    return await prisma.returItem.findMany({
      where: {
        order_id: id,
      },
      include: {
        orderItem: true,
      },
    });
  } catch (error) {
    console.log(error);
    throw new Error("Failed to fetch");
  }
};

export const addRetur = async (
  orderId: string,
  orderItemId: string,
  qty: number,
  notes: string
) => {
  try {
    const retur = await prisma.returItem.findUnique({
      where: {
        order_item_id: orderItemId,
      },
    });
    if (retur) {
      return await prisma.returItem.update({
        data: {
          order_id: orderId,
          order_item_id: orderItemId,
          quantity: qty,
          notes: notes,
        },
        where: {
          order_item_id: orderItemId,
        },
      });
    } else {
      return await prisma.returItem.create({
        data: {
          order_id: orderId,
          order_item_id: orderItemId,
          quantity: qty,
          notes: notes,
        },
      });
    }
  } catch (error) {
    console.log(error);
    throw new Error("Failed to fetch");
  }
};

export const addFinalOrder = async (order_id: string) => {
  try {
    await prisma.finalOrder.create({
      data: {
        order_id: order_id,
      },
    });
  } catch (error) {
    console.log(error);
    throw new Error("Failed to fetch");
  }
};

export const getOrdersDaily = async (warehouse_id: number) => {
  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  const endOfWeek = new Date();
  endOfWeek.setDate(endOfWeek.getDate() + (6 - endOfWeek.getDay()));
  endOfWeek.setHours(23, 59, 59, 999);

  try {
    const orders = await prisma.order.findMany({
      where: {
        warehouse_id: warehouse_id,
        createdAt: {
          gte: startOfWeek,
          lte: endOfWeek,
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    const chartData = Array.from({ length: 7 }, (_, i) => {
      const day = new Date(startOfWeek);
      day.setDate(day.getDate() + i);
      return {
        day: format(day, "dd"),
        count: 0,
        totalAmount: 0,
      };
    });

    orders.forEach((order) => {
      const dayIndex = new Date(order.createdAt).getDay();
      chartData[dayIndex].count += 1;
      chartData[dayIndex].totalAmount += order.totalAmount || 0;
    });

    return chartData;
  } catch (error) {
    console.error("Failed to fetch daily orders:", error);
    throw new Error("Failed to fetch daily orders");
  }
};
