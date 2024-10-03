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
import { ISelectedProduct, editItem, getOrderItem } from "@/lib/actions/order";
import { Button } from "@/components/ui/button";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "@/components/provider";
import { useLocalStorage } from "@/hook/useLocalstorage";
import { useSession } from "next-auth/react";
import { toast } from "@/components/ui/use-toast";

const TableEditItem = ({
  orderId,
  setOpen,
  orderItemId,
}: {
  orderId: string;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  orderItemId: string;
}) => {
  const [warehouseId] = useLocalStorage("warehouse-id", "1");
  const session = useSession();
  const productQuery = useGetProducts({ warehouseId: parseFloat(warehouseId) });
  const [product, setProduct] = useState<string>();
  const [satuan, setSatuan] = useState<string>();
  const [qty, setQty] = useState(0);
  const [potongan, setPotongan] = useState(0);
  const [error, setError] = useState("");
  const [appliedStrata, setAppliedStrata] = useState(0);
  const { data } = useQuery({
    queryKey: ["orderItem", orderItemId],
    queryFn: async () => {
      return await getOrderItem(orderItemId);
    },
  });

  console.log(data);

  const itemMutation = useMutation({
    mutationFn: (data: OrderItem) => {
      return editItem({
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
      order_item_id: orderItemId,
      finalOrderFinal_order_id: null,
    });
  };

  useEffect(() => {
    if (!product) {
      setError("Product must be selected");
      return;
    }

    // Handle strata price
    const productData = productQuery.data?.find(
      (item) => item.product_id === product,
    );
    const satuanData = productData?.Satuan.find(
      (unit) => unit.satuan_id === parseFloat(satuan || ""),
    );

    const stock = satuanData?.total || 0;
    if (qty > stock) {
      setError(`Stock tidak memadai ${stock}`);
    } else {
      setError("");
    }
    const strataValue = satuanData?.strataValue;

    if (strataValue && Array.isArray(strataValue)) {
      const applicableStrata = strataValue.reduce((prev: any, curr: any) => {
        return qty >= curr.quantity && curr.quantity > (prev?.quantity || 0)
          ? curr
          : prev;
      }, null);

      setAppliedStrata(applicableStrata ? applicableStrata.price : 0);
    } else {
      setAppliedStrata(0);
    }
  }, [qty, satuan, product]);
  useEffect(() => {
    if (data) {
      setProduct(data.product_id);
      setSatuan(data?.satuan_id?.toString() || "0");
      setQty(data?.quantity || 0);
      setPotongan(data?.discount || 0);
    }
  }, [data]);
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
        <Button onClick={handleAdd}>Save</Button>
      </div>
    </div>
  );
};

export default TableEditItem;