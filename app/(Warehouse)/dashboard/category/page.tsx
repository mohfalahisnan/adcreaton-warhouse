"use client";
import React, { useState } from "react";
import TableCategory from "./TableCategory";
import Loading from "@/components/Loading";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Condition from "@/components/Condition";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ResponsiveDialog } from "@/components/ResponsiveDialog";
import { useGetCategory } from "@/hook/useCategory";
import CategoryForm from "@/components/CategoryForm";

const Page = () => {
  const { data, isLoading } = useGetCategory({});
  const [open, setOpen] = useState(false);
  return (
    <div>
      <Condition show={isLoading}>
        <Loading />
      </Condition>
      <Condition show={!isLoading}>
        <div className="flex justify-end items-center mb-4">
          <div className="flex gap-2">
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
              open={open}
              onOpenChange={setOpen}
            >
              <div className="max-h-[70vh] overflow-auto">
                <CategoryForm onSuccess={() => setOpen(false)} />
              </div>
            </ResponsiveDialog>
          </div>
        </div>
        <Card className="p-4">
          <CardHeader>
            <CardTitle>Employee</CardTitle>
            <CardDescription>
              Recent employee from your warehouse.
            </CardDescription>
          </CardHeader>
          <TableCategory data={data || []} />
        </Card>
      </Condition>
    </div>
  );
};

export default Page;
