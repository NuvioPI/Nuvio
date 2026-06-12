import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nuvio | Admin",
  description: "Área restrita do Nuvio.",
  icons: {
    icon: "./icon.ico",
  },
};

import { DM_Sans } from "next/font/google";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-dm-sans",
});

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}