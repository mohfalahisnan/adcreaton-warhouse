"use client";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useLocalStorage } from "@/hook/useLocalstorage";
import { getWarehouse } from "@/lib/actions/warehouse";
import { useQuery } from "@tanstack/react-query";
import { PlusIcon } from "lucide-react";
import React from "react";

function Page() {
  const [warehouseId, setWarehouseId] = useLocalStorage("warehouse_id", "1");
  const warhouse = useQuery({
    queryKey: ["warehouse", warehouseId],
    queryFn: () => getWarehouse({ warehouse_id: Number(warehouseId) }),
  });
  return (
    <div className="fixed top-0 left-0 w-full h-full bg-card flex items-start justify-center">
      <div className="w-full p-8">
        <div>
          <h2 className="text-xl font-bold">{warhouse.data?.name}</h2>
          <h4>{warhouse.data?.location}</h4>
        </div>
        <div className="w-full flex justify-between">
          <div>
            <table>
              <tbody>
                <tr>
                  <td>Telp</td>
                  <td className="px-2">:</td>
                  <td>{warhouse.data?.phone}</td>
                </tr>
                <tr>
                  <td>Sales</td>
                  <td className="px-2">:</td>
                  <td>
                    <input type="text" />
                  </td>
                </tr>
                <tr>
                  <td>Tanggal</td>
                  <td className="px-2">:</td>
                  <td>{new Date().toLocaleDateString()}</td>
                </tr>
                <tr>
                  <td>No.Faktur </td>
                  <td className="px-2">:</td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
          <div>
            <p className="w-full min-w-[300px]">
              Pelanggan :<br />
              ....
            </p>
          </div>
        </div>
        <Table className="border mt-4">
          <TableHeader className="bg-accent">
            <TableRow>
              <TableHead className="w-[50px]">No</TableHead>
              <TableHead>Nama Barang</TableHead>
              <TableHead>Qty</TableHead>
              <TableHead>Satuan</TableHead>
              <TableHead>Harga</TableHead>
              <TableHead>Discount Strata</TableHead>
              <TableHead>Discount Potongan</TableHead>
              <TableHead>Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>1</TableCell>
              <TableCell>Barang 1</TableCell>
              <TableCell>200</TableCell>
              <TableCell>Satuan</TableCell>
              <TableCell>Rp.10000</TableCell>
              <TableCell>Rp.200000</TableCell>
              <TableCell>Rp.200000</TableCell>
              <TableCell>Rp.200000</TableCell>
            </TableRow>
            <TableRow>
              <TableCell colSpan={8} className="text-center">
                <Button size="xs">
                  <PlusIcon size={16} /> Add Product
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
          <TableHeader className="bg-accent">
            <TableRow>
              <TableHead colSpan={7} className="text-right">
                Total
              </TableHead>
              <TableHead>Rp.431124</TableHead>
            </TableRow>
          </TableHeader>
        </Table>
        <div className="flex items-end justify-end gap-4 mt-4">
          <Button variant="outline">Cancel</Button>
          <Button>Save</Button>
        </div>
      </div>
    </div>
  );
}

export default Page;
