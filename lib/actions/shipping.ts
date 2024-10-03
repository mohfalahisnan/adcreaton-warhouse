"use server";
import { auth } from "@/app/auth";
import { prisma } from "@/lib/prisma";

import { Shipment } from "@prisma/client";

export const createShipment = async (data: Omit<Shipment, "shipment_id">) => {
  try {
    const session = await auth();
    if (!session) {
      throw new Error("Unauthorized");
    }
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
    const orderItems = await prisma.order.findUnique({
      where: {
        order_id: data.order_id as string,
      },
      include: {
        OrderItem: {
          include: {
            satuan: true,
            product: true,
          },
        },
      },
    });

    const outboundPromises = orderItems?.OrderItem.map(async (item) => {
      await prisma.outbound.create({
        data: {
          product_id: item.product_id as string,
          quantity: item.quantity as number,
          satuan_id: item.satuan_id as number,
          price: item.satuan?.price as number,
          notes: `#OUTBOUND-${orderItems.order_code}`,
          warehouse_id: data.warehouse_id,
          inputBy: session.user.id || "",
          confirm: true,
        },
      });
      await prisma.satuan.update({
        where: {
          satuan_id: item.satuan_id || 1,
        },
        data: {
          product_id: item.product_id,
          total: (item.satuan?.total || 0) - item.quantity,
        },
      });
    });

    if (outboundPromises) {
      await Promise.all(outboundPromises);
    }
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
