"use server";
import { prisma } from "@/lib/prisma";

export const getCars = async (warehouse_id: number) => {
  try {
    const car = await prisma.car.findMany({
      where: {
        warehouse_id: warehouse_id,
      },
    });
    return car;
  } catch (error) {
    console.log(error);
    throw new Error("Failed to fetch");
  }
};
