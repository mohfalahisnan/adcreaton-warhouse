"use client";
import { useGetEmployee } from "@/hook/useEmployee";
import React from "react";
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
import Link from "next/link";
import { Plus } from "lucide-react";

const Page = () => {
  const { data, isLoading } = useGetEmployee({});
  return (
    <div>
      <Condition show={isLoading}>
        <Loading />
      </Condition>
      <Condition show={!isLoading}>
        <div className="flex justify-end items-center mb-4">
          <div className="flex gap-2">
            <Button
              variant={"secondary"}
              asChild
              size={"sm"}
              className="flex items-center gap-2"
            >
              <Link href={"/dashboard/employee/add"}>
                <Plus size={12} /> Employee
              </Link>
            </Button>
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
