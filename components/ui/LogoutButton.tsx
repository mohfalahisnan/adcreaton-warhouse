import React from "react";
import { Button } from "./button";
import { signOut } from "@/app/auth";

const LogoutButton = () => {
  return (
    <form
      action={async () => {
        "use server";
        await signOut();
      }}
    >
      <Button type="submit">Logout</Button>
    </form>
  );
};

export default LogoutButton;
