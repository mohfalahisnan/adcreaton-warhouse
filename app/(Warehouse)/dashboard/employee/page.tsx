"use client";
import { useGetEmployee } from "@/hook/useEmployee";
import React from "react";
import TableEmployee from "./TableEmployee";
import Loading from "@/components/Loading";
import { Card } from "@/components/ui/card";
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
          <TableEmployee data={data || []} />
        </Card>
      </Condition>
    </div>
  );
};

export default Page;
