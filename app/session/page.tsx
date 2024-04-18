"use client";
import React from "react";
import { useSession } from "next-auth/react";
import { useGetUserByEmail } from "@/hook/useUser";

type Props = {};

const Page = (props: Props) => {
  const { data, status } = useSession();
  const userEmail = data?.user?.email;
  const user = useGetUserByEmail({
    email: userEmail as string,
    queryConfig: {
      enabled: !!userEmail,
    },
  });

  return (
    <div>
      {status === "loading" ? "Loading..." : JSON.stringify(data?.user)}
      <br />
      <pre>{JSON.stringify(user.data?.data?.user_id)}</pre>
    </div>
  );
};

export default Page;
