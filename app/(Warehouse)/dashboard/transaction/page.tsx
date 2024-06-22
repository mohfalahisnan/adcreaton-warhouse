"use client";
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
import { Order, Prisma } from "@prisma/client";
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
import { deleteOrder, deleteOrders, getOrder } from "@/lib/actions/order";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Payment from "./Payment";
export interface TransactionTable
  extends Prisma.OrderGetPayload<{
    include: {
      _count: true;
      OrderItem: {
        include: {
          product: true;
          satuan: true;
        };
      };
      sales_name: true;
      customer_name: true;
    };
  }> {}

const Page = () => {
  const [warehouseId, setWarehouseId] = useLocalStorage("warehouse-id", "1");
  const { data } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => await getOrder(parseInt(warehouseId), true),
  });
  const [open, setOpen] = useState(false);
  const [openAdd, setOpenAdd] = useState(false);
  const [openCancel, setOpenCancel] = useState(false);
  const [selected, setSelected] = useState<string>();
  const route = useRouter();
  const deleteQuerys = useMutation({
    mutationFn: async (transaction: Order[]) => await deleteOrders(transaction),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });

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
              <h3 className="text-lg">Order Deleted!</h3>
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
  const deleteQuery = useMutation({
    mutationFn: async (id: string) => await deleteOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });

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
              <h3 className="text-lg">Order Deleted!</h3>
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
      extends: ["customer_name.phone", "customer_name.alamat"],
    },
    {
      accessorKey: "sales_name.name",
      title: "Sales Name",
    },
    {
      accessorKey: "order_code",
      title: "Order",
      renderCell(cellValue, row) {
        return (
          <div>
            {row.order_code}
            <ol>
              {row.OrderItem.map((item, i) => (
                <li key={item.order_item_id}>
                  {i + 1}.{" "}
                  <span>
                    {item.product.name} x{item.quantity}
                    {item.satuan?.name}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        );
      },
    },
    {
      accessorKey: "createdAt",
      title: "Order Date",
      type: "date",
    },
    {
      accessorKey: "status",
      title: "Status",
      renderCell(cellValue, row) {
        return (
          <div className="flex flex-col">
            {/* <ChangeStatus id={row.order_id} /> */}
            {row.status == "ON_DELEVERY" ? (
              <Button size={"xs"}>{row.status}</Button>
            ) : (
              <Button
                size={"xs"}
                className={`${row.status == "PENDING" && "bg-orange-500"}`}
              >
                {row.status}
              </Button>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "order_id",
      title: "Payment",
      renderCell(cellValue, row) {
        return <Payment data={row} />;
      },
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
        navigator.clipboard.writeText(transaction.order_id),
    },
    {
      label: "Delete",
      onClick: (transaction: TransactionTable) => {
        setOpen(true);
        setSelected(transaction.order_id);
      },
    },
    {
      label: "Cancel",
      onClick: (transaction: TransactionTable) => {
        setOpenCancel(true);
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
    deleteQuerys.mutate(selectedRows);
  };

  const handlePrint = (selectedRows: TransactionTable[]) => {
    const url = `/invoice/${selectedRows.map((row) => row.order_id).join("and")}`;
    window.open(url, "_blank");
    console.log("Edited rows:", selectedRows);
  };
  if (!data) return null;
  console.log("data:", data);
  return (
    <div>
      <div className="mb-4">
        <div className="flex justify-end items-center">
          <div className="flex gap-2">
            <Link href={"/dashboard/transaction/new "}>
              <Button size={"sm"} className="flex items-center gap-2">
                <Plus size={12} /> Transaction
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={data as TransactionTable[]}
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
              onClick={() => deleteQuery.mutate(selected || "")}
              className="bg-destructive hover:bg-destructive"
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={openCancel}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure cancel this product?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete and
              remove your data from our servers.
              {/* {selected} */}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setOpenCancel(false);
                setSelected(undefined);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteQuery.mutate(selected || "")}
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
