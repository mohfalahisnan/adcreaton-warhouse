"use client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getApplicablePrice } from "@/lib/CalculateTotalAmount";
import { formatRupiah } from "@/lib/formatRupiah";
import { OrderItem, Product, Satuan } from "@prisma/client";
import React from "react";
import ReturAction from "./retur-action";

function TableRetur({ order }: { order: any }) {
  return (
    <Table>
      <TableHeader className="bg-accent">
        <TableRow>
          <TableHead className="w-[50px]">No.</TableHead>
          <TableHead>Product</TableHead>
          <TableHead>Quantity</TableHead>
          <TableHead>Retur</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {order?.OrderItem.map(
          (
            item: OrderItem & { satuan: Satuan; product: Product },
            i: number,
          ) => {
            return (
              <TableRow key={item.order_id}>
                <TableCell>{i + 1}</TableCell>
                <TableCell>{item.product.name}</TableCell>
                <TableCell>
                  {item.quantity}
                  {item.satuan?.name}
                </TableCell>
                <TableCell>
                  <ReturAction id={item.order_item_id} />
                </TableCell>
                <TableCell className="text-right">
                  Rp.
                  {formatRupiah(
                    ((item.satuan?.price || 0) -
                      getApplicablePrice(item) -
                      (item.discount || 0)) *
                      item.quantity,
                  )}
                </TableCell>
              </TableRow>
            );
          },
        )}
      </TableBody>
    </Table>
  );
}

export default TableRetur;
