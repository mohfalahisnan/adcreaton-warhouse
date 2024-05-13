"use server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export const getCustomers = async () => {
  try {
    const customers = await prisma.customer.findMany();
    return customers;
  } catch (error) {
    console.log(error);
    throw new Error("Failed to fetch");
  }
};

export const addCustomer = async (data: Prisma.CustomerCreateInput) => {
  try {
    return await prisma.customer.create({
      data: data,
    });
  } catch (error) {
    console.log(error);
    throw new Error("Failed to fetch");
  }
};

export const getCustomersWarehouse = async (id: number) => {
  try {
    const customers = await prisma.customer.findMany({
      where: { warehouse_id: id },
    });
    return customers;
  } catch (error) {
    console.log(error);
    throw new Error("Failed to fetch");
  }
};

export const deleteCustomer = async (id: number) => {
  try {
    const cusomer = await prisma.customer.delete({
      where: {
        customer_id: id,
      },
    });
    return cusomer;
  } catch (error) {
    console.log(error);
    throw new Error("Failed to fetch");
  }
};
