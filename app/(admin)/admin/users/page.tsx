import {redirect} from "next/navigation";
import AdminPanel from "@/components/admin/admin-panel";
import {getAuthenticatedUser} from "@/lib/auth";

export default async function Page(){
  const user=await getAuthenticatedUser();
  if(!user?.isAdmin)redirect("/dashboard");
  return <AdminPanel currentUserId={user.id} section="users"/>;
}
