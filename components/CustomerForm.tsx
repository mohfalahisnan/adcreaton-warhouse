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
import { Customer, Prisma, User } from "@prisma/client";
import { useToast } from "@/components/ui/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { addSales } from "@/lib/actions/accounts";
import { useLocalStorage } from "@/hook/useLocalstorage";
import { Textarea } from "./ui/textarea";
import { addCustomer } from "@/lib/actions/customer";

const CustomerForm = ({ onSuccess }: { onSuccess?: () => void }) => {
  const { toast } = useToast();
  const router = useRouter();
  const [warehouseId, setWarehouseId] = useLocalStorage("warehouse-id", "1");
  // Query functiono
  const queryClient = useQueryClient();
  const customerMutation = useMutation({
    mutationFn: async (values: Prisma.CustomerCreateInput) =>
      await addCustomer(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer"] });
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

  // Form Function
  const formSchema = z.object({
    name: z.string().max(255),
    alamat: z.string(),
    phone: z.string(), // Adjust based on typical phone number length
    warehouse_id: z.number().optional(),
  });
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {},
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    values.warehouse_id = parseFloat(warehouseId);
    customerMutation.mutate(values as unknown as Prisma.CustomerCreateInput);
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
                  name="name"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input type="text" placeholder="Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="Phone" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="alamat"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alamat</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Alamat" {...field} />
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

export default CustomerForm;
