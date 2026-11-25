import {NextResponse} from "next/server";
import type {QueryResultRow} from "pg";
import {getAuthenticatedUser} from "@/lib/auth";
import {getPool} from "@/lib/db";
import type {Profile,Store} from "@/lib/data";

export const runtime="nodejs";

interface CvRow extends QueryResultRow{
  id:string;
  name:string;
  email:string;
  created_at:Date|string;
  data_json:Store|string|null;
}

function decodeWorkspace(value:Store|string|null):Store|null{
  if(!value)return null;
  return typeof value==="string"?JSON.parse(value) as Store:value;
}

export async function GET(){
  const admin=await getAuthenticatedUser();
  if(!admin?.isAdmin)return NextResponse.json({error:"Administrator access is required."},{status:403});
  try{
    const {rows}=await getPool().query<CvRow>(
      `SELECT u.id,u.name,u.email,u.created_at,w.data_json
       FROM users u LEFT JOIN user_workspaces w ON w.user_id=u.id
       ORDER BY u.created_at DESC,u.id DESC`,
    );
    const profiles=rows.map(row=>({
      id:row.id,
      accountName:row.name,
      accountEmail:row.email,
      createdAt:row.created_at,
      profile:decodeWorkspace(row.data_json)?.profile as Profile|undefined,
    }));
    return NextResponse.json({profiles},{headers:{"Cache-Control":"no-store"}});
  }catch(error){
    console.error("Could not load saved CV profiles",error);
    return NextResponse.json({error:"Could not load saved CV profiles. Try again."},{status:503});
  }
}
