"use server";
import { prisma } from "@/lib/prisma";
import { Product } from "@prisma/client";

export const getProducts = async () => {
  try {
    const products = await prisma.product.findMany({
      include: {
        Category: true,
        stock: {
          include: {
            warhouse: true,
          },
        },
        _count: true,
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

export const getProductById = async (id: string) => {
  try {
    const product = await prisma.product.findUnique({
      where: {
        product_id: id,
      },
      include: {
        Category: true,
        stock: {
          include: {
            warhouse: true,
          },
        },
      },
    });
    return product;
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
