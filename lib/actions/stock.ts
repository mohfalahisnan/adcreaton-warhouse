"use server";
import { prisma } from "@/lib/prisma";

export const updateStock = async (stockId: number, total: number) => {
  try {
    const stock = await prisma.stock.update({
      where: {
        stock_id: stockId,
      },
      data: {
        total: total,
      },
    });
    return stock;
  } catch (error) {
    console.log(error);
    throw new Error("Failed to fetch");
  }
};

export const newStock = async (
  productId: string,
  warehouseId: number,
  total: number
) => {
  try {
    const stock = await prisma.stock.create({
      //@ts-ignore
      data: {
        total: total,
        product_id: productId,
        warehouse_id: warehouseId,
      },
    });
    return stock;
  } catch (error) {
    console.log(error);
    throw new Error("Failed to fetch");
  }
};

export const getStockByProduct = async (
  productId: string,
  warehouseId: number
) => {
  try {
    return await prisma.stock.findFirst({
      where: {
        product_id: productId,
        warehouse_id: warehouseId,
      },
    });
  } catch (error) {
    console.log(error);
    throw new Error("Failed to fetch");
  }
};
