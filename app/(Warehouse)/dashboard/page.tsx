import Overview from "@/components/section/overview";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, Plus } from "lucide-react";
import React from "react";
import { DataTable } from "../_components/data-table";

type Props = {};

const page = (props: Props) => {
  return (
    <div>
      <div>
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold">Dashboard</h3>
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
        <Overview title="Income" value={243} lastweak={432} unit="pcs" />
        <Overview title="Income" value={123} lastweak={112} unit="%" />
        <Overview title="Income" value={343} lastweak={332} unit="pcs" />
        <Overview title="Income" value={343} lastweak={132} unit="pcs" />
      </div>
      <div className="grid grid-cols-1 mt-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <h3>Order</h3>
            <DataTable />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default page;
