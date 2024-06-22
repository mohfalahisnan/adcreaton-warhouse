"use client";

import React, { useState } from "react";
import { useGetCategory } from "@/hook/useCategory";

type Props = {};

const Page = (props: Props) => {
  const [open, setOpen] = useState(false);
  const category = useGetCategory({});

  if (!category.data) return null;
  return (
    <>
      <div className="flex w-full h-screen items-center justify-center">
        <div className="w-full h-full bg-white rounded-lg">
          <div className="flex items-center justify-center">
            <h1 className="text-2xl font-bold">You dont have access</h1>
          </div>
        </div>
      </div>
      {/* <h2 className="font-bold text-xl">Apps and Integration</h2>
      <h3>Improve your management and products.</h3>
      <div className="flex gap-2 mt-4">
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Cog size={18} className="mr-2" />
              Change Logo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Change Logo</DialogTitle>
              <DialogDescription>
                <LogoSetting />
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>

        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Cog size={18} className="mr-2" />
              Change web Title
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Change Web Title</DialogTitle>
              <DialogDescription>
                <WebTitleForm />
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>

        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Cog size={18} className="mr-2" />
              Description
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Change Description</DialogTitle>
              <DialogDescription>
                <WebDescForm />
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>

        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Cog size={18} className="mr-2" />
              Category
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Categories</DialogTitle>
              <DialogDescription className="text-foreground">
                <TableCategory data={category.data} />
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>

        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Cog size={18} className="mr-2" />
              Users
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogDescription className="text-foreground">
                <UserSetting />
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </div> */}
    </>
  );
};

export default Page;
