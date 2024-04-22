import { ResponsiveDialog } from "@/components/ResponsiveDialog";
import { Button } from "@/components/ui/button";
import React from "react";

type Props = {};

const Page = (props: Props) => {
  return (
    <div>
      <ResponsiveDialog
        title="User Profile"
        description="You can update your profile information here."
        actionButtons={<Button>Closess</Button>}
        triggerContent={<div className="p-2 rounded bg-yellow-500">hallo</div>}
      >
        <h4>Hallo Worlds</h4>
      </ResponsiveDialog>
    </div>
  );
};

export default Page;
