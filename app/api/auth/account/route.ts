import {authActionSuccessResponse,authErrorResponse,readAuthRequest} from "@/lib/auth-http";
import {getAuthenticatedUser,updateAccountDetails} from "@/lib/auth";

export const runtime="nodejs";

export async function POST(request:Request){
  let body:unknown;
  try{
    body=await readAuthRequest(request);
  }catch{
    return authErrorResponse(request,"/profile","invalid","Enter valid account details.",400);
  }

  if(!body||typeof body!=="object")return authErrorResponse(request,"/profile","invalid","Enter valid account details.",400);
  const data=body as Record<string,unknown>;
  const name=typeof data.name==="string"?data.name.trim():"";
  const email=typeof data.email==="string"?data.email.trim().toLowerCase():"";
  const currentPassword=typeof data.currentPassword==="string"?data.currentPassword:"";
  if(name.length<2||name.length>100)return authErrorResponse(request,"/profile","name","Name must be between 2 and 100 characters.",400);
  if(email.length>254||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return authErrorResponse(request,"/profile","email","Enter a valid email address.",400);
  if(currentPassword.length<1||currentPassword.length>128)return authErrorResponse(request,"/profile","current-password","Enter your current password to save account changes.",400);

  try{
    const user=await getAuthenticatedUser();
    if(!user)return authErrorResponse(request,"/profile","session","Your session expired. Sign in again.",401);
    const updated=await updateAccountDetails(user.id,name,email,currentPassword);
    if(!updated)return authErrorResponse(request,"/profile","current-password","Current password is incorrect.",401);
    return authActionSuccessResponse(request,"/profile",{user:updated});
  }catch(error){
    if(error&&typeof error==="object"&&"code" in error&&error.code==="23505"){
      return authErrorResponse(request,"/profile","exists","That email is already in use.",409);
    }
    console.error("Account profile update failed",error);
    return authErrorResponse(request,"/profile","service","Could not update your account. Try again.",503);
  }
}
