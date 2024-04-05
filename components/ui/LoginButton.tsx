"use client";
import { signIn } from "@/app/auth";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormEvent, useState } from "react";
import LoginForm from "../section/login-form";

type LoginInput = {
  username: string;
  password: string;
};

export function LoginButton() {
  const handleSubmit = async (event: FormEvent) => {
    const [inputs, setInputs] = useState<LoginInput>({
      username: "",
      password: "",
    });

    event.preventDefault();
    await signIn("credentials", {
      username: inputs.username,
      password: inputs.password,
      callbackUrl: "/",
    });
  };
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Login</Button>
      </DialogTrigger>
      <DialogContent className="w-auto">
        <LoginForm />
      </DialogContent>
    </Dialog>
  );
}
