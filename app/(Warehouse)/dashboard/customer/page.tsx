"use client";
import { useGetEmployee } from "@/hook/useEmployee";
import React, { useState } from "react";
import Loading from "@/components/Loading";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Condition from "@/components/Condition";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ResponsiveDialog } from "@/components/ResponsiveDialog";
import EmployeeForm from "@/components/EmployeeForm";
import { useLocalStorage } from "@/hook/useLocalstorage";
import TableSales from "@/components/TableSales";
import { useQuery } from "@tanstack/react-query";
import { getSales } from "@/lib/actions/accounts";
import SalesForm from "@/components/SalesForm";
import TableCustomer from "@/components/TableCustomer";
import { getCustomersWarehouse } from "@/lib/actions/customer";
import CustomerForm from "@/components/CustomerForm";

const Page = () => {
  const [warehouseId, setWarehouseId] = useLocalStorage("warehouse-id", "1");

  const datas = useQuery({
    queryKey: ["customer"],
    queryFn: async () => await getCustomersWarehouse(parseInt(warehouseId)),
  });
  const [open, setOpen] = useState(false);
  return (
    <div>
      <Condition show={datas.isLoading}>
        <Loading />
      </Condition>
      <Condition show={!datas.isLoading}>
        <div className="flex justify-end items-center mb-4">
          <div className="flex gap-2">
            <ResponsiveDialog
              title="Add Sales"
              description=""
              triggerContent={
                <Button size={"sm"} className="flex items-center gap-2">
                  <Plus size={12} /> Customer
                </Button>
              }
              open={open}
              onOpenChange={setOpen}
            >
              <div className="max-h-[70vh] overflow-auto">
                <CustomerForm onSuccess={() => setOpen(false)} />
              </div>
            </ResponsiveDialog>
          </div>
        </div>
        <Card className="p-4">
          <CardHeader>
            <CardTitle>Customer</CardTitle>
            <CardDescription>
              Recent Customer from your warehouse.
            </CardDescription>
          </CardHeader>
          <TableCustomer data={datas.data || []} />
        </Card>
      </Condition>
    </div>
  );
};

export default Page;