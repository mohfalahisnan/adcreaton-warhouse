"use client";
import CustomerForm from "@/components/CustomerForm";
import { ResponsiveDialog } from "@/components/ResponsiveDialog";
import { queryClient } from "@/components/provider";
import { DataTable } from "@/components/table/DataTable";
import {
  ActionConfig,
  ColumnConfig,
  createColumns,
} from "@/components/table/_utils/columns";
import {
  AlertDialogHeader,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

import { useLocalStorage } from "@/hook/useLocalstorage";
import {
  deleteCustomer,
  deleteCustomers,
  getCustomersWarehouse,
} from "@/lib/actions/customer";
import { Customer } from "@prisma/client";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { useMutation, useQuery } from "@tanstack/react-query";
import { CheckCircle2, Plus } from "lucide-react";
import React, { useState } from "react";

const Page = () => {
  const [warehouseId, setWarehouseId] = useLocalStorage("warehouse-id", "1");
  const { data } = useQuery({
    queryKey: ["customer"],
    queryFn: async () => await getCustomersWarehouse(parseInt(warehouseId)),
  });
  const [open, setOpen] = useState(false);
  const [openAdd, setOpenAdd] = useState(false);
  const [selected, setSelected] = useState<number>();
  const deleteQuery = useMutation({
    mutationFn: async (id: number) => await deleteCustomer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer"] });

      setOpen(false);
      toast({
        description: (
          <div className="flex items-center justify-between gap-2">
            <div>
              <span className="text-green-500">
                <CheckCircle2 size={28} strokeWidth={1} />
              </span>
            </div>
            <div>
              <h3 className="text-lg">Customer Deleted!</h3>
            </div>
          </div>
        ),
      });
    },
    onError(error) {
      toast({
        title: `Error: ${error.message}`,
        description: `${error.message}`,
        variant: "destructive",
      });
    },
  });
  const deleteQuerys = useMutation({
    mutationFn: async (customers: Customer[]) =>
      await deleteCustomers(customers),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer"] });

      setOpen(false);
      toast({
        description: (
          <div className="flex items-center justify-between gap-2">
            <div>
              <span className="text-green-500">
                <CheckCircle2 size={28} strokeWidth={1} />
              </span>
            </div>
            <div>
              <h3 className="text-lg">Customer Deleted!</h3>
            </div>
          </div>
        ),
      });
    },
    onError(error) {
      toast({
        title: `Error: ${error.message}`,
        description: `${error.message}`,
        variant: "destructive",
      });
    },
  });
  const columnsConfig: ColumnConfig<Customer>[] = [
    {
      accessorKey: "name",
      title: "Name",
    },
    {
      accessorKey: "phone",
      title: "Phone",
    },
    {
      accessorKey: "alamat",
      title: "Alamat",
    },
  ];

  const actionsConfig: ActionConfig<Customer>[] = [
    {
      label: "Copy Id",
      onClick: (employee: Customer) =>
        navigator.clipboard.writeText(JSON.stringify(employee.customer_id)),
    },
    {
      label: "Delete",
      onClick: (employee: Customer) => {
        setOpen(true);
        setSelected(employee.customer_id);
      },
    },
  ];

  const columns = createColumns({
    columns: columnsConfig,
    actions: actionsConfig,
  });
  const handleDelete = (selectedRows: Customer[]) => {
    // Implement your delete logic here
    console.log("Deleted rows:", selectedRows);
    deleteQuerys.mutate(selectedRows);
  };

  const handlePrint = (selectedRows: Customer[]) => {
    // Implement your edit logic here
    console.log("Edited rows:", selectedRows);
  };
  if (!data) return null;
  return (
    <div>
      <div className="w-full flex items-end justify-end">
        <ResponsiveDialog
          title="Add Employee"
          description=""
          triggerContent={
            <Button size={"sm"} className="flex items-center gap-2">
              <Plus size={12} /> Customer
            </Button>
          }
          open={openAdd}
          onOpenChange={setOpenAdd}
        >
          <div className="max-h-[70vh] overflow-auto">
            <CustomerForm onSuccess={() => setOpenAdd(false)} />
          </div>
        </ResponsiveDialog>
      </div>
      <DataTable
        columns={columns}
        data={data}
        onDelete={handleDelete}
        onPrint={handlePrint}
      />
      <AlertDialog open={open}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete and
              remove your data from our servers.
              {/* {selected} */}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setOpen(false);
                setSelected(undefined);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteQuery.mutate(selected as number)}
              className="bg-destructive hover:bg-destructive"
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Page;
