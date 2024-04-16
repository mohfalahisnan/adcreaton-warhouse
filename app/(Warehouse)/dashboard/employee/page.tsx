"use client";
import { useGetEmployee } from "@/hook/useEmployee";
import React from "react";

type Props = {};

const Page = (props: Props) => {
  const { data, isLoading } = useGetEmployee({});
  return (
    <div>
      {isLoading ? (
        "Loading..."
      ) : (
        <>
          {data &&
            data.map((user, index) => (
              <h3 key={index}>
                {user.name} {user.email} {user.position}
              </h3>
            ))}
        </>
      )}
    </div>
  );
};

export default Page;
