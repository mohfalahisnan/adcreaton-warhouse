"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import React, { useState } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { ChevronsUpDown, Plus, Trash } from "lucide-react";
import { useGetProducts } from "@/hook/useProduct";
import { Prisma, Product } from "@prisma/client";
import { formatRupiah } from "@/lib/formatRupiah";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  addItem,
  deleteOrderItem,
  getOrderById,
  initialOrder,
  updateStatusOrder,
} from "@/lib/actions/order";
import { useToast } from "./ui/use-toast";
import { queryClient } from "./provider";
import { useRouter } from "next/navigation";
import { generateOrderCode } from "@/lib/generateCode";
import { handlePrismaError } from "@/lib/handlePrismaError";
import { getCustomers } from "@/lib/actions/customer";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "./ui/command";
import Dropdown from "./Dropdown";
import { filterCustomerById, filterSalesById } from "@/lib/filterById";
import { useLocalStorage } from "@/hook/useLocalstorage";
import { getSales } from "@/lib/actions/accounts";

export interface ISelectedProduct extends Product {
  count: number;
}

export interface TierPrice {
  id: number;
  from: number;
  to: number;
  price: number;
}

const TransactionForm = ({ onSuccess }: { onSuccess?: () => void }) => {
  const product = useGetProducts({});
  const [warehouseId, setWarehouseId] = useLocalStorage("warehouse-id", "1");
  const [open, setOpen] = React.useState(false);
  const [openSales, setOpenSales] = useState(false);
  const [customerId, setCustomerId] = useState<string>();
  const [salesId, setSalesId] = useState<string>();
  const { toast } = useToast();
  const router = useRouter();
  const [orderId, setOrderId] = useState<string>();
  const [orderCode, setOrderCode] = useState<string>();

  const queryGetSales = useQuery({
    queryKey: ["sales"],
    queryFn: async () => await getSales(parseInt(warehouseId)),
  });

  const queryOrder = useMutation({
    mutationFn: async () =>
      await initialOrder({
        data: {
          order_code: generateOrderCode(),
          totalAmount: null,
          status: "PENDING",
          createdAt: new Date(),
          updatedAt: new Date(),
          sales_id: salesId || "",
          customer_id: parseFloat(customerId || "") || 1,
          warehouse_id: parseInt(warehouseId),
          shipment_id: null,
        },
      }),
    onSuccess: (data) => {
      setOrderId(data.order_id);
      setOrderCode(data.order_code);
    },
    onError(error) {
      toast({
        title: `Error: ${error.message}`,
        description: `${error.message}`,
        variant: "destructive",
      });
    },
  });

  interface IQueryItem {
    quantity: number;
    product: Product;
    notes: string;
  }

  const queryItem = useMutation({
    mutationFn: async (data: IQueryItem) => {
      if (!orderId) return null;
      await addItem({
        data: {
          product_id: data.product.product_id,
          order_id: orderId,
          quantity: data.quantity,
          notes: data.notes,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order", orderId] });
    },
    onError(error) {
      const errorMessage = handlePrismaError(error);
      toast({
        title: `Error`,
        description: `${errorMessage}`,
        variant: "destructive",
      });
    },
  });

  function withTax() {
    if (!queryGetOrder.data) return null;
    const total =
      totalPrice(queryGetOrder.data) +
      (totalPrice(queryGetOrder.data) * 10) / 100;
    return total;
  }

  // Fungsi untuk menghitung total harga berdasarkan count dan tier price
  const calculateTotalPrice = (product: ISelectedProduct): number => {
    // Memeriksa apakah product dan tier_price tersedia
    if (!product || !product.tier_price) {
      return product ? product.sell_price : 0; // Kembali ke sell_price atau 0 jika product undefined
    }
    // Parse JSON string tier_price menjadi array objek TierPrice
    const tiers: TierPrice[] = JSON.parse(product.tier_price);

    // Mencari tier yang sesuai dengan count
    const applicableTier = tiers.find(
      (tier) => product.count >= tier.from && product.count <= tier.to
    );

    // Menghitung total harga
    if (applicableTier) {
      return product.count * applicableTier.price;
    } else {
      return product.count * product.sell_price;
    }
  };

  const tierPriceApplied = (product: ISelectedProduct): number => {
    // Memeriksa apakah product dan tier_price tersedia
    if (!product || !product.tier_price) {
      return product ? product.sell_price : 0; // Kembali ke sell_price atau 0 jika product undefined
    }
    // Parse JSON string tier_price menjadi array objek TierPrice
    const tiers: TierPrice[] = JSON.parse(product.tier_price);

    // Mencari tier yang sesuai dengan count
    const applicableTier = tiers.find(
      (tier) => product.count >= tier.from && product.count <= tier.to
    );

    // Menghitung total harga
    if (applicableTier) {
      return applicableTier.price;
    }

    // Jika tidak ada tier yang cocok, kembalikan 0 atau mungkin handle error sesuai kebutuhan
    return product.sell_price;
  };

  // Fungsi untuk menghitung total harga berdasarkan count dan tier price
  const hasTierPrice = (product: ISelectedProduct): boolean => {
    // Memeriksa apakah product dan tier_price tersedia
    if (!product || !product.tier_price) {
      return false; // Kembali ke sell_price atau 0 jika product undefined
    }
    // Parse JSON string tier_price menjadi array objek TierPrice
    const tiers: TierPrice[] = JSON.parse(product.tier_price);

    // Mencari tier yang sesuai dengan count
    const applicableTier = tiers.find(
      (tier) => product.count >= tier.from && product.count <= tier.to
    );

    // Menghitung total harga
    if (applicableTier) {
      return true;
    }

    // Jika tidak ada tier yang cocok, kembalikan 0 atau mungkin handle error sesuai kebutuhan
    return false;
  };

  const totalPrice = (
    selectedProducts:
      | Prisma.OrderGetPayload<{
          include: { OrderItem: { include: { product: true } } };
        }>
      | undefined
  ): number => {
    if (selectedProducts) {
      return selectedProducts.OrderItem.reduce(
        (total, orderItem) =>
          total +
          calculateTotalPrice({
            ...orderItem.product,
            count: orderItem.quantity,
          }),
        0
      );
    }
    return 0; // Pastikan untuk mengembalikan nilai default jika selectedProducts adalah undefined
  };

  const handleAdd = async ({ item }: { item: IQueryItem }) => {
    if (!customerId) {
      alert("Silahkan Pilih Customer!");
      return null;
    }
    if (!orderId) {
      queryOrder.mutateAsync().then(() => {
        queryItem.mutate(item);
      });
    }
    if (orderId) {
      queryItem.mutate(item);
    }
  };

  const queryGetOrder = useQuery<Prisma.OrderGetPayload<{
    include: { OrderItem: { include: { product: true } } };
  }> | null>({
    queryKey: ["order", orderId],
    queryFn: async () => {
      if (!orderId) return null;
      return await getOrderById(orderId);
    },
  });

  const queryGetCustomers = useQuery({
    queryKey: ["customers"],
    queryFn: async () => await getCustomers(),
  });

  const queryDeleteOrder = useMutation({
    mutationFn: async (id: string) => await deleteOrderItem(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["order", orderId] }),
    onError: (error) => {
      const errorMessage = handlePrismaError(error);
      toast({
        title: `Error`,
        description: `${errorMessage}`,
        variant: "destructive",
      });
    },
  });

  const queryNext = useMutation({
    mutationFn: async (id: string) =>
      await updateStatusOrder({ id: id, status: "PENDING" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order", orderId] });
      router.push("/dashboard/transaction");
    },
    onError: (error) => {
      const errorMessage = handlePrismaError(error);
      toast({
        title: `Error`,
        description: `${errorMessage}`,
        variant: "destructive",
      });
    },
  });

  const customer = filterCustomerById(
    queryGetCustomers.data || [],
    customerId || ""
  );
  const sales = filterSalesById(queryGetSales.data || [], salesId || "");
  return (
    <div>
      <div className="flex flex-row gap-4">
        <div className="w-full">
          <div className="flex flex-row items-center mb-4">
            <h4 className="w-36">Sales:</h4>
            <Dropdown
              open={openSales}
              setOpen={setOpenSales}
              triggerContent={
                <Button onClick={() => setOpenSales(!openSales)}>
                  {salesId ? sales[0].name : "Pilih Sales"}
                </Button>
              }
            >
              <div className="bg-card p-2 rounded-md shadow-lg">
                {queryGetSales.data &&
                  queryGetSales.data?.length <= 0 &&
                  "No Data"}
                {queryGetSales.data &&
                  queryGetSales.data?.map((item, i) => {
                    return (
                      <Button
                        variant={"ghost"}
                        key={i}
                        onClick={() => {
                          setSalesId(item.user_id);
                          setOpenSales(false);
                        }}
                        className="min-w-40"
                      >
                        {item.name}
                      </Button>
                    );
                  })}
              </div>
            </Dropdown>
          </div>
          <div className="flex flex-row items-center mb-4">
            <h4 className="w-36">Custumer :</h4>
            <Dropdown
              open={open}
              setOpen={setOpen}
              triggerContent={
                <Button onClick={() => setOpen(!open)}>
                  {customerId ? customer[0].name : "Pilih Customer"}
                </Button>
              }
            >
              <div className="bg-card p-2 rounded-md shadow-lg">
                {queryGetCustomers.data &&
                  queryGetCustomers.data?.length <= 0 &&
                  "No Data"}
                {queryGetCustomers.data &&
                  queryGetCustomers.data?.map((item, i) => {
                    return (
                      <Button
                        variant={"ghost"}
                        key={i}
                        onClick={() => {
                          setCustomerId(item.customer_id.toString());
                          setOpen(false);
                        }}
                        className="min-w-40"
                      >
                        {item.name}
                      </Button>
                    );
                  })}
              </div>
            </Dropdown>
          </div>
          <div className="relative">
            <Input type="text" placeholder="Search product..." />
          </div>
          <Table className="mt-4">
            <TableBody>
              {product.data &&
                product.data.map((item, i) => {
                  return (
                    <TableRow key={i}>
                      <TableCell className="w-10">{i + 1}</TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell className="text-right">
                        Rp. {item.sell_price}
                      </TableCell>
                      <TableCell className="text-center w-20">
                        <Button
                          variant={"outline"}
                          size={"icon"}
                          className="w-8 h-8"
                          onClick={() =>
                            handleAdd({
                              item: {
                                product: item,
                                quantity: 1,
                                notes: "",
                              },
                            })
                          }
                        >
                          <Plus size={16} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </div>
        <div className="w-full max-w-md">
          {queryGetOrder.data && (
            <h2 className="text-lg text-center font-medium">
              ORDER ID : {queryGetOrder.data.order_code}
              <span className="text-muted">{queryGetOrder.data.status}</span>
            </h2>
          )}
          <Table className="text-xs">
            <TableHeader className="bg-accent">
              <TableRow>
                <TableHead className="w-12">No.</TableHead>
                <TableHead>Product</TableHead>
                <TableHead className="w-12">Qty</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* {selected.length > 0 &&
                selected.map((item, i) => {
                  return (
                    <TableRow key={i}>
                      <TableCell>{i + 1}</TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.count}</TableCell>
                      <TableCell className="text-right">
                        {hasTierPrice(item) ? (
                          <span>
                            <del> Rp. {formatRupiah(item.sell_price)}</del>
                            <br />
                            Rp. {formatRupiah(tierPriceApplied(item))}
                          </span>
                        ) : (
                          <span>Rp. {formatRupiah(item.sell_price)}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant={"outline"}
                          size={"icon"}
                          className="w-8 h-8"
                          onClick={() =>
                            deleteSelectedProductById(item.product_id)
                          }
                        >
                          <Trash size={16} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })} */}

              {queryGetOrder.data &&
                queryGetOrder.data.OrderItem.map((item, i) => {
                  return (
                    <TableRow key={i}>
                      <TableCell>{i + 1}</TableCell>
                      <TableCell>{item.product.name}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell className="text-right">
                        {hasTierPrice({
                          ...item.product,
                          count: item.quantity,
                        }) ? (
                          <>
                            <del>
                              Rp.
                              {formatRupiah(
                                item.product.sell_price * item.quantity
                              )}
                            </del>
                            <br />
                            <span>
                              Rp.
                              {formatRupiah(
                                tierPriceApplied({
                                  ...item.product,
                                  count: 20,
                                }) * item.quantity
                              )}
                            </span>
                          </>
                        ) : (
                          <span>
                            Rp.{" "}
                            {formatRupiah(
                              tierPriceApplied({
                                ...item.product,
                                count: item.quantity,
                              }) * item.quantity
                            )}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant={"outline"}
                          size={"icon"}
                          className="w-8 h-8"
                          onClick={() =>
                            queryDeleteOrder.mutate(item.order_item_id)
                          }
                        >
                          <Trash size={16} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              {/* {selected.length <= 0 && (
                <TableRow>
                  <TableCell>
                    <h4 className="text-center w-full">Empty</h4>
                  </TableCell>
                </TableRow>
              )} */}
              <TableRow>
                <TableCell></TableCell>
                <TableCell>Sub Total</TableCell>
                <TableCell></TableCell>
                <TableCell className="text-right">
                  Rp.{" "}
                  {formatRupiah(totalPrice(queryGetOrder.data || undefined))}
                </TableCell>
                <TableCell className="text-center"></TableCell>
              </TableRow>
              <TableRow>
                <TableCell></TableCell>
                <TableCell>Tax 10%</TableCell>
                <TableCell></TableCell>
                <TableCell className="text-right">
                  Rp. {formatRupiah(withTax() || 0)}
                </TableCell>
                <TableCell className="text-center"></TableCell>
              </TableRow>
            </TableBody>
            <TableFooter className="bg-accent">
              <TableRow>
                <TableHead className="w-12">Total</TableHead>
                <TableHead></TableHead>
                <TableHead className="w-12"></TableHead>
                <TableHead className="text-right">
                  Rp. {formatRupiah(withTax() || 0)}
                </TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      </div>
      <div className="flex items-end justify-end mt-4">
        <Button onClick={() => queryNext.mutate(orderId || "")}>
          Lanjutkan
        </Button>
      </div>
    </div>
  );
};

export default TransactionForm;
