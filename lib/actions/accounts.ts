"use server";
import { prisma } from "@/lib/prisma";
import { Prisma, User } from "@prisma/client";
import bcrypt from "bcrypt";

const hashPassword = async (password: string) => {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  return hashedPassword;
};

export const createUser = async (data: Prisma.UserCreateInput) => {
  if (!data.password) return null;
  const hashedPassword = await hashPassword(data.password);
  try {
    const account = await prisma.user.create({
      data: { ...data, password: hashedPassword },
    });
    return account;
  } catch (error) {
    throw new Error("Failed to fetch");
  }
};

export const loginUser = async ({
  username,
  password,
}: {
  username: string;
  password: string;
}) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        username: username,
      },
    });
    if (!user) {
      return { status: "failed", message: "User not found" };
    }

    if (user.password) {
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (passwordMatch) {
        return { status: "success", data: user };
      } else {
        return { status: "failed", message: "Incorrect password" };
      }
    } else {
      return { status: "failed", message: "Incomplete user data" };
    }
  } catch (error) {
    console.error("Error:", error);
    return { status: "failed", message: "Internal server error" };
  }
};

export const getUserByEmail = async (email: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });
    return { status: "success", data: user };
  } catch (error) {
    return { status: "failed" };
  }
};

export const getAllUser = async (): Promise<User[]> => {
  try {
    const users = await prisma.user.findMany();
    return users;
  } catch (error) {
    throw new Error();
  }
};

export const getAllEmployee = async (warehouse_id: number): Promise<User[]> => {
  try {
    const users = await prisma.user.findMany({
      where: {
        role: "EMPLOYEE",
        warehouse_id: warehouse_id,
      },
    });
    return users;
  } catch (error) {
    throw new Error();
  }
};

export const addEmployee = async (data: User): Promise<User> => {
  try {
    const user = await prisma.user.create({
      data: data,
    });
    return user;
  } catch (error) {
    throw new Error();
  }
};

export const deleteUser = async (id: string) => {
  try {
    const user = await prisma.user.delete({
      where: {
        user_id: id,
      },
    });
    return user;
  } catch (error) {
    throw new Error();
  }
};
