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
import { Prisma, Satuan } from "@prisma/client";
import { toast } from "./ui/use-toast";
import { queryClient } from "./provider";
import { StrataValue } from "@/lib/strataValue";
import { useLocalStorage } from "@/hook/useLocalstorage";

function UnitForm({ id }: { id: string }) {
  const [warehouseId, setWarehouseId] = useLocalStorage("warehouse-id", "1");
  const [open, setOpen] = useState(false);
  const [add, setAdd] = useState(false);
  const [edit, setEdit] = useState(false);
  const [strata, setStrata] = useState<StrataValue[]>();
  const [selected, setSelected] = useState<Satuan | null>(null);
  const { data, isLoading } = useQuery({
    queryKey: ["unit", id],
    queryFn: () => getUnit(id, parseInt(warehouseId)),
  });

  const addMutation = useMutation({
    mutationFn: async (item: Satuan) =>
      await addUnit(id, item, parseInt(warehouseId)),
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
    price: z.number(),
    strata: z.boolean().default(false),
    strataValue: z
      .array(
        z.object({
          price: z.number(),
          quantity: z.number(),
        })
      )
      .optional(),
  });

  const formSchemaEdit = z.object({
    satuan_id: z.number().optional(),
    name: z.string().optional(),
    multiplier: z.number().optional(),
    price: z.number().optional(),
    strata: z.boolean().default(false),
    strataValue: z
      .array(
        z.object({
          price: z.number(),
          quantity: z.number(),
        })
      )
      .optional(),
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
      price: selected?.price,
      strata: selected?.strata ?? false,
      strataValue: selected?.strataValue
        ? (selected.strataValue as { price: number; quantity: number }[])
        : [],
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    addMutation.mutate(values as unknown as Satuan);
  }
  async function onSubmitEdit(values: z.infer<typeof formSchemaEdit>) {
    values.satuan_id = selected?.satuan_id;
    values.strata = selected?.strata || false;
    (values.strataValue = selected?.strataValue
      ? (selected.strataValue as { price: number; quantity: number }[])
      : []),
      editMutation.mutate(values as unknown as Satuan);
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

          {/* add */}
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
                      name="price"
                      render={({ field }) => (
                        <FormItem className="w-full">
                          <FormLabel>Price</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Price..."
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
                  <div className="mt-4">
                    <FormField
                      control={form.control}
                      name="strata"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="flex gap-2 items-center">
                              Strata :
                              <Input
                                type="checkbox"
                                className="w-4 h-4"
                                checked={field.value}
                                onChange={(e) =>
                                  field.onChange(e.target.checked)
                                }
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Condition show={form.watch("strata")}>
                      <FormField
                        control={form.control}
                        name="strataValue"
                        render={({ field }) => (
                          <FormItem className="w-full">
                            <FormLabel>Strata Value</FormLabel>
                            <FormControl>
                              <div>
                                {field.value && field.value.length > 0 ? (
                                  field.value.map(
                                    (strata: StrataValue, index: number) => (
                                      <div
                                        key={index}
                                        className="flex gap-2 items-end mb-2"
                                      >
                                        <div className="w-full">
                                          <FormLabel>Quantity :</FormLabel>
                                          <Input
                                            type="number"
                                            placeholder="Quantity"
                                            value={strata.quantity}
                                            onChange={(e) => {
                                              if (Array.isArray(field.value)) {
                                                const newValue = [
                                                  ...field.value,
                                                ];
                                                newValue[index].quantity =
                                                  Number(e.target.value);
                                                field.onChange(newValue);
                                              }
                                            }}
                                          />
                                        </div>
                                        <div className="w-full">
                                          <FormLabel>Price :</FormLabel>
                                          <Input
                                            type="number"
                                            placeholder="Price"
                                            value={strata.price}
                                            onChange={(e) => {
                                              if (Array.isArray(field.value)) {
                                                const newValue = [
                                                  ...field.value,
                                                ];
                                                newValue[index].price = Number(
                                                  e.target.value
                                                );
                                                field.onChange(newValue);
                                              }
                                            }}
                                          />
                                        </div>
                                        <Button
                                          type="button"
                                          onClick={() => {
                                            if (Array.isArray(field.value)) {
                                              const newValue =
                                                field.value.filter(
                                                  (_: any, i: number) =>
                                                    i !== index
                                                );
                                              field.onChange(newValue);
                                            }
                                          }}
                                        >
                                          Remove
                                        </Button>
                                      </div>
                                    )
                                  )
                                ) : (
                                  <p>No strata values added</p>
                                )}
                                <Button
                                  type="button"
                                  onClick={() => {
                                    const newValue = [
                                      ...(field.value || []),
                                      { quantity: 0, price: 0 },
                                    ];
                                    field.onChange(newValue);
                                  }}
                                >
                                  Add Strata
                                </Button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </Condition>
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

          {/* edit */}
          <Condition show={edit && !add}>
            <Condition show={!isLoading}>
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
                      <FormField
                        control={editForm.control}
                        name="price"
                        render={({ field }) => (
                          <FormItem className="w-full">
                            <FormLabel>Price</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                defaultValue={Number(selected?.price)}
                                placeholder="Price..."
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
                    <div className="mt-4">
                      <FormField
                        control={editForm.control}
                        name="strata"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <div className="flex gap-2 items-center">
                                Strata :
                                <Input
                                  type="checkbox"
                                  className="w-4 h-4"
                                  checked={selected?.strata}
                                  defaultChecked={selected?.strata}
                                  onChange={(e) => {
                                    field.onChange(e.target.checked);
                                    //@ts-ignore
                                    setSelected({
                                      ...selected,
                                      strata: e.target.checked,
                                    });
                                  }}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Condition show={!!selected?.strata}>
                        <FormField
                          control={editForm.control}
                          name="strataValue"
                          render={({ field }) => (
                            <FormItem className="w-full">
                              <FormLabel>Strata Value</FormLabel>
                              <FormControl>
                                <div>
                                  {selected?.strataValue &&
                                  (
                                    selected.strataValue as {
                                      price: number;
                                      quantity: number;
                                    }[]
                                  ).length > 0 ? (
                                    (
                                      selected.strataValue as unknown as StrataValue[]
                                    ).map(
                                      (strata: StrataValue, index: number) => (
                                        <div
                                          key={index}
                                          className="flex gap-2 items-end mb-2"
                                        >
                                          <div className="w-full">
                                            <FormLabel>Quantity :</FormLabel>
                                            <Input
                                              type="number"
                                              placeholder="Quantity"
                                              value={strata.quantity}
                                              onChange={(e) => {
                                                if (
                                                  Array.isArray(
                                                    selected.strataValue
                                                  )
                                                ) {
                                                  const newValue = [
                                                    ...selected.strataValue,
                                                  ];
                                                  //@ts-ignore
                                                  newValue[index].quantity =
                                                    Number(e.target.value);
                                                  setSelected({
                                                    ...selected,
                                                    strataValue: newValue,
                                                  });
                                                }
                                              }}
                                            />
                                          </div>
                                          <div className="w-full">
                                            <FormLabel>Price :</FormLabel>
                                            <Input
                                              type="number"
                                              placeholder="Price"
                                              value={strata.price}
                                              onChange={(e) => {
                                                if (
                                                  Array.isArray(
                                                    selected.strataValue
                                                  )
                                                ) {
                                                  const newValue = [
                                                    ...selected.strataValue,
                                                  ];
                                                  //@ts-ignore
                                                  newValue[index].price =
                                                    Number(e.target.value);
                                                  setSelected({
                                                    ...selected,
                                                    strataValue: newValue,
                                                  });
                                                }
                                              }}
                                            />
                                          </div>
                                          <Button
                                            type="button"
                                            onClick={() => {
                                              if (Array.isArray(field.value)) {
                                                const newValue =
                                                  //@ts-ignore
                                                  selected.strataValue.filter(
                                                    (_: any, i: number) =>
                                                      i !== index
                                                  );
                                                setSelected({
                                                  ...selected,
                                                  strataValue: newValue,
                                                });
                                              }
                                            }}
                                          >
                                            Remove
                                          </Button>
                                        </div>
                                      )
                                    )
                                  ) : (
                                    <p>No strata values added</p>
                                  )}
                                  <Button
                                    type="button"
                                    onClick={() => {
                                      const newValue = [
                                        ...((selected?.strataValue as unknown as StrataValue[]) ||
                                          []),
                                        { quantity: 0, price: 0 },
                                      ];
                                      //@ts-ignore
                                      setSelected({
                                        ...selected,
                                        strataValue:
                                          newValue as unknown as Prisma.JsonValue,
                                      });
                                    }}
                                  >
                                    Add Strata
                                  </Button>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </Condition>
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
          </Condition>
          <Condition show={!add && !edit}>
            <Table>
              <TableHeader className="bg-accent">
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Multiplier</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell className="text-center">Actions</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.map((item) => (
                  <TableRow key={item.satuan_id}>
                    <TableCell className="capitalize">{item.name}</TableCell>
                    <TableCell>{item.multiplier}</TableCell>
                    <TableCell>{item.price}</TableCell>
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
