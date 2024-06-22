"use server";
import { prisma } from "@/lib/prisma";
import { Satuan } from "@prisma/client";

export const getUnit = async (id: string) => {
  try {
    const unit = await prisma.satuan.findMany({
      where: {
        product_id: id,
      },
    });
    return unit;
  } catch (error) {
    console.log(error);
    throw new Error("Error fetching unit");
  }
};

export const addUnit = async (id: string, satuan: Satuan) => {
  try {
    const unit = await prisma.satuan.create({
      data: {
        ...satuan,
        product_id: id,
      },
    });
    return satuan;
  } catch (error) {
    console.log(error);
    throw new Error("Error fetching unit");
  }
};

export const editUnit = async (id: number, satuan: Satuan) => {
  try {
    const unit = await prisma.satuan.update({
      where: {
        satuan_id: id,
      },
      data: satuan,
    });
    return unit;
  } catch (error) {
    console.log(error);
    throw new Error("Error fetching unit");
  }
};

export const deleteUnit = async (id: number) => {
  try {
    const unit = await prisma.satuan.delete({
      where: {
        satuan_id: id,
      },
    });
    return unit;
  } catch (error) {
    console.log(error);
    throw new Error("Error fetching unit");
  }
};
