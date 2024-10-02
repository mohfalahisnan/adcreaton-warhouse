"use server";
import { prisma } from "@/lib/prisma";
import { Warehouse } from "@prisma/client";
import { handlePrismaError } from "../handlePrismaError";

export const getWarehouses = async () => {
  try {
    const warehouse = await prisma.warehouse.findMany();
    return warehouse;
  } catch (error) {
    const errorMessage = handlePrismaError(error);
    console.error(errorMessage);
    throw new Error(`Failed to fetch categories: ${errorMessage}`);
  }
};

export const createWarehouse = async ({
  data,
}: {
  data: Omit<Warehouse, "warehouse_id">;
}) => {
  try {
    console.log(data);
    const warehouse = prisma.warehouse.create({
      data: {
        location: data.location,
        name: data.name,
        address: data.address,
        phone: data.phone,
      },
    });
    return warehouse;
  } catch (error) {
    console.log(error);
    throw new Error(`Failed to fetch`);
  }
};

export const getWarehouse = async ({
  warehouse_id,
}: {
  warehouse_id: number;
}) => {
  try {
    const warehouse = await prisma.warehouse.findUnique({
      where: {
        warehouse_id: Number(warehouse_id),
      },
    });
    return warehouse;
  } catch (error) {
    const errorMessage = handlePrismaError(error);
    console.error(errorMessage);
    throw new Error(`Failed to fetch categories: ${errorMessage}`);
  }
};
