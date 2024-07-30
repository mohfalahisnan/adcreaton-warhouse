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

async function Retur({ params }: { params: { id: string } }) {
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
  const mutate = async () => {
    "use server";
    await prisma?.order.update({
      where: { order_id: params.id },
      data: { status: "SUCCESS" },
    });
    return await addFinalOrder(params.id);
  };
  if (!order || !retur) return null;

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
              orderitem.quantity = totalQty;
              return (
                <TableRow key={item.retur_id}>
                  <TableCell>{i + 1}</TableCell>
                  <TableCell>{item.orderItem.product.name}</TableCell>
                  <TableCell>
                    {item.quantity} {orderitem.satuan?.name}{" "}
                    <ReturAction id={item.order_item_id} title="Edit" />
                  </TableCell>
                  <TableCell>
                    {orderitem.quantity} {orderitem.satuan?.name}
                  </TableCell>
                  <TableCell className="text-right">
                    Rp.
                    {formatRupiah(
                      ((orderitem.satuan?.price || 0) -
                        getApplicablePrice(orderitem)) *
                        totalQty,
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      <div className="flex justify-end mt-4">
        <form
          action={async () => {
            "use server";
            await mutate().then(() => redirect("/dashboard/transaction"));
          }}
        >
          <Button>Save</Button>
        </form>
      </div>
    </div>
  );
}

export default Retur;
