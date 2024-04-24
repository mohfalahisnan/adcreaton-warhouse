import React from "react";
import { Button } from "./button";
import { signOut } from "@/app/auth";
import Link from "next/link";

const LogoutButton = () => {
  return (
    <div className="flex gap-2">
      <Button asChild>
        <Link href={"/dashboard"}>Dashboard</Link>
      </Button>
      <form
        action={async () => {
          "use server";
          await signOut();
        }}
      >
        <Button type="submit">Logout</Button>
      </form>
    </div>
  );
};

export default LogoutButton;
