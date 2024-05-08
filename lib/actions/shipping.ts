"use server";
import { prisma } from "@/lib/prisma";
import { Shipment } from "@prisma/client";

export const createShipment = async (data: Omit<Shipment, "shipment_id">) => {
  try {
    const shipment = await prisma.shipment.create({
      data: data,
    });
    const update = await prisma.order.update({
      where: {
        order_id: data.order_id as string,
      },
      data: {
        status: "ON_DELEVERY",
      },
    });
    return { shipment, update };
  } catch (error) {
    console.log(error);
    throw new Error("Failed to fetch");
  }
};

export const getShipment = async (warehouse_id: number) => {
  try {
    const shipment = await prisma.shipment.findMany({
      where: {
        warehouse_id: warehouse_id,
      },
      include: {
        Car: true,
      },
    });
    return shipment;
  } catch (error) {
    console.log(error);
    throw new Error("Failed to fetch");
  }
};

export const deleteShipment = async (id: string) => {
  try {
    await prisma.shipment.delete({
      where: {
        shipment_id: id,
      },
    });
  } catch (error) {
    console.log(error);
    throw new Error("Failed to fetch");
  }
};
