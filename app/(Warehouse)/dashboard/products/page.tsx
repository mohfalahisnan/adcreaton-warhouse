import { Button } from "@/components/ui/button";
import { Download, Plus } from "lucide-react";
import React from "react";
import { DataTable } from "./_components/data-table";
import { getWarehouseProducts } from "@/lib/actions/products";
import Link from "next/link";

type Props = {};

const Page = async (props: Props) => {
  const warehouse = await getWarehouseProducts({ warehouse_id: 1 });
  if (!warehouse) return;
  // console.log(warehouse.product);
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
        <DataTable data={warehouse} />
      </div>
    </div>
  );
};

export default Page;
