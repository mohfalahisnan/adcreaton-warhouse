"use server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/app/auth";
import { Outbound } from "@prisma/client";

export const getOutbound = async (id: number) => {
  try {
    const outbound = await prisma.outbound.findMany({
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
    return outbound;
  } catch (error) {
    console.log(error);
    throw new Error("Error fetching");
  }
};

export const confirmOutbound = async (id: string) => {
  const session = await auth();
  try {
    return await prisma.outbound.update({
      where: {
        outbound_id: id,
      },
      data: {
        confirm: true,
        confirmBy: session?.user?.name || "",
      },
    });
  } catch (error) {
    throw new Error("Error confirming outbound");
  }
};

export const addOutbound = async (
  data: Outbound & { product_name: string }
) => {
  try {
    await prisma.outbound.create({
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
          total: stock.total - data.quantity,
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
    throw new Error("Error adding outbound");
  }
};

export const rejectOutbound = async (id: string) => {
  const session = await auth();
  try {
    const current = await prisma.outbound.findUnique({
      where: {
        outbound_id: id,
      },
      include: {
        product: {
          include: {
            stock: true,
          },
        },
      },
    });

    const outbound = await prisma.outbound.update({
      where: {
        outbound_id: id,
      },
      data: {
        confirm: false,
        confirmBy: session?.user.name,
      },
    });
    if (!current) {
      throw new Error("Cannot Find outbound data");
    }

    const stock = await prisma.stock.findFirst({
      where: {
        product_id: current.product_id || "",
        warehouse_id: outbound.warehouse_id,
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
        total: stock.total + outbound.quantity,
      },
    });

    const inbound = await prisma.inbound.create({
      data: {
        inputBy: session?.user.name || "",
        warehouse_id: outbound.warehouse_id,
        notes: `#REJECTED #OUTBOUND-${outbound.outbound_id}`,
        quantity: outbound.quantity,
        product_id: outbound.product_id,
      },
    });

    return { inbound, update, outbound };
  } catch (error) {
    console.log(error);
    throw new Error("Error adding inbound");
  }
};

export const approveOutbound = async (id: string) => {
  const session = await auth();
  try {
    const outbound = await prisma.outbound.update({
      where: {
        outbound_id: id,
      },
      data: {
        confirm: true,
        confirmBy: session?.user.name,
      },
    });
    return outbound;
  } catch (error) {
    console.log(error);
    throw new Error("Error adding inbound");
  }
};
