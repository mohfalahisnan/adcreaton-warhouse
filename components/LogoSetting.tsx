"use client";
import { useSetting } from "@/hook/useSetting";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import React from "react";
import LogoForm from "./LogoForm";

type Props = {};

const LogoSetting = (props: Props) => {
  const { data, isLoading } = useSetting({});
  if (isLoading) return "Loading...";
  if (!data) return null;
  return (
    <div>
      Current Logo :{" "}
      <div className="bg-black/10 my-4">
        <Image
          src={data.web_logo}
          width={200}
          height={200}
          alt="logo"
          className="w-full h-full object-contain max-h-24"
        />
      </div>
      <LogoForm />
    </div>
  );
};

export default LogoSetting;
