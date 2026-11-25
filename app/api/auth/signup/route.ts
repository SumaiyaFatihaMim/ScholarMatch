import {registerUser} from "@/lib/auth";
import {authErrorResponse,authSuccessResponse,readAuthRequest} from "@/lib/auth-http";

export const runtime="nodejs";

export async function POST(request:Request){
  let body:unknown;
  try{
    body=await readAuthRequest(request);
  }catch{
    return authErrorResponse(request,"/sign-up","invalid","Enter valid account details.",400);
  }

  if(!body||typeof body!=="object")return authErrorResponse(request,"/sign-up","invalid","Enter valid account details.",400);
  const data=body as Record<string,unknown>;
  const name=typeof data.name==="string"?data.name.trim():"";
  const email=typeof data.email==="string"?data.email.trim().toLowerCase():"";
  const password=typeof data.password==="string"?data.password:"";
  if(name.length<2||name.length>100)return authErrorResponse(request,"/sign-up","name","Name must be between 2 and 100 characters.",400);
  if(email.length>254||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return authErrorResponse(request,"/sign-up","email","Enter a valid email address.",400);
  if(password.length<8||password.length>128)return authErrorResponse(request,"/sign-up","password","Password must be between 8 and 128 characters.",400);
  if(typeof data.confirmPassword==="string"&&password!==data.confirmPassword)return authErrorResponse(request,"/sign-up","mismatch","Passwords do not match.",400);

  try{
    const {user,token}=await registerUser(name,email,password);
    return authSuccessResponse(request,user,token);
  }catch(error){
    if(error&&typeof error==="object"&&"code" in error&&error.code==="23505"){
      return authErrorResponse(request,"/sign-up","exists","An account with this email already exists. Sign in instead.",409);
    }
    console.error("Account registration failed",error);
    return authErrorResponse(request,"/sign-up","service","Could not create your account. Check the PostgreSQL configuration and try again.",503);
  }
}
