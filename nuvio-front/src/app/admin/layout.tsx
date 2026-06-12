import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin - Nuvio",
  icons: {
    icon: "/admin/icon.ico",
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}