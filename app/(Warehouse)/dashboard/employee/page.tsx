"use client";
import { useGetEmployee } from "@/hook/useEmployee";
import React from "react";
import TableEmployee from "./TableEmployee";
import Loading from "@/components/Loading";
import { Card } from "@/components/ui/card";

type Props = {};

const Page = (props: Props) => {
  const { data, isLoading } = useGetEmployee({});
  return (
    <div>
      {isLoading ? (
        <Loading />
      ) : (
        <>
          {data && (
            <Card>
              <TableEmployee data={data} />
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default Page;
