"use server";
import { prisma } from "@/lib/prisma";
import { Category } from "@prisma/client";

export const createCategory = async (data: Category) => {
  try {
    const category = await prisma.category.create({
      data: data,
    });
    return category;
  } catch (error) {
    console.log(error);
    throw new Error("Failed to fetch");
  }
};

export const getCategory = async () => {
  try {
    const category = await prisma.category.findMany();
    return category;
  } catch (error) {
    console.log(error);
    throw new Error("Failed to fetch");
  }
};

export const deleteCategory = async (id: number) => {
  try {
    const category = await prisma.category.delete({
      where: {
        category_id: id,
      },
    });
    return category;
  } catch (error) {
    console.log(error);
    throw new Error("Failed to fetch");
  }
};
