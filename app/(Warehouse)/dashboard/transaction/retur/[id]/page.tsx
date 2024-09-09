import React from "react";
import TableRetur from "./table";
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
import ReturAction from "./retur-action";
import { Button } from "@/components/ui/button";
import { addFinalOrder } from "@/lib/actions/order";
import { redirect } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";

import { PaymentMethod } from "@prisma/client";
import { auth } from "@/app/auth";
import { Input } from "@/components/ui/input";

async function Retur({ params }: { params: { id: string } }) {
  const session = await auth();
  const order = await prisma?.order.findUnique({
    where: { order_id: params.id },
    include: {
      OrderItem: {
        include: {
          satuan: true,
          product: true,
        },
      },
    },
  });
  const retur = await prisma?.returItem.findMany({
    where: {
      order_id: params.id,
    },
    include: {
      orderItem: {
        include: {
          product: true,
          satuan: true,
        },
      },
    },
  });
  if (!order || !retur) return null;
  const totalAmount = retur.reduce((acc, item) => {
    let totalQty = item.orderItem.quantity - item.quantity;
    let orderitem = item.orderItem;

    return (
      acc +
      ((orderitem.satuan?.price || 0) -
        getApplicablePrice({ ...orderitem, quantity: totalQty })) *
        totalQty
    );
  }, 0);
  const mutate = async (
    orderId?: FormDataEntryValue | null,
    method?: FormDataEntryValue | null,
    notes?: FormDataEntryValue | null,
    bayar?: FormDataEntryValue | null,
  ) => {
    "use server";
    if (parseFloat(bayar?.toString() || "0") < 0) {
      return;
    }
    if (parseFloat(bayar?.toString() || "0") < totalAmount) {
      return;
    }
    const kembalian = totalAmount - parseFloat(bayar?.toString() || "0");
    if (kembalian <= 0 && kembalian !== 0) {
      await prisma?.payment.create({
        data: {
          amount: kembalian,
          inputBy: session?.user.name || "",
          method: "CASH",
          notes: `Kembalian ORD-${order.order_code}`,
          warehouseId: order.warehouse_id,
        },
      });
    }
    await prisma?.payment.create({
      data: {
        amount: parseFloat(bayar?.toString() || "0"),
        inputBy: session?.user.name || "",
        method: method as PaymentMethod,
        notes: `Payment ORD-${order.order_code} ${notes}`,
        orderId: orderId?.toString(),
        warehouseId: order.warehouse_id,
      },
    });
    await prisma?.order.update({
      where: { order_id: params.id },
      data: { status: "SUCCESS" },
    });
    return await addFinalOrder(params.id, totalAmount);
  };

  return (
    <div>
      <h3 className="my-4 text-xl font-bold">Order #ORD-{order.order_code}</h3>
      <div className="border">
        <TableRetur order={order} />
      </div>
      <h3 className="my-4 text-xl font-bold">Retur</h3>
      <div className="border">
        <Table>
          <TableHeader className="bg-accent">
            <TableRow>
              <TableHead className="w-[50px]">No.</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Retur Quantity</TableHead>
              <TableHead>Delivered Quantity</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {retur.map((item, i) => {
              let totalQty = item.orderItem.quantity - item.quantity;
              let orderitem = item.orderItem;
              // orderitem.quantity = totalQty;
              return (
                <TableRow key={item.retur_id}>
                  <TableCell>{i + 1}</TableCell>
                  <TableCell>{item.orderItem.product.name}</TableCell>
                  <TableCell>
                    {item.quantity} {orderitem.satuan?.name}{" "}
                    <ReturAction id={item.order_item_id} title="Edit" />
                  </TableCell>
                  <TableCell>
                    {totalQty} {orderitem.satuan?.name}
                  </TableCell>
                  <TableCell className="text-right">
                    Rp.
                    {formatRupiah(
                      ((orderitem.satuan?.price || 0) -
                        getApplicablePrice({
                          ...orderitem,
                          quantity: totalQty,
                        })) *
                        totalQty,
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
          <TableBody className="bg-accent">
            <TableRow>
              <TableCell colSpan={4} className="text-right">
                Total
              </TableCell>
              <TableCell className="text-right">
                Rp. {formatRupiah(totalAmount)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
      <div className="flex justify-end mt-4">
        <form
          action={async (formData) => {
            "use server";
            const orderId = formData.get("orderId");
            const method = formData.get("method");
            const notes = formData.get("notes");
            const bayar = formData.get("bayar");
            await mutate(orderId, method, notes, bayar).then(() =>
              redirect("/dashboard/transaction"),
            );
          }}
        >
          <div className="w-full flex flex-col items-end justify-end gap-2">
            <div className="flex items-center">
              <input type="hidden" value={params.id} name="orderId" />
              <Input
                type="number"
                defaultValue={totalAmount}
                name="bayar"
                className="appearance-none "
              />
              {/* Rp.{" "}
              <Input type="number" placeholder="bayar" className="max-w-xs" /> */}
              <select
                name="method"
                className=" ml-4 px-4 py-2 bg-input rounded"
              >
                <option value={"CASH"}>Cash</option>
                <option value={"TRANSFER"}>Transfer</option>
              </select>
            </div>
            <div className="flex gap-2">
              <Textarea name="notes" placeholder="notes..." />
            </div>
            <Button>Bayar</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Retur;
