"use client";
import { useSetting } from "@/hook/useSetting";
import React, { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Save } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { saveSetting } from "@/lib/actions/setting";
import { Setting } from "@prisma/client";
import { queryClient } from "./provider";
import { useRouter } from "next/navigation";
import { toast } from "./ui/use-toast";

const WebTitleForm = () => {
  const [title, setTitle] = useState<string>();
  const { data } = useSetting({});
  const router = useRouter();
  const saveQuery = useMutation({
    mutationFn: async (data: Setting) => await saveSetting(data),
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ["setting"] });
      router.push("/dashboard");
    },
    onError(error) {
      toast({
        title: `Error: ${error.message}`,
        description: `${error.message}`,
        variant: "destructive",
      });
    },
  });
  if (!data) return null;
  const handleSave = () => {
    saveQuery.mutate({
      setting_id: data.setting_id,
      web_title: title || data.web_title,
      web_description: data.web_description,
      web_logo: data.web_logo,
      other: data.other,
    });
  };

  return (
    <div className="flex-col justify-end items-end text-right">
      <Input
        type="text"
        defaultValue={data.web_title}
        onChange={(e) => setTitle(e.target.value)}
        className="mb-4"
        autoFocus={true}
      />
      <Button onClick={handleSave}>
        <Save size={16} className="mr-2" />
        Save
      </Button>
    </div>
  );
};

export default WebTitleForm;
