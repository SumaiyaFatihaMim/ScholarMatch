import AuthForm from "@/components/auth/auth-form";
import {redirect} from "next/navigation";

export default async function SignUpPage({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}){
  const params=await searchParams;
  if(params.password!==undefined||params.confirmPassword!==undefined)redirect("/sign-up");
  const code=Array.isArray(params.error)?params.error[0]:params.error;
  const initialError=code==="name"?"Name must be between 2 and 100 characters.":code==="email"?"Enter a valid email address.":code==="password"?"Password must be between 8 and 128 characters.":code==="mismatch"?"Passwords do not match.":code==="exists"?"An account with this email already exists. Sign in instead.":code==="service"?"Could not create your account. Check the PostgreSQL configuration and try again.":"";
  return <AuthForm mode="signup" initialError={initialError}/>;
}
