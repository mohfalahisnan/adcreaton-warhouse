"use server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

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

export const addCar = async (data: Prisma.CarCreateInput) => {
  try {
    const car = await prisma.car.create({
      data: data,
    });
    return car;
  } catch (error) {
    console.log(error);
    throw new Error("Failed to fetch");
  }
};

export const editCar = async (data: Prisma.CarUpdateInput, id: string) => {
  try {
    const car = await prisma.car.update({
      data: data,
      where: {
        car_id: id,
      },
    });
    return car;
  } catch (error) {
    console.log(error);
    throw new Error("Failed to fetch");
  }
};

export const getCar = async (id: string) => {
  try {
    return await prisma.car.findUnique({
      where: {
        car_id: id,
      },
    });
  } catch (error) {
    console.log(error);
    throw new Error("Failed to fetch");
  }
};

export const deleteCar = async (id: string) => {
  try {
    return await prisma.car.delete({
      where: {
        car_id: id,
      },
    });
  } catch (error) {
    console.log(error);
    throw new Error("Failed to fetch");
  }
};
