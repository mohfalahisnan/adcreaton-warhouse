import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import Provider from "@/components/provider";
import { getSetting } from "@/lib/actions/setting";

const inter = Inter({ subsets: ["latin"] });

export const metadata = async (): Promise<Metadata> => {
  const data = await getSetting();
  return {
    title: data?.web_title || "Dashboard",
    description: data?.web_description || "Description",
  };
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Provider>
      <html lang="en" suppressHydrationWarning>
        <body className={`${inter.className}`}>
          <Toaster />
          {children}
        </body>
      </html>
    </Provider>
  );
}
