"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export const queryClient = new QueryClient();

const Provider = ({ children }: Props) => {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

export default Provider;
