"use client";
import { Button } from "@/components/ui/button";
import { Download, Plus } from "lucide-react";
import React from "react";
import { DataTable } from "./_components/data-table";
import Link from "next/link";
import { useGetProducts } from "@/hook/useProduct";
import Condition from "@/components/Condition";
import Loading from "./loading";

const Page = () => {
  const { data, isLoading } = useGetProducts();

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
        <Condition show={isLoading}>
          <Loading />
        </Condition>
        <Condition show={!isLoading}>
          <DataTable data={data || []} />
        </Condition>
      </div>
    </div>
  );
};

export default Page;
