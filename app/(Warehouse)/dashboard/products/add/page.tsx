import React from "react";
import ProductForm from "./_components/form";

type Props = {};

const page = (props: Props) => {
  return (
    <div>
      <div className="p-4 border bg-card rounded-lg">
        <ProductForm />
      </div>
    </div>
  );
};

export default page;
