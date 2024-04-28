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

const TransactionForm = ({ onSuccess }: { onSuccess?: () => void }) => {
  const [selected, setSelected] = useState<Product[]>([]);
  const [focus, setFocus] = useState(false);
  const product = useGetProducts();

  const handleAdd = ({ item }: { item: Product }) => {
    setSelected((data) => [...data, item]);
    setFocus(false);
  };
  function sumSellPrices(products: Product[]): number {
    let total = 0;
    for (const product of products) {
      total += product.sell_price;
    }
    return total;
  }
  return (
    <div>
      <div className="mb-4 w-full flex flex-row justify-between">
        <h2 className="text-lg">New Transaction</h2>
        <Button>Save</Button>
      </div>
      <div className="flex flex-row gap-4">
        <div className="w-full">
          <div className="relative">
            <Input
              type="text"
              onFocus={() => setFocus(true)}
              //   onBlur={() => setFocus(false)}
              placeholder="Search product..."
            />
            <div
              className={`w-full bg-card z-50 rounded-md ${focus ? "h-auto shadow-lg opacity-100" : "h-0 shadow-none opacity-0"} absolute overflow-hidden transition-all duration-300`}
            >
              <div className="p-4 relative">
                <Button
                  variant={"ghost"}
                  size={"icon"}
                  className="absolute top-0 right-0"
                  onClick={() => setFocus(false)}
                >
                  <X size={14} />
                </Button>
                <div className="pt-4 w-full">
                  <ul className="w-full">
                    {product.data &&
                      product.data.map((item) => {
                        return (
                          <li
                            key={item.product_id}
                            className="my-2 w-full capitalize flex flex-row items-center justify-between"
                          >
                            <h3>{item.name}</h3>
                            <Button
                              variant={"outline"}
                              size={"icon"}
                              className="w-8 h-8"
                              onClick={() => handleAdd({ item: item })}
                            >
                              <Plus size={14} />
                            </Button>
                          </li>
                        );
                      })}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="w-full">
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
                      <TableCell>1</TableCell>
                      <TableCell className="text-right">
                        Rp. {item.sell_price}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant={"outline"}
                          size={"icon"}
                          className="w-8 h-8"
                        >
                          <Trash size={16} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
            <TableFooter className="bg-accent">
              <TableRow>
                <TableHead className="w-12">Total</TableHead>
                <TableHead></TableHead>
                <TableHead className="w-12"></TableHead>
                <TableHead className="text-right">
                  Rp. {sumSellPrices(selected)}
                </TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableFooter>
          </Table>
          {selected.length <= 0 && (
            <h4 className="text-center w-full">Empty</h4>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionForm;
