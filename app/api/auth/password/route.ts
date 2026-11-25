import {authErrorResponse,authSuccessResponse,readAuthRequest} from "@/lib/auth-http";
import {changePassword,getAuthenticatedUser} from "@/lib/auth";

export const runtime="nodejs";

export async function POST(request:Request){
  let body:unknown;
  try{
    body=await readAuthRequest(request);
  }catch{
    return authErrorResponse(request,"/profile","invalid","Enter valid password details.",400);
  }

  if(!body||typeof body!=="object")return authErrorResponse(request,"/profile","invalid","Enter valid password details.",400);
  const data=body as Record<string,unknown>;
  const currentPassword=typeof data.currentPassword==="string"?data.currentPassword:"";
  const newPassword=typeof data.newPassword==="string"?data.newPassword:"";
  const confirmPassword=typeof data.confirmPassword==="string"?data.confirmPassword:"";
  if(currentPassword.length<1||currentPassword.length>128)return authErrorResponse(request,"/profile","current-password","Enter your current password.",400);
  if(newPassword.length<8||newPassword.length>128)return authErrorResponse(request,"/profile","password","New password must be between 8 and 128 characters.",400);
  if(newPassword!==confirmPassword)return authErrorResponse(request,"/profile","mismatch","New passwords do not match.",400);

  try{
    const user=await getAuthenticatedUser();
    if(!user)return authErrorResponse(request,"/profile","session","Your session expired. Sign in again.",401);
    const token=await changePassword(user.id,currentPassword,newPassword);
    if(!token)return authErrorResponse(request,"/profile","current-password","Current password is incorrect.",401);
    return authSuccessResponse(request,user,token,"/profile");
  }catch(error){
    console.error("Account password change failed",error);
    return authErrorResponse(request,"/profile","service","Could not change your password. Try again.",503);
  }
}
