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
import { CheckCircle2, Plus, Save } from "lucide-react";
import { editProduct, getProductById } from "@/lib/actions/products";
import { Product } from "@prisma/client";
import { useToast } from "@/components/ui/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useGetCategory } from "@/hook/useCategory";

import SelectCategory from "@/components/SelectCategory";
import { ResponsiveDialog } from "@/components/ResponsiveDialog";
import CategoryForm from "@/components/CategoryForm";
import { useLocalStorage } from "@/hook/useLocalstorage";
import Image from "next/image";

const ProductForm = ({ product }: { product: any }) => {
  const session = useSession();
  const { toast } = useToast();

  const [warehouseId, setWarehouseId] = useLocalStorage("warehouse-id", "1");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const router = useRouter();
  const [showFormCategory, setShowFormCategory] = useState(false);
  // Query functiono
  const category = useGetCategory({});
  const queryClient = useQueryClient();
  const productMutation = useMutation({
    mutationFn: async (values: Product) =>
      await editProduct(values, session.data?.user?.name as string),
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
    product_id: z.string().optional(),
    image: z.string(),
    name: z.string().min(6).max(100),
    description: z.string().min(10).max(1000),
    // sell_price: z.number(),
    // buy_price: z.number(),
    // tier_price: z.string().optional(),
    inputby: z.string(),
    category_id: z.number(),
    // unit: z.string().optional(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      inputby: session.data?.user?.name || "",
      image: product.data ? product.data.image : "/products/product-1.jpg",
      // buy_price: product.data?.buy_price || 0,
      // sell_price: product.data?.sell_price || 0,
      // tier_price: product.data?.tier_price || "",
      category_id: product.data?.category_id ?? 0,
      name: product.data?.name ?? "",
      description: product.data?.description ?? "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log("exec");
    if (file) {
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
      } catch (error) {
        console.error("Error uploading file:", error);
        alert("Error uploading file");
      }
    }
    values.product_id = product.data?.product_id;
    values.inputby = session.data?.user?.name as string;
    // values.tier_price = JSON.stringify(tierPrice);
    productMutation.mutate(values as Product);
  }

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
          {product.isLoading ? (
            "Loading..."
          ) : product.error ? (
            "Error"
          ) : product.data ? (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
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
                          defaultValue={product.data?.name}
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
                            defaultValue={product.data?.category_id || 0}
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
                        <Textarea
                          placeholder="Description"
                          defaultValue={product.data?.description}
                          {...field}
                        />
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
          ) : (
            "No Data"
          )}
        </div>
      </div>
    </div>
  );
};

const Page = ({ params }: { params: { ids: string } }) => {
  const product = useQuery({
    queryKey: ["product", params.ids],
    queryFn: async () => await getProductById(params.ids),
    refetchOnWindowFocus: false,
  });
  if (product.data) {
    return <ProductForm product={product} />;
  } else {
    <h2>Loading...</h2>;
  }
};
export default Page;
