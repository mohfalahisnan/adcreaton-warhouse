"use server";
import { prisma } from "@/lib/prisma";
import { Setting } from "@prisma/client";

export const getSetting = async () => {
  try {
    const data = await prisma.setting.findFirst();
    return data;
  } catch (error) {
    console.log(error);
    throw new Error("Failed to fetch");
  }
};

export const saveSetting = async (data: Setting) => {
  try {
    const setting = await prisma.setting.update({
      where: {
        setting_id: data.setting_id,
      },
      data: data,
    });
    return setting;
  } catch (error) {
    console.log(error);
    throw new Error("Failed to fetch");
  }
};
