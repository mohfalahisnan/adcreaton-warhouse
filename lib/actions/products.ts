"use server";
import { prisma } from "@/lib/prisma";
import { Prisma, Product } from "@prisma/client";

export const getWarehouseProducts = async ({
  warehouse_id,
}: {
  warehouse_id?: number;
}) => {
  try {
    const products = await prisma.warehouse.findUnique({
      where: {
        warehouse_id: warehouse_id,
      },
      select: {
        product: {
          include: {
            stock: {
              where: {
                warehouse_id: warehouse_id,
              },
            },
            Category: {
              select: {
                name: true,
              },
            },
            warehouse: { select: { warehouse_id: true } },
          },
        },
      },
    });
    return products;
  } catch (error) {
    throw new Error("Failed to fetch");
  }
};

export const addProduct = async (product: Product) => {
  try {
    const products = await prisma.product.create({
      data: {
        ...product,
        warehouse: {
          connect: {
            warehouse_id: 1,
          },
        },
        stock: {
          createMany: {
            data: [
              { total: 100, warehouse_id: 1 },
              { total: 120, warehouse_id: 2 },
            ],
          },
        },
      },
    });
    return products;
  } catch (error) {
    throw new Error("Failed to fetch");
  }
};

export const deleteProduct = async (id: string) => {
  try {
    const product = await prisma.product.delete({
      where: {
        product_id: id,
      },
    });
    return product;
  } catch (error) {
    console.log(error);
    throw new Error("falied");
  }
};
