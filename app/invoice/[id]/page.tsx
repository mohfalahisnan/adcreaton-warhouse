"use client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useLocalStorage } from "@/hook/useLocalstorage";
import { getOrdersByIds } from "@/lib/actions/order";
import { getSetting } from "@/lib/actions/setting";
import { getWarehouse } from "@/lib/actions/warehouse";
import { formatDate } from "@/lib/formatDate";
import { formatRupiah } from "@/lib/formatRupiah";
import { tierPriceApplied } from "@/lib/tierPriceApplied";
import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";

const Invoice = ({ params }: { params: { id: string } }) => {
  const { id } = params;
  const array = id.split("and");
  const [printed, setPrinted] = useState(false);
  const [warehouseId] = useLocalStorage("warehouse_id", "1");
  const warhouse = useQuery({
    queryKey: ["warehouse", warehouseId],
    queryFn: () => getWarehouse({ warehouse_id: parseInt(warehouseId) }),
  });
  const { data, isLoading } = useQuery({
    queryKey: ["order", id],
    queryFn: () => getOrdersByIds(array),
  });
  const setting = useQuery({
    queryKey: ["setting"],
    queryFn: async () => await getSetting(),
  });
  useEffect(() => {
    if (!isLoading && !setting.isLoading && !printed) {
      setPrinted(true);
      window.print();
    }
  }, [isLoading, setting]);

  if (isLoading) return <>Loading...</>;
  if (!setting.data) return null;

  return (
    <>
      {data?.map((data, i) => {
        return (
          <div
            className="w-full p-8 invoice-page"
            style={{ marginBottom: "40px", pageBreakAfter: "always" }}
            key={i}
          >
            <div>
              {/* <Image
                src={setting.data?.web_logo || ""}
                width={200}
                height={100}
                alt="logo"
              /> */}
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
                      <td>{data?.sales_name?.name}</td>
                    </tr>
                    <tr>
                      <td>Tanggal</td>
                      <td className="px-2">:</td>
                      <td>{data?.createdAt && formatDate(data?.createdAt)}</td>
                    </tr>
                    <tr>
                      <td>No.Faktur </td>
                      <td className="px-2">:</td>
                      <td>{data?.order_code}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div>
                <div className="w-full min-w-[300px]">
                  Pelanggan :<br />
                  {data?.customer_name?.name}
                  <br />
                  {data?.customer_name?.alamat}
                  <br />
                  {data?.customer_name?.phone}
                </div>
              </div>
            </div>
            <Table className="border mt-4">
              <TableHeader className="border-b bg-accent">
                <TableRow>
                  <TableHead className="w-[50px]">No</TableHead>
                  <TableHead>Nama Barang</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Satuan</TableHead>
                  <TableHead>Harga</TableHead>
                  <TableHead>Strata</TableHead>
                  <TableHead>Potongan</TableHead>
                  <TableHead>Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.OrderItem.map((item, index) => (
                  <TableRow key={item.order_item_id} className="border-b">
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{item.product.name}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>{item.satuan?.name}</TableCell>
                    <TableCell>
                      Rp.{formatRupiah(item.product.sell_price)}
                    </TableCell>
                    <TableCell>
                      Rp.
                      {formatRupiah(
                        item.product.sell_price -
                          (tierPriceApplied({
                            ...item.product,
                            count:
                              item.quantity * (item.satuan?.multiplier || 1),
                          }) || 0),
                      )}
                    </TableCell>
                    <TableCell>Rp.{formatRupiah(item.discount || 0)}</TableCell>
                    <TableCell>
                      Rp.
                      {formatRupiah(
                        tierPriceApplied({
                          ...item.product,
                          count: item.quantity * (item.satuan?.multiplier || 1),
                        }) *
                          item.quantity *
                          (item.satuan?.multiplier || 1) -
                          (item.discount || 0),
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableHeader className="bg-accent border-t print-bg-accent">
                <TableRow>
                  <TableHead colSpan={7} className="text-right">
                    Total
                  </TableHead>
                  <TableHead>
                    Rp.{formatRupiah(data?.totalAmount || 0)}
                  </TableHead>
                </TableRow>
              </TableHeader>
            </Table>
          </div>
        );
      })}
    </>
  );
};

export default Invoice;
