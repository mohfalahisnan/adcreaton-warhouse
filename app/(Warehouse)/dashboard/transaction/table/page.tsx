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
import { Customer, Order, Prisma, Transaction } from "@prisma/client";
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
import { deleteOrders, getOrder } from "@/lib/actions/order";
interface TransactionTable
  extends Prisma.OrderGetPayload<{
    include: {
      _count: true;
      OrderItem: true;
      sales_name: true;
      customer_name: true;
    };
  }> {}

const Page = () => {
  const [warehouseId, setWarehouseId] = useLocalStorage("warehouse-id", "1");
  const { data } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => await getOrder(parseInt(warehouseId)),
  });
  const [open, setOpen] = useState(false);
  const [openAdd, setOpenAdd] = useState(false);
  const [selected, setSelected] = useState<string>();

  const deleteQuerys = useMutation({
    mutationFn: async (transaction: Order[]) => await deleteOrders(transaction),
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
  const columnsConfig: ColumnConfig<TransactionTable>[] = [
    {
      accessorKey: "customer_name.name",
      title: "Customer Name",
    },
    {
      accessorKey: "sales_name.name",
      title: "Sales Name",
    },
    {
      accessorKey: "createdAt",
      title: "Order Date",
      type: "date",
    },
    {
      accessorKey: "status",
      title: "Status",
    },
    {
      accessorKey: "totalAmount",
      title: "Total Amount",
      type: "currency",
    },
  ];

  const actionsConfig: ActionConfig<TransactionTable>[] = [
    {
      label: "Copy Id",
      onClick: (transaction: TransactionTable) =>
        navigator.clipboard.writeText(JSON.stringify(transaction.order_id)),
    },
    {
      label: "Delete",
      onClick: (transaction: TransactionTable) => {
        setOpen(true);
        setSelected(transaction.order_id);
      },
    },
  ];

  const columns = createColumns({
    columns: columnsConfig,
    actions: actionsConfig,
  });
  const handleDelete = (selectedRows: TransactionTable[]) => {
    // Implement your delete logic here
    console.log("Deleted rows:", selectedRows);
    // deleteQuerys.mutate(selectedRows);
  };

  const handlePrint = (selectedRows: TransactionTable[]) => {
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
        data={[...data]}
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
              //   onClick={() => deleteQuery.mutate(selected)}
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
