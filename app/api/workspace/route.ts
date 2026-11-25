import {NextResponse} from "next/server";
import type {Store} from "@/lib/data";
import {getAuthenticatedUser} from "@/lib/auth";
import {getPlatformCatalog} from "@/lib/catalog";
import {getPool} from "@/lib/db";
import {isValidWorkspace} from "@/lib/workspace-validation";
import type {QueryResultRow} from "pg";

export const runtime="nodejs";

interface WorkspaceRow extends QueryResultRow{data_json:Store|string}

export async function GET(){
  const user=await getAuthenticatedUser();
  if(!user)return NextResponse.json({error:"Please sign in again."},{status:401});
  try{
    const {rows}=await getPool().query<WorkspaceRow>(
      "SELECT data_json FROM user_workspaces WHERE user_id=$1 LIMIT 1",
      [user.id],
    );
    const workspace=rows[0]?typeof rows[0].data_json==="string"?JSON.parse(rows[0].data_json) as Store:rows[0].data_json:null;
    if(workspace&&!isValidWorkspace(workspace))throw new Error("The saved workspace does not match the current profile format.");
    const catalog=await getPlatformCatalog();
    return NextResponse.json({workspace,...catalog});
  }catch(error){
    console.error("Could not load user workspace",error);
    return NextResponse.json({error:"Could not load your workspace. Try again."},{status:503});
  }
}

export async function PUT(request:Request){
  const user=await getAuthenticatedUser();
  if(!user)return NextResponse.json({error:"Please sign in again."},{status:401});
  const contentLength=Number(request.headers.get("content-length")||0);
  if(contentLength>1_000_000)return NextResponse.json({error:"Workspace data is too large."},{status:413});
  let body:unknown;
  try{
    const text=await request.text();
    if(text.length>1_000_000)return NextResponse.json({error:"Workspace data is too large."},{status:413});
    body=JSON.parse(text);
  }catch{return NextResponse.json({error:"Workspace data must be valid JSON."},{status:400});}
  if(!body||typeof body!=="object"||Array.isArray(body)){
    return NextResponse.json({error:"Workspace data is incomplete or invalid."},{status:400});
  }
  const workspace=(body as Record<string,unknown>).workspace;
  if(!isValidWorkspace(workspace)){
    return NextResponse.json({error:"Workspace data is incomplete or invalid."},{status:400});
  }
  try{
    await getPool().query(
      `INSERT INTO user_workspaces (user_id,data_json) VALUES ($1,$2)
       ON CONFLICT (user_id) DO UPDATE SET data_json=EXCLUDED.data_json,updated_at=CURRENT_TIMESTAMP`,
      [user.id,JSON.stringify(workspace)],
    );
    return NextResponse.json({saved:true});
  }catch(error){
    console.error("Could not save user workspace",error);
    return NextResponse.json({error:"Could not save your workspace. Try again."},{status:503});
  }
}
