import {NextResponse} from "next/server";
import {cookies} from "next/headers";
import {revokeSession,SESSION_COOKIE} from "@/lib/auth";

export const runtime="nodejs";

export async function POST(){
  const token=(await cookies()).get(SESSION_COOKIE)?.value;
  if(token){
    try{
      await revokeSession(decodeURIComponent(token));
    }catch(error){
      console.error("Account sign-out failed",error);
      return NextResponse.json({error:"Could not sign out. Please try again."},{status:503});
    }
  }
  const response=NextResponse.json({success:true});
  response.cookies.set(SESSION_COOKIE,"",{
    httpOnly:true,
    secure:process.env.NODE_ENV==="production",
    sameSite:"lax",
    path:"/",
    maxAge:0,
  });
  return response;
}
