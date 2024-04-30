import TransactionForm from "@/components/TransactionForm";
import { Card } from "@/components/ui/card";
import React from "react";

type Props = {};

const page = (props: Props) => {
  return (
    <div className="fixed top-0 left-0 p-4 bg-black/25 w-full h-screen">
      <Card className="w-full h-full p-4">
        <TransactionForm />
      </Card>
    </div>
  );
};

export default page;
