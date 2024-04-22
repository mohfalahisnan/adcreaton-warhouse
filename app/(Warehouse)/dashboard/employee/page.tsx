"use client";
import { useGetEmployee } from "@/hook/useEmployee";
import React, { useState } from "react";
import TableEmployee from "./TableEmployee";
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
import EmployeeForm from "@/components/EmployeeForm";

const Page = () => {
  const { data, isLoading } = useGetEmployee({});
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
              title="Add Employee"
              description=""
              triggerContent={
                <Button
                  variant={"secondary"}
                  size={"sm"}
                  className="flex items-center gap-2"
                >
                  <Plus size={12} /> Employee
                </Button>
              }
              open={open}
              onOpenChange={setOpen}
            >
              <div className="max-h-[70vh] overflow-auto">
                <EmployeeForm onSuccess={() => setOpen(false)} />
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
          <TableEmployee data={data || []} />
        </Card>
      </Condition>
    </div>
  );
};

export default Page;
