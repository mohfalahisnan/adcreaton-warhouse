"use client";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useLocalStorage } from "@/hook/useLocalstorage";
import { getPaymentDaily } from "@/lib/actions/payment";
import { formatDate } from "@/lib/formatDate";
import { formatRupiah } from "@/lib/formatRupiah";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import { PembayaranWeekly } from "./chart/pembayaranweekly";

function Pembayaran() {
  const [warehouseId, setWarehouseId] = useLocalStorage("warehouse-id", "1");
  const thisday = useQuery({
    queryKey: ["payment"],
    queryFn: async () => await getPaymentDaily(parseFloat(warehouseId)),
  });
  const payment = thisday.data?.payments;
  if (!payment) return null;
  return (
    <div className="border rounded-md p-4 bg-card">
      <h3 className="font-bold text-xl">
        Total Pembayaran/hari ini : Rp.
        {formatRupiah(thisday.data?.totalAmount || 0)}
      </h3>
      <div className="my-4">
        <PembayaranWeekly chartData={thisday.data?.chartData || []} />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableCell className="w-10">No</TableCell>
            <TableCell>Amount</TableCell>
            <TableCell>Method</TableCell>
            <TableCell>Notes</TableCell>
            <TableCell>Date</TableCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payment?.map((item, i) => {
            return (
              <TableRow key={i}>
                <TableCell className="w-10">{i + 1}</TableCell>{" "}
                <TableCell>Rp.{formatRupiah(item.amount)}</TableCell>
                <TableCell>{item.method}</TableCell>
                <TableCell>{item.notes}</TableCell>
                <TableCell>{formatDate(item.createdAt)}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

export default Pembayaran;
