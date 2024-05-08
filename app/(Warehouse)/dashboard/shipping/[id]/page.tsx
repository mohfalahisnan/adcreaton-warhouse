"use client";
import Dropdown from "@/components/Dropdown";
import { queryClient } from "@/components/provider";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { useLocalStorage } from "@/hook/useLocalstorage";
import { getCars } from "@/lib/actions/car";
import { getOrderById } from "@/lib/actions/order";
import { createShipment } from "@/lib/actions/shipping";
import { formatRupiah } from "@/lib/formatRupiah";
import { generateShipmentCode } from "@/lib/generateCode";
import { Car, Shipment } from "@prisma/client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { CheckCircle2, Truck } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

const Page = ({ params }: { params: { id: string } }) => {
  const [warehouseId, setWarehouseId] = useLocalStorage("warehouse-id", "1");
  const [open, setOpen] = useState(false);
  const [selectedCar, setSelectedCar] = useState<Car>();
  const router = useRouter();
  const { data } = useQuery({
    queryKey: ["order", params.id],
    queryFn: async () => await getOrderById(params.id),
  });
  const car = useQuery({
    queryKey: ["cars"],
    queryFn: async () => getCars(parseInt(warehouseId)),
  });

  const kirim = useMutation({
    mutationFn: createShipment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order", params.id] });
      router.push("/dashboard/shipping");
    },
    onError(error) {
      toast({
        title: `Error`,
        description: `${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleKirim = () => {
    if (!selectedCar) {
      alert("Pilih Mobil Terlebih Dahulu!");
      return null;
    }
    if (!data) return null;
    const datas: Omit<Shipment, "shipment_id"> = {
      car_id: selectedCar.car_id,
      customer_id: data.customer_id,
      shipment_code: generateShipmentCode(),
      note: null,
      warehouse_id: parseInt(warehouseId),
      createdAt: new Date(),
      updatedAt: new Date(),
      shippedDate: new Date(),
      deliveryDate: null,
      order_id: data.order_id,
    };
    kirim.mutate(datas);
  };

  return (
    <div>
      <div className="w-full max-w-xl border rounded-md p-4">
        <h2>
          Order Code : <b>{data?.order_code}</b>
        </h2>
        <ul>
          <li>
            Customer : <b>{data?.customer_name?.name}</b> (
            {data?.customer_name?.phone})
          </li>
          <li>Sales : {data?.sales_name?.name || "-"}</li>
          <li>Total : Rp. {formatRupiah(data?.totalAmount || 0)}</li>
          <li className="flex items-center gap-2">
            Shipping :
            <Dropdown
              open={open}
              setOpen={setOpen}
              triggerContent={
                <Button size={"sm"} onClick={() => setOpen(!open)}>
                  {selectedCar ? selectedCar.plat_nomor : "Pilih Mobil"}
                </Button>
              }
            >
              <div className="p-2 bg-card shadow-xl min-w-60 rounded-md">
                {car.data &&
                  car.data.map((item, i) => {
                    return (
                      <Button
                        variant={"ghost"}
                        key={i}
                        onClick={() => {
                          setSelectedCar(item);
                          setOpen(false);
                        }}
                        className="w-full"
                      >
                        {item.plat_nomor}
                      </Button>
                    );
                  })}
              </div>
            </Dropdown>
          </li>
        </ul>
        <div className="flex justify-end">
          <Button size={"sm"} onClick={() => handleKirim()}>
            <Truck size={18} className="mr-2" /> Kirim
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Page;
