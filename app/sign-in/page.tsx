import AuthForm from "@/components/auth/auth-form";
import {redirect} from "next/navigation";

export default async function SignInPage({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}){
  const params=await searchParams;
  if(params.password!==undefined)redirect("/sign-in");
  const code=Array.isArray(params.error)?params.error[0]:params.error;
  const initialError=code==="invalid"?"Email or password is incorrect.":code==="service"?"Could not sign in. Check the PostgreSQL configuration and try again.":"";
  return <AuthForm mode="signin" initialError={initialError}/>;
}
