import React from "react";
import Link from "next/link";

const Page = () => {
  return (
    <div>
      <div className="grid grid-cols-5 gap-8 mb-8">
        <Link href={"/dashboard/report/finance"}>
          <div className="w-full py-4 transition-all duration-200 rounded-lg bg-zinc-100 hover:bg-primary hover:text-white flex items-center justify-center text-lg">
            Keuangan
          </div>
        </Link>
        <Link href={"/dashboard/report/pesanan"}>
          <div className="w-full py-4 transition-all duration-200 rounded-lg bg-zinc-100 hover:bg-primary hover:text-white flex items-center justify-center text-lg">
            Pesanan
          </div>
        </Link>
        <Link href={"/dashboard/report/pengeluaran"}>
          <div className="w-full py-4 transition-all duration-200 rounded-lg bg-zinc-100 hover:bg-primary hover:text-white flex items-center justify-center text-lg">
            Pengeluaran
          </div>
        </Link>
        <Link href={"/dashboard/report/barangmasuk"}>
          <div className="w-full py-4 transition-all duration-200 rounded-lg bg-zinc-100 hover:bg-primary hover:text-white flex items-center justify-center text-lg">
            Barang Masuk
          </div>
        </Link>
        <Link href={"/dashboard/report/barangkeluar"}>
          <div className="w-full py-4 transition-all duration-200 rounded-lg bg-zinc-100 hover:bg-primary hover:text-white flex items-center justify-center text-lg">
            Barang Keluar
          </div>
        </Link>
        {/* <Link href={"/dashboard/report/finance"}>
          <div className="w-full py-4 transition-all duration-200 rounded-lg bg-zinc-100 hover:bg-primary hover:text-white flex items-center justify-center text-lg">
            Retur
          </div>
        </Link> */}
        <Link href={"/dashboard/report/transfer"}>
          <div className="w-full py-4 transition-all duration-200 rounded-lg bg-zinc-100 hover:bg-primary hover:text-white flex items-center justify-center text-lg">
            Transfer
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Page;
