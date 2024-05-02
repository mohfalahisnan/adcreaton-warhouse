"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import React, { useEffect, useState } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { CheckCircle2, Plus, Save, ShoppingBag, Trash, X } from "lucide-react";
import { useGetProducts } from "@/hook/useProduct";
import { Order, OrderItem, Prisma, Product } from "@prisma/client";
import { formatRupiah } from "@/lib/formatRupiah";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  addItem,
  deleteOrderItem,
  getOrderById,
  initialOrder,
} from "@/lib/actions/order";
import { useToast } from "./ui/use-toast";
import { queryClient } from "./provider";
import { useRouter } from "next/navigation";
import { generateOrderCode } from "@/lib/generateCode";
import { handlePrismaError } from "@/lib/handlePrismaError";

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
  const [selected, setSelected] = useState<ISelectedProduct[]>([]);
  const product = useGetProducts();
  const { toast } = useToast();
  const router = useRouter();
  const [orderId, setOrderId] = useState<string>();
  const [orderCode, setOrderCode] = useState<string>();

  const queryOrder = useMutation({
    mutationFn: async () =>
      await initialOrder({
        data: {
          order_code: generateOrderCode(),
          totalAmount: null,
          user_id: null,
          status: "ARCHIVED",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      }),
    onSuccess: (data) => {
      setOrderId(data.order_id);
      setOrderCode(data.order_code);
      toast({
        description: (
          <div className="flex items-center justify-between gap-2">
            <div>
              <span className="text-green-500">
                <CheckCircle2 size={28} strokeWidth={1} />
              </span>
            </div>
            <div>
              <h3 className="text-lg">Order Created!</h3>
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

  function sumSellPrices(products: ISelectedProduct[]): number {
    let total = 0;
    for (const product of products) {
      total += product.sell_price * product.count;
    }
    return total;
  }

  function withTax() {
    const total =
      sumSellPrices(selected) + (sumSellPrices(selected) * 10) / 100;
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
    }

    // Jika tidak ada tier yang cocok, kembalikan 0 atau mungkin handle error sesuai kebutuhan
    return product.sell_price;
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

  return (
    <div>
      <div className="flex flex-row gap-4">
        <div className="w-full">
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
                  Rp. {formatRupiah(withTax())}
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
                  Rp. {formatRupiah(withTax())}
                </TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default TransactionForm;
