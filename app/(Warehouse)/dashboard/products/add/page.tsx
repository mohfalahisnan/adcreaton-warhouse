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
import { Textarea } from "@/components/ui/textarea";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Plus, Save, Trash } from "lucide-react";
import { addProduct } from "@/lib/actions/products";
import { Product } from "@prisma/client";
import { useToast } from "@/components/ui/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { ITierPrice } from "@/interface";
import { useSession } from "next-auth/react";
import { useGetCategory } from "@/hook/useCategory";

import SelectCategory from "@/components/SelectCategory";
import { ResponsiveDialog } from "@/components/ResponsiveDialog";
import CategoryForm from "@/components/CategoryForm";
import { useLocalStorage } from "@/hook/useLocalstorage";
import Image from "next/image";

const ProductForm = () => {
  const session = useSession();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [warehouseId, setWarehouseId] = useLocalStorage("warehouse-id", "1");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [tierPrice, setTierPrice] = useState<ITierPrice[]>([
    { id: 0, from: 0, to: 0, price: 0 },
  ]);
  const [stock, setStock] = useState(0);
  const router = useRouter();
  const [showFormCategory, setShowFormCategory] = useState(false);
  // Query functiono
  const category = useGetCategory({});
  const queryClient = useQueryClient();
  const productMutation = useMutation({
    mutationFn: async (values: Product) =>
      await addProduct(values, session.data?.user?.name as string),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      router.push("/dashboard/products");
      toast({
        description: (
          <div className="flex items-center justify-between gap-2">
            <div>
              <span className="text-green-500">
                <CheckCircle2 size={28} strokeWidth={1} />
              </span>
            </div>
            <div>
              <h3 className="text-lg">Product Added!</h3>
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
    image: z.string(),
    name: z.string().min(6).max(100),
    description: z.string().min(10).max(1000),
    sell_price: z.number(),
    buy_price: z.number(),
    tier_price: z.string().optional(),
    inputby: z.string(),
    category_id: z.number(),
    // unit: z.string().optional(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      inputby: session.data?.user?.name || "",
      image: "/products/product-1.jpg",
      // unit: "pcs",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    console.log("exec");
    if (!file) {
      alert("Please select a file first!");
      setIsLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (response.ok) {
        values.image = result.image;
      } else {
        alert(`Failed to upload file: ${result.message}`);
      }
      setIsLoading(false);
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Error uploading file");
      setIsLoading(false);
    }

    values.inputby = session.data?.user?.name as string;
    values.tier_price = JSON.stringify(tierPrice);
    productMutation.mutate(values as Product);
    setIsLoading(false);
  }

  const addTierPrice = () => {
    const id = tierPrice ? tierPrice.length : 0;
    const newTier = {
      id: id,
      from: 0, // Atur nilai default
      to: 0, // Atur nilai default
      price: 0, // Atur nilai default
    };
    setTierPrice(tierPrice ? [...tierPrice, newTier] : [newTier]);
  };

  const handleTierChange = (
    index: number,
    field: keyof ITierPrice,
    value: number,
  ) => {
    const updatedTierPrice = [...tierPrice];
    updatedTierPrice[index][field] = value;
    setTierPrice(updatedTierPrice);
  };

  const deleteTierPrice = (index: number) => {
    const updatedTierPrice = [...tierPrice];
    updatedTierPrice.splice(index, 1); // Menghapus tier pada indeks tertentu
    setTierPrice(updatedTierPrice);
  };

  // handle image file
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files[0]) {
      setFile(files[0]);
      setPreviewUrl(URL.createObjectURL(files[0]));
    }
  };
  return (
    <div>
      <div className="p-4 border bg-card rounded-lg">
        <div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem className="hidden">
                    <FormControl>
                      <Input type="text" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="inputby"
                render={({ field }) => (
                  <FormItem className="hidden">
                    <FormControl>
                      <Input
                        type="text"
                        defaultValue={session.data?.user?.name as string}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <input
                type="file"
                id="file-upload"
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer bg-primary text-white px-4 py-2 rounded-lg shadow hover:opacity-70"
              >
                Upload File
              </label>
              {previewUrl && (
                <Image
                  src={previewUrl}
                  alt="Preview"
                  width={200}
                  height={200}
                />
              )}

              {/* Field for name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Name</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="Product Name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Field for category */}
              <FormField
                control={form.control}
                name="category_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <div className="flex flex-row gap-2">
                        <SelectCategory
                          data={category.data || []}
                          form={form}
                        />
                        <ResponsiveDialog
                          title="Add Category"
                          description=""
                          triggerContent={
                            <Button
                              variant={"secondary"}
                              size={"sm"}
                              className="flex items-center gap-2"
                            >
                              <Plus size={12} /> Category
                            </Button>
                          }
                          open={showFormCategory}
                          onOpenChange={setShowFormCategory}
                        >
                          <div className="max-h-[70vh] overflow-auto">
                            <CategoryForm
                              onSuccess={() => setShowFormCategory(false)}
                            />
                          </div>
                        </ResponsiveDialog>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Field for description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Field for sell_price */}
              <FormField
                control={form.control}
                name="sell_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sell Price</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Sell Price"
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Field for buy_price */}
              <FormField
                control={form.control}
                name="buy_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Buy Price</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Buy Price"
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Field for tier_price */}
              <FormField
                control={form.control}
                name="tier_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tier Price</FormLabel>
                    <FormControl>
                      <div>
                        <div>
                          {tierPrice && (
                            <div className="grid grid-cols-4 gap-2">
                              <span className="text-sm">From</span>
                              <span className="text-sm">To</span>
                              <span className="text-sm">Price</span>
                            </div>
                          )}
                          {tierPrice?.map((_, i) => {
                            return (
                              <div
                                className="grid grid-cols-4 gap-2 mb-2"
                                key={i}
                              >
                                <Input
                                  type="number"
                                  placeholder="0"
                                  onChange={(e) =>
                                    handleTierChange(
                                      i,
                                      "from",
                                      parseInt(e.target.value),
                                    )
                                  }
                                />
                                <Input
                                  type="number"
                                  placeholder="100"
                                  onChange={(e) =>
                                    handleTierChange(
                                      i,
                                      "to",
                                      parseInt(e.target.value),
                                    )
                                  }
                                />

                                <div className="flex justify-between gap-2 col-span-2">
                                  <Input
                                    type="number"
                                    placeholder="Price"
                                    onChange={(e) =>
                                      handleTierChange(
                                        i,
                                        "price",
                                        parseInt(e.target.value),
                                      )
                                    }
                                    className="w-full flex-1"
                                  />
                                  <Button
                                    type="button"
                                    size={"icon"}
                                    variant={"outline"}
                                    onClick={() => deleteTierPrice(i)}
                                  >
                                    <Trash size={16} />
                                  </Button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        <Button
                          type="button"
                          onClick={addTierPrice}
                          variant={"outline"}
                          className="mt-4 w-full flex gap-2"
                        >
                          <Plus size={14} />
                          Add Tier Price
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="w-full flex justify-end">
                <Button
                  type="submit"
                  className="flex gap-2"
                  disabled={isLoading}
                >
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

export default ProductForm;
