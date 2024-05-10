import MainNav from "@/components/layout/main-nav";
import Sidebar from "@/components/layout/sidebar";

import { Metadata } from "next";
import React, { ReactNode } from "react";
import { auth } from "../auth";
import { redirect } from "next/navigation";
import { getSetting } from "@/lib/actions/setting";

type Props = {
  children: ReactNode;
};

export const metadata = async (): Promise<Metadata> => {
  const data = await getSetting();
  return {
    title: data?.web_title || "Dashboard",
    description: data?.web_description || "Description",
  };
};

const DashboardLayout = async ({ children }: Props) => {
  const session = await auth();
  if (!session) redirect("/login");
  return (
    <div className="flex bg-accent">
      <Sidebar />
      <div className="flex-1 w-full">
        <MainNav />
        <div className="bg-background p-4 min-h-[calc(100vh-4rem)]">
          {children}
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
