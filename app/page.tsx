import React from "react";
import LoginPage from "./LoginPage";
import { auth } from "./auth";
import { redirect } from "next/navigation";

const Home = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) => {
  const session = await auth();
  console.log(session);
  if (session && session.user) {
    return redirect("/dashboard");
  }

  return (
    <div>
      <LoginPage searchParams={searchParams} />
    </div>
  );
};

export default Home;
