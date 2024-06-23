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
