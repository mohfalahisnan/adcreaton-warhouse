"use server";
import { prisma } from "@/lib/prisma";
import { Product } from "@prisma/client";

export const getProducts = async (warehouseId: number) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        Category: true,
        stock: {
          include: {
            warehouse: true,
            unit: true,
          },
        },
        Satuan: {
          where: {
            warehouseWarehouse_id: warehouseId,
          },
        },
        _count: true,
      },
      take: 500,
      orderBy: {
        createdAt: "desc",
      },
    });
    console.log(products);
    return products;
  } catch (error) {
    throw new Error("Failed to fetch");
  }
};

export const addProduct = async (product: Product, inputBy: string) => {
  try {
    const products = await prisma.product.create({
      data: {
        ...product,
        inputby: inputBy,
      },
    });
    return products;
  } catch (error) {
    console.log(error);
    throw new Error("Failed to fetch");
  }
};

export const editProduct = async (product: Product, inputBy: string) => {
  try {
    const products = await prisma.product.update({
      where: {
        product_id: product.product_id,
      },
      data: {
        ...product,
        inputby: inputBy,
      },
    });
    return products;
  } catch (error) {
    console.log(error);
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
            warehouse: true,
          },
        },
      },
    });
    return product;
  } catch (error) {
    console.log(error);
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
