"use client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Save } from "lucide-react";
import { Prisma } from "@prisma/client";
import { useToast } from "@/components/ui/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useLocalStorage } from "@/hook/useLocalstorage";
import { Textarea } from "./ui/textarea";
import { editCar, getCar } from "@/lib/actions/car";

const CarFormEdit = ({
  onSuccess,
  id,
}: {
  onSuccess?: () => void;
  id: string;
}) => {
  const { toast } = useToast();
  const router = useRouter();
  const [warehouseId, setWarehouseId] = useLocalStorage("warehouse-id", "1");
  // Query functiono
  const queryClient = useQueryClient();
  const carMutation = useMutation({
    mutationFn: async (values: Prisma.CarUpdateInput) =>
      await editCar(values, id),
    onSuccess: () => {
      queryClient.invalidateQueries();
      router.refresh();
      if (onSuccess) {
        onSuccess();
      }
      toast({
        description: (
          <div className="flex items-center justify-between gap-2">
            <div>
              <span className="text-green-500">
                <CheckCircle2 size={28} strokeWidth={1} />
              </span>
            </div>
            <div>
              <h3 className="text-lg">Success !</h3>
            </div>
          </div>
        ),
      });
    },
    onError(error) {
      toast({
        title: `Error: ${error.message}`,
        description: `${error.message}`,
        variant: "destructive",
      });
    },
  });
  const carData = useQuery({
    queryKey: ["car", id],
    queryFn: () => getCar(id),
  });
  // Form Function
  const formSchema = z.object({
    foto: z.string().optional(),
    plat_nomor: z.string(),
    nama: z.string().optional(),
    tanggal_stnk: z.string().optional(),
    tanggal_pajak: z.string().optional(),
    tanggal_kir: z.string().optional(),
    kelengkapan: z.string().optional(),
    catatan_perbaikan: z.string().optional(),
    note: z.string().optional(),
    warehouse_id: z.number().optional(),
    available: z.boolean().default(true),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nama: carData.data?.nama || "",
      catatan_perbaikan: carData.data?.catatan_perbaikan || "",
      kelengkapan: carData.data?.kelengkapan || "",
      note: carData.data?.note || "",
      plat_nomor: carData.data?.plat_nomor || "",
      tanggal_kir: carData.data?.tanggal_kir || "",
      tanggal_pajak: carData.data?.tanggal_pajak || "",
      tanggal_stnk: carData.data?.tanggal_stnk || "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    values.warehouse_id = parseFloat(warehouseId);
    carMutation.mutate(values as unknown as Prisma.CarUpdateInput);
  }

  return (
    <div>
      <div className="px-4">
        <div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="flex w-full flex-row gap-4">
                <FormField
                  control={form.control}
                  name="nama"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Nama Mobil</FormLabel>
                      <FormControl>
                        <Input type="text" placeholder="Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="plat_nomor"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Plat Nomor</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="Plat Nomor"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex flex-row gap-4">
                <FormField
                  control={form.control}
                  name="tanggal_kir"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Tanggal KIR</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          placeholder="Tanggal KIR"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="tanggal_pajak"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Tanggal Pajak</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          placeholder="Tanggal Pajak"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex flex-row gap-4">
                <FormField
                  control={form.control}
                  name="tanggal_stnk"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Tanggal STNK</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          placeholder="Tanggal STNK"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="kelengkapan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kelengkapan</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Kelengkapan" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="note"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Note</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Note" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="w-full flex justify-end">
                <Button type="submit" className="flex gap-2">
                  <Save size={16} />
                  Save
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default CarFormEdit;
