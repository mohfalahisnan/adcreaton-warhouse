"use client";
import React, { useState } from "react";
import { Button } from "./ui/button";
import { CheckCircle2, CogIcon, Pencil, Save, Trash, X } from "lucide-react";

import { useMutation, useQuery } from "@tanstack/react-query";
import { addUnit, deleteUnit, editUnit, getUnit } from "@/lib/actions/unit";
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
  const [edit, setEdit] = useState(false);
  const [selected, setSelected] = useState<Satuan | null>(null);
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

  const editMutation = useMutation({
    mutationFn: async (item: Satuan) => await editUnit(item.satuan_id, item),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["unit", id] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setAdd(false);
      setEdit(false);
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
    satuan_id: z.number().optional(),
    name: z.string(),
    multiplier: z.number(),
  });

  const formSchemaEdit = z.object({
    satuan_id: z.number().optional(),
    name: z.string().optional(),
    multiplier: z.number().optional(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {},
  });

  const editForm = useForm<z.infer<typeof formSchemaEdit>>({
    resolver: zodResolver(formSchemaEdit),
    defaultValues: {
      satuan_id: selected?.satuan_id,
      name: selected?.name,
      multiplier: selected?.multiplier,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    addMutation.mutate(values as Satuan);
  }
  async function onSubmitEdit(values: z.infer<typeof formSchemaEdit>) {
    values.satuan_id = selected?.satuan_id;
    editMutation.mutate(values as Satuan);
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
            {!edit && (
              <Button size={"sm"} onClick={() => setAdd(!add)}>
                {add ? "Cancel" : "Add Unit"}
              </Button>
            )}
          </div>
          <Condition show={add && !edit}>
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
                    <Button
                      type="reset"
                      className="flex gap-2 mr-4"
                      variant={"outline"}
                      onClick={() => {
                        setAdd(false);
                        setSelected(null);
                      }}
                    >
                      <X size={16} />
                      Cancel
                    </Button>
                    <Button type="submit" className="flex gap-2">
                      <Save size={16} />
                      Save
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </Condition>
          <Condition show={edit && !add}>
            <div>
              <Form {...editForm}>
                <form
                  onSubmit={editForm.handleSubmit(onSubmitEdit)}
                  className="space-y-4"
                >
                  <div className="flex gap-4">
                    <FormField
                      control={editForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem className="w-full">
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              defaultValue={selected?.name}
                              placeholder="Name"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={editForm.control}
                      name="multiplier"
                      render={({ field }) => (
                        <FormItem className="w-full">
                          <FormLabel>Quantity</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              defaultValue={selected?.multiplier}
                              placeholder="Multiplier..."
                              {...field}
                              // value={field.value ? Number(field.value) : ""}
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
                    <Button
                      type="reset"
                      className="flex gap-2 mr-4"
                      variant={"outline"}
                      onClick={() => {
                        setEdit(false);
                        setSelected(null);
                      }}
                    >
                      <X size={16} />
                      Cancel
                    </Button>
                    <Button type="submit" className="flex gap-2">
                      <Save size={16} />
                      Save
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </Condition>
          <Condition show={!add && !edit}>
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
                          setSelected(item);
                          setEdit(true);
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
