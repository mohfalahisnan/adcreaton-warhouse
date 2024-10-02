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
import { Check, CheckCircle2, Plus } from "lucide-react";
import React, { useState } from "react";
import {
  cancelOrder,
  deleteOrder,
  deleteOrders,
  getOrder,
  updateOrderStatus,
} from "@/lib/actions/order";
import Link from "next/link";

import { useSession } from "next-auth/react";
import { createShipment } from "@/lib/actions/shipping";
import { getCars } from "@/lib/actions/car";
import { useRouter } from "next/navigation";
import UangKeluarMasuk from "./UangKeluarMasuk";
import { getRoleByEmail } from "@/lib/actions/accounts";
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
  const router = useRouter();
  const session = useSession();
  const [shipmentModal, setShipmentModal] = useState(false);
  const [cardId, setCardId] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const { data } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => await getOrder(parseInt(warehouseId), true),
  });
  const [open, setOpen] = useState(false);
  const [openCancel, setOpenCancel] = useState(false);
  const [selected, setSelected] = useState<string>();
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
  const cancelQuery = useMutation({
    mutationFn: async (data: string) => await cancelOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      setOpenCancel(false);
      toast({
        description: (
          <div className="flex items-center justify-between gap-2">
            <div>
              <span className="text-green-500">
                <CheckCircle2 size={28} strokeWidth={1} />
              </span>
            </div>
            <div>
              <h3 className="text-lg">Order Canceled!</h3>
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
  const kirimMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!cardId) {
        toast({
          title: "Error",
          description: "Silahkan Pilih mobil terlebih dahulu",
          variant: "destructive",
        });
        return;
      }
      await updateOrderStatus(id, "ON_DELEVERY");
      await createShipment({
        shippedDate: new Date(),
        deliveryDate: new Date(),
        warehouse_id: parseInt(warehouseId),
        customer_id: 1,
        note: "",
        order_id: id,
        status: "PENDING",
        createdAt: new Date(),
        updatedAt: new Date(),
        car_id: cardId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      setShipmentModal(false);
      setOrderId(null);
    },
  });
  const cars = useQuery({
    queryKey: ["cars"],
    queryFn: async () => await getCars(parseInt(warehouseId)),
  });
  const userRole = useQuery({
    queryKey: ["role"],
    queryFn: async () => await getRoleByEmail(session.data?.user.email || ""),
    enabled: !!session.data?.user.email,
  });
  if (!userRole.data) return null;
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
            {row.status === "SUCCESS" && (
              <Button
                size={"xs"}
                disabled={userRole.data?.role === "CHECKER"}
                onClick={() =>
                  router.push(`/dashboard/transaction/sukses/${row.order_id}`)
                }
              >
                {row.status}
              </Button>
            )}
            {/* <ChangeStatus id={row.order_id} /> */}
            {row.status === "ON_DELEVERY" ? (
              <Button
                size={"xs"}
                disabled={userRole.data?.role === "CHECKER"}
                onClick={() =>
                  router.push(`/dashboard/transaction/retur/${row.order_id}`)
                }
              >
                ON_DELEVERY
              </Button>
            ) : row.status === "PENDING" ? (
              <Button
                size={"xs"}
                disabled={userRole.data?.role === "CHECKER"}
                onClick={() => {
                  setShipmentModal(true);
                  setOrderId(row.order_id);
                }}
              >
                Kirim
              </Button>
            ) : (
              <Button
                size={"xs"}
                disabled={userRole.data?.role === "CHECKER"}
                className={row.status === "SUCCESS" ? "hidden" : ""}
              >
                {row.status}
              </Button>
            )}
          </div>
        );
      },
    },
    // {
    //   accessorKey: "order_id",
    //   title: "Payment",
    //   renderCell(cellValue, row) {
    //     return <Payment data={row} />;
    //   },
    // },
    {
      accessorKey: "totalAmount",
      title: "Total Amount",
      type: "currency",
    },
  ];

  const actionsConfig: ActionConfig<TransactionTable>[] = [
    // {
    //   label: "Copy Id",
    //   onClick: (transaction: TransactionTable) =>
    //     navigator.clipboard.writeText(transaction.order_id),
    // },
    {
      label: "Edit",
      onClick: (transaction: TransactionTable) =>
        router.push(`/dashboard/transaction/${transaction.order_id}`),
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
      {userRole.data.role === "ADMIN" && (
        <div className="mb-4">
          <div className="flex justify-end items-center">
            <div className="flex gap-2">
              <UangKeluarMasuk />
              <Link href={"/dashboard/transaction/new "}>
                <Button size={"sm"} className="flex items-center gap-2">
                  <Plus size={12} /> Transaction
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {userRole.data.role === "SUPERADMIN" && (
        <div className="mb-4">
          <div className="flex justify-end items-center">
            <div className="flex gap-2">
              <UangKeluarMasuk />
              <Link href={"/dashboard/transaction/new "}>
                <Button size={"sm"} className="flex items-center gap-2">
                  <Plus size={12} /> Transaction
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {userRole.data.role === "APPROVAL" && (
        <div className="mb-4">
          <div className="flex justify-end items-center">
            <div className="flex gap-2">
              <UangKeluarMasuk />
              <Link href={"/dashboard/transaction/new "}>
                <Button size={"sm"} className="flex items-center gap-2">
                  <Plus size={12} /> Transaction
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      <DataTable
        columns={columns}
        data={data as TransactionTable[]}
        onDelete={handleDelete}
        onPrint={handlePrint}
        deleteButton={session.data?.user.ROLE === "ADMIN"}
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
            <AlertDialogTitle>Cancel this product?</AlertDialogTitle>
            <AlertDialogDescription>
              Product akan dikembalikan ke stock
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
              onClick={() => cancelQuery.mutate(selected || "")}
              className="bg-destructive hover:bg-destructive"
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={shipmentModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Kirimkan Pengiriman</AlertDialogTitle>
            <AlertDialogDescription>
              Pilih mobil terlebih dahulu
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto">
            {cars.data?.map((car) => {
              return (
                <Button
                  key={car.car_id}
                  onClick={() =>
                    setCardId(cardId === car.car_id ? null : car.car_id)
                  }
                >
                  {car.nama}
                  {cardId === car.car_id && (
                    <Check size={18} className="ml-4" />
                  )}
                </Button>
              );
            })}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setShipmentModal(false);
                setSelected(undefined);
                setOrderId(null);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => kirimMutation.mutate(orderId || "")}
              className="bg-destructive hover:bg-destructive"
              disabled={!cardId}
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
