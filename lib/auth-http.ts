import "server-only";
import {NextResponse} from "next/server";
import type {AuthUser} from "@/lib/auth";
import {SESSION_COOKIE,SESSION_TTL_SECONDS} from "@/lib/auth";

function isFormRequest(request:Request):boolean{
  return request.headers.get("content-type")?.includes("application/x-www-form-urlencoded")===true;
}

function redirectTo(path:string):NextResponse{
  return new NextResponse(null,{status:303,headers:{Location:path}});
}

export async function readAuthRequest(request:Request):Promise<unknown>{
  const contentType=request.headers.get("content-type")||"";
  if(contentType.includes("application/json"))return request.json();
  if(isFormRequest(request))return Object.fromEntries((await request.formData()).entries());
  throw new Error("Unsupported sign-in request format.");
}

export function authSuccessResponse(
  request:Request,
  user:AuthUser,
  token:string,
  destination="/dashboard",
):NextResponse{
  const response=isFormRequest(request)
    ?redirectTo(destination)
    :NextResponse.json({user});
  response.cookies.set(SESSION_COOKIE,token,{
    httpOnly:true,
    secure:process.env.NODE_ENV==="production",
    sameSite:"lax",
    path:"/",
    maxAge:SESSION_TTL_SECONDS,
  });
  return response;
}

export function authActionSuccessResponse(request:Request,destination:string,data:unknown):NextResponse{
  return isFormRequest(request)?redirectTo(destination):NextResponse.json(data);
}

export function authErrorResponse(
  request:Request,
  destination:string,
  code:string,
  message:string,
  status:number,
):NextResponse{
  if(isFormRequest(request)){
    const url=new URL(destination,request.url);
    url.searchParams.set("error",code);
    return redirectTo(`${url.pathname}${url.search}`);
  }
  return NextResponse.json({error:message},{status});
}
