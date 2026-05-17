import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { AdminLayoutClient } from "@/components/ui/AdminLayoutClient";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser();

  const adminId = process.env.ADMIN_USER_ID;
  const isAuthorized = user && (user.id === adminId || user.username === adminId);

  if (!isAuthorized) {
    redirect("/");
  }

  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
