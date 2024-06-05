"use client";
import React from "react";
import { Button } from "./ui/button";
import { useMutation } from "@tanstack/react-query";
import { createUser } from "@/lib/actions/accounts";

type Props = {};

const CreateUser = (props: Props) => {
  const user = useMutation({
    mutationKey: ["user"],
    mutationFn: createUser,
  });
  const handleClick = () => {
    user.mutate({
      name: "admin",
      inputby: "admin",
      username: "admin",
      email: "admin@example.com",
      password: "admin",
    });
  };
  return (
    <div>
      <Button onClick={handleClick}>Create User</Button>
    </div>
  );
};

export default CreateUser;
