"use client";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getWarehouseProducts } from "@/lib/actions/products";
type Props = {};

const Page = (props: Props) => {
  const data = useQuery({
    queryKey: ["employee"],
    queryFn: async () => await getWarehouseProducts({ warehouse_id: 1 }),
  });

  return <div>{JSON.stringify(data.data?.product)}</div>;
};

export default Page;
