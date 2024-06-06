"use server";
import { prisma } from "@/lib/prisma";
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
    });
    return outbound;
  } catch (error) {
    console.log(error);
    throw new Error("Error fetching");
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
        confirm: data.confirm || true,
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
