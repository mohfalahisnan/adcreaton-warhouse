"use client";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/components/ui/use-toast";
import { useLocalStorage } from "@/hook/useLocalstorage";
import { getSales } from "@/lib/actions/accounts";
import {
  deleteOrder,
  getOrderById,
  initialOrder,
  updateOrder,
} from "@/lib/actions/order";
import { getWarehouse } from "@/lib/actions/warehouse";
import { generateOrderCode } from "@/lib/generateCode";
import { useMutation, useQuery } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";

import { Customer, User } from "@prisma/client";
import { getCustomersWarehouse } from "@/lib/actions/customer";

import { CustomerSelect, SalesSelect } from "./select";
import AddOrderItem from "./addOrderItem";
import { formatRupiah } from "@/lib/formatRupiah";
import { useRouter } from "next/navigation";
import {
  CalculateTotalAmount,
  getApplicablePrice,
} from "@/lib/CalculateTotalAmount";
import { ResponsiveDialog } from "@/components/ResponsiveDialog";
import { Plus } from "lucide-react";
import CustomerForm from "@/components/CustomerForm";

function Page() {
  //state
  const navigation = useRouter();
  const [warehouseId] = useLocalStorage("warehouse_id", "1");
  const [storedSales, setStoredSales] = useLocalStorage("sales_id", "");
  const [salesId, setSalesId] = useState<string>();
  const [customerId, setCustomerId] = useState<Customer>();
  const [orderId, setOrderId] = useState<string>();
  const [orderCode, setOrderCode] = useState<string>();
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [openAdd, setOpenAdd] = useState(false);
  //query
  const warhouse = useQuery({
    queryKey: ["warehouse", warehouseId],
    queryFn: () => getWarehouse({ warehouse_id: parseInt(warehouseId) }),
  });
  const queryGetSales = useQuery({
    queryKey: ["sales"],
    queryFn: async () => await getSales(parseInt(warehouseId)),
  });
  const queryGetCustomers = useQuery({
    queryKey: ["customer"],
    queryFn: async () => await getCustomersWarehouse(parseInt(warehouseId)),
  });

  const queryOrder = useMutation({
    mutationFn: async () => {
      if (!salesId) return null;
      return await initialOrder({
        data: {
          order_code: generateOrderCode(),
          totalAmount: null,
          status: "PENDING",
          createdAt: new Date(),
          updatedAt: new Date(),
          sales_id: salesId || "",
          customer_id:
            parseFloat(customerId?.customer_id.toString() || "") || 1,
          warehouse_id: parseInt(warehouseId),
          shipment_id: null,
        },
      });
    },
    onSuccess: (data) => {
      setOrderId(data?.order_id);
      setOrderCode(data?.order_code);
    },
    onError(error) {
      toast({
        title: `Error: ${error.message}`,
        description: `${error.message}`,
        variant: "destructive",
      });
    },
  });

  const queryOrderSave = useMutation({
    mutationFn: async () => {
      if (!salesId) return null;
      return await updateOrder({
        data: {
          order_id: orderId || "",
          customer_id: customerId?.customer_id || 0,
          sales_id: salesId || "",
          order_code: "",
          totalAmount: null,
          warehouse_id: parseInt(warehouseId),
          shipment_id: null,
          status: "ARCHIVED",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
    },
    onSuccess: (data) => {
      navigation.push("/dashboard/transaction");
    },
    onError(error) {
      toast({
        title: `Error: ${error.message}`,
        description: `${error.message}`,
        variant: "destructive",
      });
    },
  });

  const getOrderItem = useQuery({
    queryKey: ["orderItem", orderId],
    queryFn: async () => {
      if (orderId) {
        return await getOrderById(orderId);
      }
    },
    enabled: !!orderId,
  });
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await deleteOrder(id);
    },
    onSuccess: () => {
      navigation.push("/dashboard/transaction");
    },
    onError(error) {
      toast({
        title: `Error: ${error.message}`,
        description: `${error.message}`,
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (salesId) setStoredSales(salesId);
    if (salesId) {
      if (!orderId) {
        queryOrder.mutate();
      }
    }
  }, [salesId]);

  useEffect(() => {
    if (storedSales !== "") {
      setSalesId(storedSales);
    }
    if (salesId) {
      if (!orderId) {
        queryOrder.mutate();
      }
    }
  }, []);

  useEffect(() => {
    if (getOrderItem.data) {
      setTotalAmount(CalculateTotalAmount({ data: getOrderItem.data }));
    }
  }, [getOrderItem.data]);

  const handleSave = () => {
    if (!customerId) {
      toast({
        title: "Error",
        description: "Pelanggan belum dipilih",
        variant: "destructive",
      });
      return;
    }
    if (!salesId) {
      toast({
        title: "Error",
        description: "Sales belum dipilih",
        variant: "destructive",
      });
      return;
    }
    queryOrderSave.mutate();
  };

  if (queryGetSales.isLoading) return <div>Loading...</div>;
  if (queryGetCustomers.isLoading) return <div>Loading...</div>;

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-card flex items-start justify-center">
      <div className="w-full p-8">
        <div>
          <h2 className="text-xl font-bold">{warhouse.data?.name}</h2>
          <h4>{warhouse.data?.location}</h4>
        </div>
        <div className="w-full flex justify-between">
          <div>
            <table>
              <tbody>
                <tr>
                  <td>Telp</td>
                  <td className="px-2">:</td>
                  <td>{warhouse.data?.phone}</td>
                </tr>
                <tr>
                  <td>Sales</td>
                  <td className="px-2">:</td>
                  <td>
                    <SalesSelect
                      data={queryGetSales.data as User[]}
                      value={salesId || ""}
                      setValue={setSalesId}
                    />
                  </td>
                </tr>
                <tr>
                  <td>Tanggal</td>
                  <td className="px-2">:</td>
                  <td>{new Date().toLocaleDateString()}</td>
                </tr>
                <tr>
                  <td>No.Faktur </td>
                  <td className="px-2">:</td>
                  <td>{orderCode}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div>
            <div className="w-full min-w-[300px]">
              Pelanggan :<br />
              <CustomerSelect
                data={queryGetCustomers.data as Customer[]}
                value={customerId as Customer}
                setValue={setCustomerId}
              />
              {customerId && (
                <p>
                  {customerId.alamat}
                  <br />
                  {customerId.phone}
                </p>
              )}
              {!customerId && (
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
              )}
            </div>
          </div>
        </div>
        <Table className="border mt-4">
          <TableHeader className="bg-accent">
            <TableRow>
              <TableHead className="w-[50px]">No</TableHead>
              <TableHead>Nama Barang</TableHead>
              <TableHead>Qty</TableHead>
              <TableHead>Satuan</TableHead>
              <TableHead>Harga</TableHead>
              <TableHead>Strata</TableHead>
              <TableHead>Potongan</TableHead>
              <TableHead>Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {getOrderItem.data?.OrderItem.map((item, index) => (
              <TableRow key={item.order_item_id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{item.product.name}</TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>{item.satuan?.name}</TableCell>
                <TableCell>
                  Rp.{formatRupiah(item.satuan?.price || 0)}
                </TableCell>
                <TableCell>
                  Rp.{formatRupiah(getApplicablePrice(item))}
                </TableCell>
                <TableCell>Rp.{formatRupiah(item.discount || 0)}</TableCell>
                <TableCell>
                  Rp.
                  {formatRupiah(
                    ((item.satuan?.price || 0) -
                      (item.discount || 0) -
                      getApplicablePrice(item)) *
                      item.quantity,
                  )}
                </TableCell>
              </TableRow>
            ))}

            <TableRow>
              <TableCell colSpan={8} className="text-center">
                <AddOrderItem orderId={orderId || ""} />
              </TableCell>
            </TableRow>
          </TableBody>
          <TableHeader className="bg-accent">
            <TableRow>
              <TableHead colSpan={7} className="text-right">
                Total
              </TableHead>
              <TableHead>
                Rp.
                {getOrderItem.data &&
                  formatRupiah(
                    CalculateTotalAmount({ data: getOrderItem.data as any }),
                  )}
              </TableHead>
            </TableRow>
          </TableHeader>
        </Table>
        <div className="flex items-end justify-end gap-4 mt-4">
          <Button
            variant="outline"
            onClick={() => deleteMutation.mutate(orderId || "")}
          >
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </div>
      </div>
    </div>
  );
}

export default Page;
