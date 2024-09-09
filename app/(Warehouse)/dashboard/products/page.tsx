"use client";
import { Button } from "@/components/ui/button";
import { Download, Plus } from "lucide-react";
import React from "react";
import { DataTable } from "./_components/data-table";
import Link from "next/link";
import { useGetProducts } from "@/hook/useProduct";
import Condition from "@/components/Condition";
import Loading from "./loading";
import { useLocalStorage } from "@/hook/useLocalstorage";
import { useQuery } from "@tanstack/react-query";
import { getRoleByEmail } from "@/lib/actions/accounts";
import { useSession } from "next-auth/react";

const Page = () => {
  const [warehouseId, setWarehouseId] = useLocalStorage("warehouse-id", "1");

  const { data, isLoading } = useGetProducts({
    warehouseId: parseFloat(warehouseId),
  });
  const session = useSession();
  const userRole = useQuery({
    queryKey: ["role"],
    queryFn: async () => await getRoleByEmail(session.data?.user.email || ""),
    enabled: !!session.data?.user.email,
  });
  if (!userRole.data) return null;
  if (!data) return null;
  const filteredProducts = data.filter(
    (product) => product.Satuan && product.Satuan.length > 0,
  );
  return (
    <div>
      <div>
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold">Product</h3>
          <div
            className={`flex gap-2 ${userRole.data.role === "CHECKER" && "hidden"}`}
          >
            <Button
              asChild
              size={"sm"}
              className={`flex items-center gap-2 ${userRole.data.role === "CHECKER" && "hidden"}`}
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
          <DataTable data={filteredProducts as any} />
        </Condition>
      </div>
    </div>
  );
};

export default Page;
