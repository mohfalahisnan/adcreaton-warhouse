"use client";
import React, { useState } from "react";

import { ResponsiveDialog } from "./ResponsiveDialog";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

import { useGetProducts } from "@/hook/useProduct";
import { Inbound, Product } from "@prisma/client";
import { Button } from "./ui/button";
import { useMutation, useQuery } from "@tanstack/react-query";
import { addInbound } from "@/lib/actions/inbound";
import { queryClient } from "./provider";
import { toast } from "./ui/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Save } from "lucide-react";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import Condition from "./Condition";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { getUnit } from "@/lib/actions/unit";
import { useSession } from "next-auth/react";
import { useLocalStorage } from "@/hook/useLocalstorage";

function InboundForm() {
  const [open, setOpen] = useState(false);
  const { data: user } = useSession();
  const [warehouseId, setWarehouseId] = useLocalStorage("warehouse-id", "1");
  const [selected, setSelected] = useState<Product | undefined>();
  const { data } = useGetProducts({});

  const unit = useQuery({
    queryKey: ["unit", selected?.product_id],
    queryFn: async () => {
      if (selected) {
        return await getUnit(selected.product_id);
      }
      throw new Error("No product selected");
    },
    enabled: !!selected, // This query will not run until a product is selected
  });

  const inboundMutation = useMutation({
    mutationFn: async (data: Inbound & { product_name: string }) =>
      await addInbound(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inbound"] });
      setOpen(false);
      setSelected(undefined);
    },
    onError(error) {
      toast({
        title: `Error: ${error.message}`,
        description: `${error.message}`,
        variant: "destructive",
      });
    },
  });

  const formSchema = z.object({
    quantity: z.number(),
    notes: z.string(),
    unit: z.string(),
    price: z.number(),
    inputBy: z.string().optional(),
    product_id: z.string().optional(),
    product_name: z.string().optional(),
    warehouse_id: z.string().optional(),
    satuan_id: z.string().optional(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {},
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    values.quantity = Number(values.quantity);
    values.inputBy = user?.user?.name || "";
    values.product_id = selected?.product_id || "";
    values.warehouse_id = warehouseId;
    values.product_name = selected?.name || "";
    values.price = values.price;
    values.satuan_id = values.unit;

    inboundMutation.mutate(
      values as unknown as Inbound & { product_name: string }
    );
  }

  return (
    <div className="w-full flex justify-end items-end">
      <ResponsiveDialog
        title="Inbound"
        description="Barang Masuk"
        open={open}
        onOpenChange={setOpen}
        triggerContent={
          <div className="w-auto max-w-xs text-sm cursor-pointer flex bg-primary text-white items-center justify-center gap-2 px-3 py-2 rounded">
            Barang Masuk
          </div>
        }
      >
        {selected !== undefined && (
          <div>
            Product :{" "}
            <Button
              variant={"outline"}
              size={"sm"}
              onClick={() => setSelected(undefined)}
              className="capitalize"
            >
              {selected?.name}
            </Button>
          </div>
        )}
        <Condition show={selected !== undefined}>
          <div>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <div className="w-full flex gap-4">
                  <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel>Quantity</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Quantity..."
                            {...field}
                            value={field.value ? Number(field.value) : ""}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="unit"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel>Unit</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Unit" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {unit.data?.map((item, i) => (
                              <SelectItem
                                value={JSON.stringify(item.satuan_id)}
                                key={i}
                                className="capitalize"
                              >
                                {item.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel>Price</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="price..."
                            {...field}
                            value={field.value ? Number(field.value) : ""}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Notes..." {...field} />
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
        </Condition>
        {selected === undefined && (
          <div>
            <h3>Pilih Barang Terlebih Dahulu :</h3>
            <Command className="bg-card border my-2">
              <CommandInput placeholder="search..." className="bg-card" />
              <CommandList className="bg-card">
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup>
                  {data?.map((item) => (
                    <CommandItem
                      key={item.product_id}
                      className="cursor-pointer capitalize"
                      onClick={() => setSelected(item)}
                      onSelect={() => setSelected(item)}
                    >
                      {item.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </div>
        )}
      </ResponsiveDialog>
    </div>
  );
}

export default InboundForm;
