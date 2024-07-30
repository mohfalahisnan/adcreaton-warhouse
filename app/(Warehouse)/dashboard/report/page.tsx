import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import React from "react";
import Pembayaran from "./pembayaran";
import { PesananDailyChart } from "./chart/pesananweekchart";
import { PengeluaranDailyChart } from "./chart/pengeluaran";
import { BarangKeluarDailyChart } from "./chart/barangkeluar";
import { BarangMasukDailyChart } from "./chart/barangmasuk";
import { TransferDailyChart } from "./chart/transfer";

const TABS = [
  "pembayaran",
  "pemesanan",
  "pengeluaran",
  "barangmasuk",
  "barangkeluar",
  "retur",
  "transfer",
];

const Page = () => {
  return (
    <div>
      <Tabs defaultValue="pembayaran">
        <TabsList>
          {TABS.map((item, i) => (
            <TabsTrigger value={item} key={i} className="capitalize">
              {item}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="pembayaran">
          <div>
            <Pembayaran />
          </div>
        </TabsContent>
        <TabsContent value="pemesanan">
          <PesananDailyChart />
        </TabsContent>
        <TabsContent value="pengeluaran">
          <PengeluaranDailyChart />
        </TabsContent>
        <TabsContent value="barangkeluar">
          <BarangKeluarDailyChart />
        </TabsContent>
        <TabsContent value="barangmasuk">
          <BarangMasukDailyChart />
        </TabsContent>
        <TabsContent value="transfer">
          <TransferDailyChart />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Page;
