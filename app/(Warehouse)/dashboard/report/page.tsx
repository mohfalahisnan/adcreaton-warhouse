import React from "react";

type Props = {};

const Page = (props: Props) => {
  return (
    <div className="flex w-full h-screen items-center justify-center">
      <div className="w-full h-full bg-white rounded-lg">
        <div className="flex items-center justify-center">
          <h1 className="text-2xl font-bold">You dont have access</h1>
        </div>
      </div>
    </div>
  );
};

export default Page;
