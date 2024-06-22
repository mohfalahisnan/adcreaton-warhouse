"use server";
import { auth } from "@/app/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

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

export const createPayment = async (data: Prisma.PaymentCreateInput) => {
  const session = await auth();
  if (!session) {
    throw new Error("Unauthorized");
  }
  try {
    return await prisma.payment.create({
      data: {
        ...data,
        inputBy: session?.user?.name || "",
      },
    });
  } catch (error) {
    console.log(error);
    throw new Error("Failed to create");
  }
};
