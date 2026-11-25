import {redirect} from "next/navigation";
import {getAuthenticatedUser} from "@/lib/auth";
import AdminPanel from "@/components/admin/admin-panel";

export default async function Page(){
  const user=await getAuthenticatedUser();
  if(!user?.isAdmin)redirect("/dashboard");
  return <AdminPanel currentUserId={user.id}/>;
}
