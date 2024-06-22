import {
  BarChart,
  Box,
  DollarSign,
  FileBarChart,
  FileMinus2,
  FilePlus2,
  HomeIcon,
  Settings,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

type Props = {};

type Menu = {
  title: string;
  url: string;
  icon: JSX.Element;
};

const menu: Menu[] = [
  {
    title: "Home",
    url: "/dashboard",
    icon: <HomeIcon />,
  },
  {
    title: "Products",
    url: "/dashboard/products",
    icon: <Box />,
  },
  {
    title: "Stock",
    url: "/dashboard/stock",
    icon: <BarChart />,
  },
  {
    title: "Inbound",
    url: "/dashboard/inbound",
    icon: <FilePlus2 />,
  },
  {
    title: "Outbound",
    url: "/dashboard/outbound",
    icon: <FileMinus2 />,
  },
  {
    title: "Employee",
    url: "/dashboard/employee",
    icon: <Users />,
  },
  {
    title: "Transaction",
    url: "/dashboard/transaction",
    icon: <DollarSign />,
  },
  // {
  //   title: "Cars",
  //   url: "/dashboard/cars",
  //   icon: <Car />,
  // },
  // {
  //   title: "Shipping",
  //   url: "/dashboard/shipping",
  //   icon: <Truck />,
  // },
  {
    title: "Customer",
    url: "/dashboard/customer",
    icon: <Users />,
  },
  {
    title: "Report",
    url: "/dashboard/report",
    icon: <FileBarChart />,
  },
  {
    title: "Settings",
    url: "/dashboard/settings",
    icon: <Settings />,
  },
];

const SidebarNavigation = (props: Props) => {
  const path = usePathname();
  return (
    <nav className="[&_svg]:w-4 px-4">
      <ul className="flex flex-col gap-2 text-sm">
        {menu.map((item, i) => {
          return (
            <Link href={item.url} title={item.title} key={i}>
              <li
                className={`flex gap-2 items-center py-1.5 px-2.5 rounded hover:bg-white/10 ${
                  path === item.url && "bg-white/25"
                }`}
              >
                {item.icon} {item.title}
              </li>
            </Link>
          );
        })}
      </ul>
    </nav>
  );
};

export default SidebarNavigation;
