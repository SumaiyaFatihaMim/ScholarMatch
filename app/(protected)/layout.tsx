import type {ReactNode} from "react";
import {ScholarMatchProvider} from "@/components/scholarmatch/provider";
import DashboardShell from "@/components/scholarmatch/dashboard-shell";
import {getAuthenticatedUser} from "@/lib/auth";
import {redirect} from "next/navigation";
export default async function DashboardLayout({children}:{children:ReactNode}){
 const user=await getAuthenticatedUser();
 if(!user)redirect("/sign-in");
 if(user.isAdmin)redirect("/admin");
 return <ScholarMatchProvider userId={user.id} userName={user.name} userEmail={user.email} isAdmin={user.isAdmin}><DashboardShell userName={user.name} isAdmin={user.isAdmin}>{children}</DashboardShell></ScholarMatchProvider>;
}
