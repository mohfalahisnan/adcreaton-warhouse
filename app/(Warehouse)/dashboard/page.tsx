import Overview from "@/components/section/overview";
import { Button } from "@/components/ui/button";
import React from "react";
import Link from "next/link";

type Props = {};

const page = (props: Props) => {
  return (
    <div>
      <div>
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold">Dashboard</h3>
          <div className="flex gap-2">
            {/* <Button size={"sm"} className="flex items-center gap-2">
              <Plus size={12} /> Transaction
            </Button> */}
          </div>
        </div>
      </div>
      <div className="w-full mb-8">
        <h3 className="font-bold text-center">
          Aktivitas apa yang ingin Anda lakukan?
        </h3>
        <div className="w-10/12 mx-auto my-4 flex-wrap flex gap-2 justify-center items-center">
          <Button asChild>
            <Link href="/">Buat Faktur Penjualan</Link>
          </Button>
          <Button asChild>
            <Link href="/">Buat Pesanan</Link>
          </Button>
          <Button asChild>
            <Link href="/">Buat Faktur Pembelian</Link>
          </Button>
          <Button asChild>
            <Link href="/">Buat Faktur Tambah Product</Link>
          </Button>
          <Button asChild>
            <Link href="/">Lihat Laporan Laba Rugi</Link>
          </Button>
          <Button asChild>
            <Link href="/">Buat Pencatatan Biaya</Link>
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
        <Overview title="Income" value={243} lastweak={432} unit="pcs" />
        <Overview title="Income" value={123} lastweak={112} unit="%" />
        <Overview title="Income" value={343} lastweak={332} unit="pcs" />
        <Overview title="Income" value={343} lastweak={132} unit="pcs" />
      </div>
      {/* <div className="grid grid-cols-1 mt-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <h3>Order</h3>
            <DataTable />
          </CardContent>
        </Card>
      </div> */}
    </div>
  );
};

export default page;
