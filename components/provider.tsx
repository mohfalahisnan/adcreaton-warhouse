"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import React, { ReactNode } from "react";
import { TooltipProvider } from "./ui/tooltip";

type Props = {
  children: ReactNode;
};

export const queryClient = new QueryClient();

const Provider = ({ children }: Props) => {
  return (
    <SessionProvider>
      <TooltipProvider>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </TooltipProvider>
    </SessionProvider>
  );
};

export default Provider;
