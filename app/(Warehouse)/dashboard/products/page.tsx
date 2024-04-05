"use client";
import { Button } from "@/components/ui/button";
import { Download, Plus } from "lucide-react";
import React from "react";
import { DataTable } from "./_components/data-table";
import { getProducts } from "@/lib/actions/products";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

type Props = {};

const Page = async (props: Props) => {
  const { data } = useQuery({
    queryKey: ["products"],
    queryFn: async () => await getProducts(),
  });
  if (!data) return;
  console.log(data);
  return (
    <div>
      <div>
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold">Product</h3>
          <div className="flex gap-2">
            <Button
              variant={"secondary"}
              asChild
              size={"sm"}
              className="flex items-center gap-2"
            >
              <Link href={"/dashboard/products/add"}>
                <Plus size={12} /> Product
              </Link>
            </Button>
            <Button
              variant={"outline"}
              size={"sm"}
              className="flex items-center gap-2"
            >
              <Download size={12} /> Report
            </Button>
          </div>
        </div>
      </div>
      <div>
        <DataTable data={data} />
      </div>
    </div>
  );
};

export default Page;
