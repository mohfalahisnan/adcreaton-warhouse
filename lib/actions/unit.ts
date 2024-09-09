"use server";
import { prisma } from "@/lib/prisma";
import { Satuan } from "@prisma/client";

export const getUnit = async (id: string, warehouseId: number) => {
  try {
    const unit = await prisma.satuan.findMany({
      where: {
        product_id: id,
        warehouseWarehouse_id: warehouseId,
      },
    });
    return unit;
  } catch (error) {
    console.log(error);
    throw new Error("Error fetching unit");
  }
};

export const addUnit = async (
  id: string,
  unit: Satuan,
  warehouseId: number
) => {
  try {
    const units = await prisma.satuan.create({
      data: {
        ...unit,
        product_id: id,
        strata: unit.strata ?? false,
        strataValue: unit.strataValue ?? undefined,
        warehouseWarehouse_id: warehouseId,
      },
    });
    return units;
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
      data: {
        ...satuan,
        strataValue: satuan.strataValue ?? undefined,
      },
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
