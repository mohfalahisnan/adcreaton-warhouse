"use server";
import { auth } from "@/app/auth";
import { prisma } from "@/lib/prisma";
import { Inbound } from "@prisma/client";

export const getInbound = async (id: number) => {
  try {
    const inbound = await prisma.inbound.findMany({
      where: {
        warehouse_id: id,
      },
      include: {
        product: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 500,
    });
    return inbound;
  } catch (error) {
    console.log(error);
    throw new Error("Error fetching inbound");
  }
};

export const confirmInbound = async (id: string) => {
  const session = await auth();
  try {
    return await prisma.inbound.update({
      where: {
        inbound_id: id,
      },
      data: {
        confirm: true,
        confirmBy: session?.user?.name || "",
      },
    });
  } catch (error) {
    throw new Error("Error confirming inbound");
  }
};

export const addInbound = async (data: Inbound & { product_name: string }) => {
  try {
    await prisma.inbound.create({
      data: {
        quantity: data.quantity,
        notes: `${data.notes},
        product: ${data.product_name}`,
        confirm: data.confirm || false,
        inputBy: data.inputBy,
        product: {
          connect: {
            product_id: data.product_id || "",
          },
        },
        warehouse: {
          connect: {
            warehouse_id: Number(data.warehouse_id),
          },
        },
      },
    });
    const stock = await prisma.stock.findFirst({
      where: {
        product_id: data.product_id || "",
        warehouse_id: Number(data.warehouse_id),
      },
    });
    if (stock) {
      return await prisma.stock.update({
        where: {
          stock_id: stock.stock_id,
        },
        data: {
          total: stock.total + data.quantity,
        },
      });
    } else {
      return await prisma.stock.create({
        data: {
          product_id: data.product_id || "",
          warehouse_id: Number(data.warehouse_id),
          total: data.quantity,
        },
      });
    }
  } catch (error) {
    console.log(error);
    throw new Error("Error adding inbound");
  }
};

export const inboundCancelOrder = async ({
  order_id,
}: {
  order_id: string;
}) => {
  const session = await auth();
  try {
    const order = await prisma.order.findUnique({
      where: {
        order_id: order_id,
      },
      include: {
        OrderItem: {
          include: {
            product: {
              include: {
                stock: true,
              },
            },
            satuan: true,
          },
        },
      },
    });
    if (!order) {
      throw new Error("Order not found");
    }
    let warehouse_id = order.warehouse_id || 1;

    for (const item of order.OrderItem) {
      let qty = item.quantity * (item.satuan?.multiplier || 1);
      const stock = await prisma.stock.findFirst({
        where: {
          product_id: item.product.product_id,
          warehouse_id: warehouse_id,
        },
      });
      if (stock) {
        await prisma.stock.update({
          where: {
            stock_id: stock.stock_id,
          },
          data: {
            total: stock.total + qty,
          },
        });
      }
      const inbound = await prisma.inbound.create({
        data: {
          inputBy: session?.user.name || "",
          notes: `#CANCEL #ORDER-${order.order_code}`,
          quantity: qty,
          confirm: false,
          product_id: item.product_id,
          warehouse_id,
        },
      });

      const update = await prisma.order.update({
        where: {
          order_id: order_id,
        },
        data: {
          status: "CANCELED",
        },
      });
      return { inbound, update };
    }

    const cancel = await prisma.order.update({
      where: {
        order_id: order_id,
      },
      data: {
        status: "CANCELED",
      },
    });

    return cancel;
  } catch (error) {
    console.log(error);
    throw new Error("Error adding inbound");
  }
};

export const rejectInbound = async (id: string) => {
  const session = await auth();
  try {
    const current = await prisma.inbound.findUnique({
      where: {
        inbound_id: id,
      },
      include: {
        product: {
          include: {
            stock: true,
          },
        },
      },
    });

    const inbound = await prisma.inbound.update({
      where: {
        inbound_id: id,
      },
      data: {
        confirm: false,
        confirmBy: session?.user.name,
      },
    });
    if (!current) {
      throw new Error("Cannot Find inbound data");
    }

    const stock = await prisma.stock.findFirst({
      where: {
        product_id: current.product_id || "",
        warehouse_id: inbound.warehouse_id,
      },
    });

    if (!stock) {
      throw new Error("cannot find stock");
    }

    const update = await prisma.stock.update({
      where: {
        stock_id: stock.stock_id,
      },
      data: {
        total: stock.total - inbound.quantity,
      },
    });

    const outbound = await prisma.outbound.create({
      data: {
        inputBy: session?.user.name || "",
        warehouse_id: inbound.warehouse_id,
        notes: `#REJECTED #INBOUND-${inbound.inbound_id}`,
        quantity: inbound.quantity,
        product_id: inbound.product_id,
        confirm: true,
        confirmBy: session?.user.name,
      },
    });

    return { inbound, update, outbound };
  } catch (error) {
    console.log(error);
    throw new Error("Error adding inbound");
  }
};

export const approveInbound = async (id: string) => {
  const session = await auth();
  try {
    const inbound = await prisma.inbound.update({
      where: {
        inbound_id: id,
      },
      data: {
        confirm: true,
        confirmBy: session?.user.name,
      },
    });
    return inbound;
  } catch (error) {
    console.log(error);
    throw new Error("Error adding inbound");
  }
};
