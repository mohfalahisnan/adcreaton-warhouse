"use server";
import { auth } from "@/app/auth";
import { prisma } from "@/lib/prisma";
import { Inbound } from "@prisma/client";
import { format } from "date-fns";

export const getInbound = async (id: number) => {
  try {
    const inbound = await prisma.inbound.findMany({
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
    return inbound;
  } catch (error) {
    console.log(error);
    throw new Error("Error fetching inbound");
  }
};

export const confirmInbound = async (id: string) => {
  const session = await auth();
  try {
    return await prisma.inbound.update({
      where: {
        inbound_id: id,
      },
      data: {
        confirm: true,
        confirmBy: session?.user?.name || "",
      },
    });
  } catch (error) {
    throw new Error("Error confirming inbound");
  }
};

export const addInbound = async (data: Inbound & { product_name: string }) => {
  try {
    console.log(data.satuan_id);
    if (!data.satuan_id) throw new Error("no unit");

    await prisma.inbound.create({
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
    const currentStock = await prisma.satuan.findUnique({
      where: {
        satuan_id: Number(data.satuan_id),
      },
    });
    await prisma.satuan.update({
      where: {
        satuan_id: Number(data.satuan_id),
      },
      data: {
        total: (currentStock?.total || 0) + data.quantity,
      },
    });
  } catch (error) {
    console.log(error);
    throw new Error("Error adding inbound");
  }
};

export const rejectInbound = async (id: string) => {
  const session = await auth();
  try {
    const current = await prisma.inbound.findUnique({
      where: {
        inbound_id: id,
      },
      include: {
        product: {
          include: {
            stock: true,
          },
        },
      },
    });

    const inbound = await prisma.inbound.update({
      where: {
        inbound_id: id,
      },
      data: {
        confirm: false,
        confirmBy: session?.user.name,
      },
    });
    if (!current) {
      throw new Error("Cannot Find inbound data");
    }

    return inbound;
  } catch (error) {
    console.log(error);
    throw new Error("Error rejecting inbound");
  }
};
export const getBarangMasuk = async (warehouse: number) => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);
  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  const endOfWeek = new Date();
  endOfWeek.setDate(endOfWeek.getDate() + (6 - endOfWeek.getDay()));
  endOfWeek.setHours(23, 59, 59, 999);
  try {
    const barang = await prisma.inbound.findMany({
      where: {
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
        warehouse_id: warehouse,
      },
      take: 1000,
      orderBy: {
        createdAt: "desc",
      },
    });
    const barangWeek = await prisma.inbound.findMany({
      where: {
        createdAt: {
          gte: startOfWeek,
          lte: endOfWeek,
        },
        warehouse_id: warehouse,
      },
      take: 1000,
      orderBy: {
        createdAt: "desc",
      },
    });
    const list = await prisma.inbound.findMany({
      where: {
        warehouse_id: warehouse,
      },
      take: 1000,
    });
    return { barangWeek, barang, list };
  } catch (error) {
    throw new Error("Failed to fetch");
  }
};

export const approveInbound = async (id: string) => {
  const session = await auth();
  try {
    const inbound = await prisma.inbound.update({
      where: {
        inbound_id: id,
      },
      data: {
        confirm: true,
        confirmBy: session?.user.name,
      },
    });
    return inbound;
  } catch (error) {
    console.log(error);
    throw new Error("Error adding inbound");
  }
};

export const getInboundDaily = async (warehouse_id: number) => {
  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  const endOfWeek = new Date();
  endOfWeek.setDate(endOfWeek.getDate() + (6 - endOfWeek.getDay()));
  endOfWeek.setHours(23, 59, 59, 999);

  try {
    const inbounds = await prisma.inbound.findMany({
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

    inbounds.forEach((inbound) => {
      const dayIndex = new Date(inbound.createdAt).getDay();
      chartData[dayIndex].quantity += inbound.quantity;
      chartData[dayIndex].totalPrice += inbound.quantity * inbound.price;
    });
    console.log("inbound", chartData);
    return chartData;
  } catch (error) {
    console.error("Failed to fetch daily inbounds:", error);
    throw new Error("Failed to fetch daily inbounds");
  }
};
