"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useMutation } from "@tanstack/react-query";
import { createWarehouse } from "@/lib/actions/warehouse";
import { CheckCircle2 } from "lucide-react";
import { toast } from "./ui/use-toast";
import { queryClient } from "./provider";
const formSchema = z.object({
  name: z.string().min(1).max(255),
  location: z.string().min(1),
  address: z.string().min(1),
  phone: z.coerce.number().gte(1),
});

export function WarehouseForm() {
  const qmutate = useMutation({
    mutationFn: async (data: any) => await createWarehouse({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["warehouse"] });
      toast({
        description: (
          <div className="flex items-center justify-between gap-2">
            <div>
              <span className="text-green-500">
                <CheckCircle2 size={28} strokeWidth={1} />
              </span>
            </div>
            <div>
              <h3 className="text-lg">Sucess!</h3>
            </div>
          </div>
        ),
      });
    },
  });
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {},
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log("values:", values);
    qmutate.mutate(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Placeholder" {...field} />
              </FormControl>
              <FormDescription>Description</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <Input placeholder="Placeholder" {...field} />
              </FormControl>
              <FormDescription>Description</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Input placeholder="Placeholder" {...field} />
              </FormControl>
              <FormDescription>Description</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone</FormLabel>
              <FormControl>
                <Input type="number" placeholder="Placeholder" {...field} />
              </FormControl>
              <FormDescription>Description</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
