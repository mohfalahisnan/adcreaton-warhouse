"use client";
import React, { useState } from "react";
import { Button } from "./ui/button";
import { CheckCircle2, CogIcon, Pencil, Save, Trash } from "lucide-react";

import { useMutation, useQuery } from "@tanstack/react-query";
import { addUnit, deleteUnit, getUnit } from "@/lib/actions/unit";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "./ui/table";
import { ResponsiveDialog } from "./ResponsiveDialog";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  Form,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import Condition from "./Condition";
import { Satuan } from "@prisma/client";
import { toast } from "./ui/use-toast";
import { queryClient } from "./provider";

function UnitForm({ id }: { id: string }) {
  const [open, setOpen] = useState(false);
  const [add, setAdd] = useState(false);
  const { data } = useQuery({
    queryKey: ["unit", id],
    queryFn: () => getUnit(id),
  });

  const addMutation = useMutation({
    mutationFn: async (item: Satuan) => await addUnit(id, item),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["unit", id] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setAdd(false);
      setOpen(false);
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

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => await deleteUnit(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["unit", id] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
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
    name: z.string(),
    multiplier: z.number(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {},
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    addMutation.mutate(values as Satuan);
  }

  return (
    <div>
      <ResponsiveDialog
        title="Manage Unit"
        description="Manage Unit"
        open={open}
        onOpenChange={setOpen}
        triggerContent={
          <div className="w-6 h-6 cursor-pointer flex bg-primary text-white items-center justify-center gap-2 p-1 rounded">
            <CogIcon size={12} />
          </div>
        }
      >
        <div>
          <div className="my-2">
            <Button size={"sm"} onClick={() => setAdd(!add)}>
              {add ? "Cancel" : "Add Unit"}
            </Button>
          </div>
          <Condition show={add}>
            <div>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <div className="flex gap-4">
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
                      name="multiplier"
                      render={({ field }) => (
                        <FormItem className="w-full">
                          <FormLabel>Quantity</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Multiplier..."
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
          <Condition show={!add}>
            <Table>
              <TableHeader className="bg-accent">
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Multiplier</TableCell>
                  <TableCell className="text-center">Actions</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.map((item) => (
                  <TableRow key={item.satuan_id}>
                    <TableCell className="capitalize">{item.name}</TableCell>
                    <TableCell>{item.multiplier}</TableCell>
                    <TableCell className="flex gap-2 items-center justify-center">
                      <Button
                        size="xs"
                        onClick={() => {
                          /* Add logic here */
                        }}
                      >
                        <Pencil size={12} />
                      </Button>
                      <Button
                        size="xs"
                        onClick={() => {
                          deleteMutation.mutate(item.satuan_id);
                        }}
                        className="bg-destructive hover:bg-destructive/80"
                      >
                        <Trash size={12} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Condition>
        </div>
      </ResponsiveDialog>
    </div>
  );
}

export default UnitForm;
