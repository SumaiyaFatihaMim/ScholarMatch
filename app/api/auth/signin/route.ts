import {authenticateUser} from "@/lib/auth";
import {authErrorResponse,authSuccessResponse,readAuthRequest} from "@/lib/auth-http";

export const runtime="nodejs";

export async function POST(request:Request){
  let body:unknown;
  try{
    body=await readAuthRequest(request);
  }catch{
    return authErrorResponse(request,"/sign-in","invalid","Enter valid sign-in details.",400);
  }

  if(!body||typeof body!=="object")return authErrorResponse(request,"/sign-in","invalid","Enter valid sign-in details.",400);
  const data=body as Record<string,unknown>;
  const email=typeof data.email==="string"?data.email.trim().toLowerCase():"";
  const password=typeof data.password==="string"?data.password:"";
  if(email.length>254||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||password.length<1||password.length>128){
    return authErrorResponse(request,"/sign-in","invalid","Email or password is incorrect.",401);
  }

  try{
    const result=await authenticateUser(email,password);
    if(!result)return authErrorResponse(request,"/sign-in","invalid","Email or password is incorrect.",401);
    return authSuccessResponse(request,result.user,result.token,result.user.isAdmin?"/admin":"/dashboard");
  }catch(error){
    console.error("Account sign-in failed",error);
    return authErrorResponse(request,"/sign-in","service","Could not sign in. Check the PostgreSQL configuration and try again.",503);
  }
}
