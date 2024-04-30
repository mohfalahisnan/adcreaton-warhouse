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
import { Plus, Save, ShoppingBag, Trash, X } from "lucide-react";
import { useGetProducts } from "@/hook/useProduct";
import { Product } from "@prisma/client";
import { formatRupiah } from "@/lib/formatRupiah";

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

  const totalPrice = (selectedProducts: ISelectedProduct[]): number => {
    return selectedProducts.reduce(
      (total, product) => total + calculateTotalPrice(product),
      0
    );
  };

  const deleteSelectedProductById = (productId: string) => {
    const filter = selected.filter(
      (product) => product.product_id !== productId
    );
    setSelected(filter);
    return;
  };

  const handleAdd = ({ item }: { item: ISelectedProduct }) => {
    setSelected((data) => {
      // Mencari index produk dalam array
      const index = data.findIndex((p) => p.product_id === item.product_id);

      // Jika produk sudah ada, tambah count
      if (index > -1) {
        const newData = [...data];
        newData[index] = { ...newData[index], count: newData[index].count + 1 };
        return newData;
      }

      // Jika produk belum ada, tambahkan produk ke array dengan count awal
      return [...data, { ...item, count: 1 }];
    });
  };

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
                            handleAdd({ item: { ...item, count: 1 } })
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
              {selected.length > 0 &&
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
                })}
              {selected.length <= 0 && (
                <TableRow>
                  <TableCell>
                    <h4 className="text-center w-full">Empty</h4>
                  </TableCell>
                </TableRow>
              )}
              <TableRow>
                <TableCell></TableCell>
                <TableCell>Sub Total</TableCell>
                <TableCell></TableCell>
                <TableCell className="text-right">
                  Rp. {formatRupiah(totalPrice(selected))}
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
      <pre className="overflow-auto">{JSON.stringify(selected)}</pre>
    </div>
  );
};

export default TransactionForm;
