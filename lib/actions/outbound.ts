"use server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/app/auth";
import { Outbound } from "@prisma/client";
import { format } from "date-fns";

export const getOutbound = async (id: number) => {
  try {
    const outbound = await prisma.outbound.findMany({
      where: {
        warehouse_id: id,
      },
      include: {
        product: true,
        satuan: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 500,
    });
    return outbound;
  } catch (error) {
    console.log(error);
    throw new Error("Error fetching");
  }
};

export const confirmOutbound = async (id: string) => {
  const session = await auth();
  try {
    return await prisma.outbound.update({
      where: {
        outbound_id: id,
      },
      data: {
        confirm: true,
        confirmBy: session?.user?.name || "",
      },
    });
  } catch (error) {
    throw new Error("Error confirming outbound");
  }
};

export const addOutbound = async (
  data: Outbound & { product_name: string }
) => {
  try {
    await prisma.outbound.create({
      data: {
        quantity: data.quantity,
        notes: `${data.notes},
        product: ${data.product_name}`,
        confirm: data.confirm || false,
        inputBy: data.inputBy,
        satuan: {
          connect: {
            satuan_id: Number(data.satuan_id),
          },
        },
        price: data.price,
        product: {
          connect: {
            product_id: data.product_id || "",
          },
        },
        warehouse: {
          connect: {
            warehouse_id: Number(data.warehouse_id),
          },
        },
      },
    });
    const satuan = await prisma.satuan.findUnique({
      where: { satuan_id: Number(data.satuan_id) },
    });
    await prisma.satuan.update({
      where: {
        satuan_id: Number(data.satuan_id),
      },
      data: {
        product_id: data.product_id || "",
        total: (satuan?.total || 0) - data.quantity,
      },
    });
  } catch (error) {
    console.log(error);
    throw new Error("Error adding outbound");
  }
};

export const rejectOutbound = async (id: string) => {
  const session = await auth();
  try {
    const current = await prisma.outbound.findUnique({
      where: {
        outbound_id: id,
      },
      include: {
        product: {
          include: {
            stock: true,
          },
        },
      },
    });

    const outbound = await prisma.outbound.update({
      where: {
        outbound_id: id,
      },
      data: {
        confirm: false,
        confirmBy: session?.user.name,
      },
    });
    if (!current) {
      throw new Error("Cannot Find outbound data");
    }

    return outbound;
  } catch (error) {
    console.log(error);
    throw new Error("Error rejecting outbound");
  }
};

export const approveOutbound = async (id: string) => {
  const session = await auth();
  try {
    const outbound = await prisma.outbound.update({
      where: {
        outbound_id: id,
      },
      data: {
        confirm: true,
        confirmBy: session?.user.name,
      },
    });
    return outbound;
  } catch (error) {
    console.log(error);
    throw new Error("Error approving outbound");
  }
};

export const getOutboundDaily = async (warehouse_id: number) => {
  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  const endOfWeek = new Date();
  endOfWeek.setDate(endOfWeek.getDate() + (6 - endOfWeek.getDay()));
  endOfWeek.setHours(23, 59, 59, 999);

  try {
    const outbounds = await prisma.outbound.findMany({
      where: {
        warehouse_id: warehouse_id,
        createdAt: {
          gte: startOfWeek,
          lte: endOfWeek,
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    const chartData = Array.from({ length: 7 }, (_, i) => {
      const day = new Date(startOfWeek);
      day.setDate(day.getDate() + i);
      return {
        day: format(day, "dd"),
        quantity: 0,
        totalPrice: 0,
      };
    });

    outbounds.forEach((outbound) => {
      const dayIndex = new Date(outbound.createdAt).getDay();
      chartData[dayIndex].quantity += outbound.quantity;
      chartData[dayIndex].totalPrice += outbound.quantity * outbound.price;
    });
    console.log("outbound", chartData);
    return chartData;
  } catch (error) {
    console.error("Failed to fetch daily outbounds:", error);
    throw new Error("Failed to fetch daily outbounds");
  }
};
