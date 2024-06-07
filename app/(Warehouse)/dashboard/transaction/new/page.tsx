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
import { getOrderById, initialOrder } from "@/lib/actions/order";
import { getWarehouse } from "@/lib/actions/warehouse";
import { generateOrderCode } from "@/lib/generateCode";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Check } from "lucide-react";
import React, { useEffect, useState } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Customer, User } from "@prisma/client";
import { getCustomersWarehouse } from "@/lib/actions/customer";

import { CustomerSelect } from "./select";
import AddOrderItem from "./addOrderItem";
import { formatRupiah } from "@/lib/formatRupiah";
import { tierPriceApplied } from "@/lib/tierPriceApplied";
import { useSession } from "next-auth/react";

function Page() {
  //state
  const [warehouseId] = useLocalStorage("warehouse_id", "1");
  const session = useSession();
  const [storedSales, setStoredSales] = useLocalStorage("sales_id", "");
  const [salesId, setSalesId] = useState<string>();
  const [customerId, setCustomerId] = useState<Customer>();
  const [orderId, setOrderId] = useState<string>();
  const [orderCode, setOrderCode] = useState<string>();

  //query
  const warhouse = useQuery({
    queryKey: ["warehouse", warehouseId],
    queryFn: () => getWarehouse({ warehouse_id: Number(warehouseId) }),
  });
  const queryGetSales = useQuery({
    queryKey: ["sales"],
    queryFn: async () => await getSales(parseInt(warehouseId)),
  });
  const queryGetCustomers = useQuery({
    queryKey: ["customers"],
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

  const getOrderItem = useQuery({
    queryKey: ["orderItem", orderId],
    queryFn: async () => {
      if (orderId) {
        return await getOrderById(orderId);
      }
    },
    enabled: !!orderId,
  });

  useEffect(() => {
    if (salesId) setStoredSales(salesId);
  }, [salesId]);

  useEffect(() => {
    if (storedSales !== "") {
      setSalesId(storedSales);
    }
    if (!orderId) {
      queryOrder.mutate();
    }
  }, []);

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
                  Rp.{formatRupiah(item.product.sell_price)}
                </TableCell>
                <TableCell>
                  Rp.
                  {formatRupiah(
                    tierPriceApplied({
                      ...item.product,
                      count: item.quantity * (item.satuan?.multiplier || 1),
                    }) || 0,
                  )}
                </TableCell>
                <TableCell>Rp.{formatRupiah(item.discount || 0)}</TableCell>
                <TableCell>
                  Rp.
                  {formatRupiah(
                    tierPriceApplied({
                      ...item.product,
                      count: item.quantity * (item.satuan?.multiplier || 1),
                    }) *
                      item.quantity *
                      (item.satuan?.multiplier || 1) -
                      (item.discount || 0),
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
              <TableHead>Rp.431124</TableHead>
            </TableRow>
          </TableHeader>
        </Table>
        <div className="flex items-end justify-end gap-4 mt-4">
          <Button variant="outline">Cancel</Button>
          <Button>Save</Button>
        </div>
      </div>
    </div>
  );
}

export default Page;

export const SalesSelect = ({
  data,
  value,
  setValue,
}: {
  data: User[];
  value: string;
  setValue: React.Dispatch<React.SetStateAction<string | undefined>>;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-start p-0 h-auto text-left capitalize"
        >
          {value
            ? data.find((sales) => sales.user_id === value)?.name
            : "Select Sales..."}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search Sales..." />
          <CommandList>
            <CommandEmpty>No sales found.</CommandEmpty>
            <CommandGroup>
              {data?.length > 0 &&
                data.map((sales) => (
                  <CommandItem
                    key={sales.user_id}
                    value={sales.name}
                    onSelect={(currentValue) => {
                      setValue(currentValue === value ? "" : currentValue);
                      setOpen(false);
                    }}
                    className="capitalize"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === sales.user_id ? "opacity-100" : "opacity-0",
                      )}
                    />
                    {sales.name}
                  </CommandItem>
                ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
