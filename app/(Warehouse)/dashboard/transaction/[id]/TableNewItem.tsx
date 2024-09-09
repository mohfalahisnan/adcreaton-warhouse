"use client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatRupiah } from "@/lib/formatRupiah";
import { OrderItem, Product } from "@prisma/client";
import React, { useEffect, useState } from "react";
import { ProductSelect, SatuanSelect } from "./select";
import { Input } from "@/components/ui/input";
import { useGetProducts } from "@/hook/useProduct";
import { tierPriceApplied } from "@/lib/tierPriceApplied";
import { ISelectedProduct, addItem } from "@/lib/actions/order";
import { Button } from "@/components/ui/button";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "@/components/provider";
import { useLocalStorage } from "@/hook/useLocalstorage";
import { useSession } from "next-auth/react";
import { toast } from "@/components/ui/use-toast";
import { getStockByProduct } from "@/lib/actions/stock";

const TableNewItem = ({
  orderId,
  setOpen,
}: {
  orderId: string;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const [warehouseId] = useLocalStorage("warehouse_id", "1");
  const session = useSession();
  const productQuery = useGetProducts({ warehouseId: parseFloat(warehouseId) });
  const [product, setProduct] = useState<string>();
  const [satuan, setSatuan] = useState<string>();
  const [qty, setQty] = useState(0);
  const [potongan, setPotongan] = useState(0);
  const [error, setError] = useState("");

  const itemMutation = useMutation({
    mutationFn: (data: Omit<OrderItem, "order_item_id">) => {
      return addItem({
        data: {
          ...data,
          warehouse_id: parseFloat(warehouseId),
          inputby: session.data?.user?.name || "",
        },
      });
    },
    onSuccess: () => {
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["orderItem", orderId] });
    },
    onError: (error) => {
      console.log(error);
      toast({
        title: "Failed to add item",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const stock = useQuery({
    queryKey: ["stock", product],
    queryFn: async () => {
      if (!product) return null;
      return await getStockByProduct(product, parseFloat(warehouseId));
    },
    enabled: !!product,
  });

  const handleAdd = () => {
    if (error) {
      return alert(error);
    }
    if (!product) {
      return alert("Product must be selected");
    }
    if (qty <= 0) {
      return alert("Quantity must be greater than 0");
    }
    if (!satuan) {
      return alert("Satuan must be selected");
    }

    itemMutation.mutate({
      product_id: product || "",
      satuan_id: parseFloat(satuan || ""),
      quantity: qty,
      discount: potongan,
      notes: "",
      order_id: orderId,
      finalOrderFinal_order_id: null,
    });
  };

  useEffect(() => {
    let multiplier = 1;
    if (!product) {
      setError("Product must be selected");
      return;
    }
    if (
      !stock.data?.total ||
      qty * multiplier < 0 ||
      qty * multiplier > stock.data.total
    ) {
      setError(`Stock tidak memadai, sisa stock : ${stock.data?.total}`);
    } else {
      setError("");
    }
  }, [qty, satuan, product]);

  return (
    <div>
      <Table className="border mt-4">
        <TableHeader className="bg-accent">
          <TableRow>
            <TableHead>Nama Barang</TableHead>
            <TableHead className="w-[150px]">Qty</TableHead>
            <TableHead>Satuan</TableHead>
            <TableHead>Harga</TableHead>
            <TableHead>Strata</TableHead>
            <TableHead>Potongan</TableHead>
            <TableHead>Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>
              <ProductSelect
                data={productQuery.data as Product[]}
                value={product || ""}
                setValue={setProduct}
              />
            </TableCell>
            <TableCell>
              <Input
                type="number"
                value={qty}
                onChange={(e) => setQty(parseFloat(e.target.value))}
                disabled={!product}
                className={
                  error
                    ? "bg-red-100 ring-2 ring-offset-2 ring-destructive focus-visible:ring-destructive"
                    : ""
                }
              />
            </TableCell>
            <TableCell>
              <SatuanSelect
                data={
                  productQuery.data?.find((item) => item.product_id === product)
                    ?.Satuan || []
                }
                value={satuan || ""}
                setValue={setSatuan}
              />
            </TableCell>
            <TableCell>
              Rp.
              {formatRupiah(
                productQuery.data
                  ?.find((item) => item.product_id === product)
                  ?.Satuan.find(
                    (unit) => unit.satuan_id === parseFloat(satuan || ""),
                  )?.price || 0,
              )}
            </TableCell>
            <TableCell>
              Rp.
              {formatRupiah(
                (productQuery.data
                  ?.find((item) => item.product_id === product)
                  ?.Satuan.find(
                    (unit) => unit.satuan_id === parseFloat(satuan || ""),
                  )?.price || 0) -
                  (tierPriceApplied({
                    ...(productQuery.data?.find(
                      (item) => item.product_id === product,
                    ) as unknown as ISelectedProduct),
                    count:
                      qty *
                      (productQuery.data
                        ?.find((item) => item.product_id === product)
                        ?.Satuan.find(
                          (unit) => unit.satuan_id === parseFloat(satuan || ""),
                        )?.multiplier || 0),
                  }) || 0),
              )}
            </TableCell>
            <TableCell className="w-[150px]">
              <Input
                type="number"
                disabled={!product}
                value={potongan}
                onChange={(e) => setPotongan(parseFloat(e.target.value))}
              />
            </TableCell>
            <TableCell>
              Rp.
              {formatRupiah(
                ((productQuery.data
                  ?.find((item) => item.product_id === product)
                  ?.Satuan.find(
                    (unit) => unit.satuan_id === parseFloat(satuan || ""),
                  )?.price || 0) -
                  potongan) *
                  qty,
              )}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
      <div className="mt-2 text-xs text-red-500">
        {error && <span>{error}</span>}
      </div>
      <div className="flex w-full justify-end mt-4">
        <Button onClick={handleAdd}>Add</Button>
      </div>
    </div>
  );
};

export default TableNewItem;
