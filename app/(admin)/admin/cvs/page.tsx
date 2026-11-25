import {redirect} from "next/navigation";
import CvProfiles from "@/components/admin/cv-profiles";
import {getAuthenticatedUser} from "@/lib/auth";

export default async function Page(){
  const user=await getAuthenticatedUser();
  if(!user?.isAdmin)redirect("/dashboard");
  return <CvProfiles/>;
}
