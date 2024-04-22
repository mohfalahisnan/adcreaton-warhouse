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

const Page = () => {
  const { data, isLoading } = useGetEmployee({});
  return (
    <div>
      <Condition show={isLoading}>
        <Loading />
      </Condition>
      <Condition show={!isLoading}>
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
