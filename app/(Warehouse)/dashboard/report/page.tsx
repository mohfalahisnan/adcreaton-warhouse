import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import React from "react";

const TABS = [
  "pembayaran",
  "pemesanan",
  "pengeluaran",
  "barangmasuk",
  "barangkeluar",
  "retur",
  "transfer",
  "other",
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
            <h1>Pembayaran</h1>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Page;
