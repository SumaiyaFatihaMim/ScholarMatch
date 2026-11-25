import type {ReactNode} from "react";
import {redirect} from "next/navigation";
import {ScholarMatchProvider} from "@/components/scholarmatch/provider";
import DashboardShell from "@/components/scholarmatch/dashboard-shell";
import {getAuthenticatedUser} from "@/lib/auth";

export default async function AdminLayout({children}:{children:ReactNode}){
  const user=await getAuthenticatedUser();
  if(!user)redirect("/sign-in");
  if(!user.isAdmin)redirect("/dashboard");
  return <ScholarMatchProvider userId={user.id} userName={user.name} userEmail={user.email} isAdmin><DashboardShell userName={user.name} isAdmin>{children}</DashboardShell></ScholarMatchProvider>;
}
