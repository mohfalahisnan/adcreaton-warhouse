"use server";
import { auth } from "@/app/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { format } from "date-fns";

export const getPayment = async (warehouse: number) => {
  try {
    return await prisma.payment.findMany({
      where: {
        warehouseId: warehouse,
      },
      take: 500,
      orderBy: {
        createdAt: "desc",
      },
    });
  } catch (error) {
    throw new Error("Failed to fetch");
  }
};

export const getPaymentDaily = async (warehouse: number) => {
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
    const payments = await prisma.payment.findMany({
      where: {
        warehouseId: warehouse,
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      take: 1000,
      orderBy: {
        createdAt: "desc",
      },
    });
    const totalAmount = payments.reduce(
      (sum, payment) => sum + payment.amount,
      0
    );
    const paymentWeek = await prisma.payment.findMany({
      where: {
        warehouseId: warehouse,
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
        amount: 0,
      };
    });

    paymentWeek.forEach((payment) => {
      const dayIndex = new Date(payment.createdAt).getDay();
      chartData[dayIndex].amount += payment.amount;
    });

    console.log(chartData);

    return { payments, totalAmount, chartData };
  } catch (error) {
    throw new Error("Failed to fetch");
  }
};

export const getPaymentWeekly = async (warehouse: number) => {
  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  const endOfWeek = new Date();
  endOfWeek.setDate(endOfWeek.getDate() + (6 - endOfWeek.getDay()));
  endOfWeek.setHours(23, 59, 59, 999);
  try {
    const payments = await prisma.payment.findMany({
      where: {
        warehouseId: warehouse,
        createdAt: {
          gte: startOfWeek,
          lte: endOfWeek,
        },
      },
      take: 1000,
      orderBy: {
        createdAt: "desc",
      },
    });
    const totalAmount = payments.reduce(
      (sum, payment) => sum + payment.amount,
      0
    );

    return { payments, totalAmount };
  } catch (error) {
    throw new Error("Failed to fetch");
  }
};
export const getTransferPaymentDaily = async (warehouse_id: number) => {
  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  const endOfWeek = new Date();
  endOfWeek.setDate(endOfWeek.getDate() + (6 - endOfWeek.getDay()));
  endOfWeek.setHours(23, 59, 59, 999);

  try {
    const payments = await prisma.payment.findMany({
      where: {
        warehouseId: warehouse_id,
        method: "TRANSFER", // Filter for TRANSFER payments
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
        count: 0,
        totalAmount: 0,
      };
    });

    payments.forEach((payment) => {
      const dayIndex = new Date(payment.createdAt).getDay();
      chartData[dayIndex].count += 1;
      chartData[dayIndex].totalAmount += payment.amount;
    });

    return chartData;
  } catch (error) {
    console.error("Failed to fetch daily transfer payments:", error);
    throw new Error("Failed to fetch daily transfer payments");
  }
};

export const getPaymentMonthly = async (warehouse: number) => {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  const endOfMonth = new Date(startOfMonth);
  endOfMonth.setMonth(endOfMonth.getMonth() + 1);
  endOfMonth.setDate(0);
  endOfMonth.setHours(23, 59, 59, 999);
  try {
    const payments = await prisma.payment.findMany({
      where: {
        warehouseId: warehouse,
        createdAt: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      take: 1000,
      orderBy: {
        createdAt: "desc",
      },
    });
    const totalAmount = payments.reduce(
      (sum, payment) => sum + payment.amount,
      0
    );

    return { payments, totalAmount };
  } catch (error) {
    throw new Error("Failed to fetch");
  }
};

export const getPaymentById = async (id: string) => {
  try {
    return await prisma.payment.findUnique({
      where: {
        payment_id: id,
      },
    });
  } catch (error) {
    throw new Error("Failed to fetch");
  }
};

export const getPaymentByOrderId = async (id: string) => {
  try {
    return await prisma.payment.findUnique({
      where: {
        orderId: id,
      },
    });
  } catch (error) {
    throw new Error("Failed to fetch");
  }
};

export const createPayment = async (
  data: Prisma.PaymentCreateInput,
  id: string
) => {
  const session = await auth();
  if (!session) {
    throw new Error("Unauthorized");
  }
  try {
    const payment = await prisma.payment.create({
      data: {
        ...data,
        inputBy: session?.user?.name || "",
      },
    });
    await prisma.order.update({
      where: {
        order_id: id,
      },
      data: {
        status: "PAID",
      },
    });
    return payment;
  } catch (error) {
    console.log(error);
    throw new Error("Failed to create");
  }
};
