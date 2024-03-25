import { Button } from "@/components/ui/button";
import { Download, Plus } from "lucide-react";
import React from "react";
import { DataTable } from "./_components/data-table";

type Props = {};

const Page = (props: Props) => {
  return (
    <div>
      <div>
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold">Product</h3>
          <div className="flex gap-2">
            <Button
              variant={"secondary"}
              size={"sm"}
              className="flex items-center gap-2"
            >
              <Plus size={12} /> Transaction
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
        <DataTable />
      </div>
    </div>
  );
};

export default Page;
