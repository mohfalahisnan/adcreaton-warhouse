import Image from "next/image";
import React, { useState } from "react";
import { Button } from "./ui/button";
import { useMutation } from "@tanstack/react-query";
import { saveSetting } from "@/lib/actions/setting";
import { Setting } from "@prisma/client";
import { queryClient } from "./provider";
import { useRouter } from "next/navigation";
import { toast } from "./ui/use-toast";
import { useSetting } from "@/hook/useSetting";

type Props = {};

const LogoForm = (props: Props) => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { data } = useSetting({});
  const router = useRouter();
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files[0]) {
      setFile(files[0]);
      setPreviewUrl(URL.createObjectURL(files[0]));
    }
  };

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

  async function onSubmit() {
    console.log("exec");
    if (!file) {
      alert("Please select a file first!");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    let imgUrl;
    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (response.ok) {
        imgUrl = result.image;
        console.log("file uploaded!");
      } else {
        alert(`Failed to upload file: ${result.message}`);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Error uploading file");
    }
    if (!data) return null;
    saveQuery.mutate({
      web_logo: imgUrl,
      setting_id: data.setting_id,
      web_title: data.web_title,
      web_description: data.web_description,
      other: data.other,
    });
  }

  return (
    <div>
      {previewUrl && (
        <Image
          src={previewUrl}
          alt="Preview"
          width={200}
          height={200}
          className="mb-4 bg-black/10"
        />
      )}
      <div className="flex justify-between">
        <input
          type="file"
          id="file-upload"
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
        <label
          htmlFor="file-upload"
          className="cursor-pointer inline-block bg-primary text-white px-4 py-2.5 rounded shadow hover:opacity-70"
        >
          Upload Logo
        </label>
        {previewUrl && <Button onClick={onSubmit}>Save</Button>}
      </div>
    </div>
  );
};

export default LogoForm;
