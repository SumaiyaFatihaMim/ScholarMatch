import {NextResponse} from "next/server";
import type {QueryResultRow} from "pg";
import {getAuthenticatedUser} from "@/lib/auth";
import {getPool} from "@/lib/db";
import type {Profile,Store} from "@/lib/data";

export const runtime="nodejs";

interface ExportRow extends QueryResultRow{
  id:string;
  name:string;
  email:string;
  is_admin:boolean;
  created_at:Date|string;
  data_json:Store|string|null;
}

function decodeWorkspace(value:Store|string|null):Store|null{
  if(!value)return null;
  return typeof value==="string"?JSON.parse(value) as Store:value;
}

function csvCell(value:unknown):string{
  let text=value instanceof Date?value.toISOString():value==null?"":String(value);
  if(/^[\t\r\n ]*[=+\-@]/.test(text))text=`'${text}`;
  return `"${text.replaceAll('"','""')}"`;
}

function makeCsv(headers:string[],rows:unknown[][]):string{
  return `\uFEFF${[headers,...rows].map(row=>row.map(csvCell).join(",")).join("\r\n")}\r\n`;
}

export async function GET(request:Request){
  const user=await getAuthenticatedUser();
  if(!user?.isAdmin)return NextResponse.json({error:"Administrator access is required."},{status:403});
  const type=new URL(request.url).searchParams.get("type");
  if(type!=="personal"&&type!=="academic")return NextResponse.json({error:"Choose a personal or academic export."},{status:400});
  try{
    const {rows}=await getPool().query<ExportRow>(
      `SELECT u.id,u.name,u.email,u.is_admin,u.created_at,w.data_json
       FROM users u LEFT JOIN user_workspaces w ON w.user_id=u.id
       ORDER BY u.created_at DESC,u.id DESC`,
    );
    const users=rows.map(row=>({row,profile:decodeWorkspace(row.data_json)?.profile as Profile|undefined}));
    const content=type==="personal"
      ?makeCsv(
        ["User ID","Account name","Account email","Profile name","Profile email","Role","Joined"],
        users.map(({row,profile})=>[row.id,row.name,row.email,profile?.name,profile?.email,Boolean(row.is_admin)?"Administrator":"User",row.created_at]),
      )
      :makeCsv(
        ["User ID","University","Graduation year","Degree","Field","GPA","GPA scale","IELTS","Skills","Research interests","Projects","Target countries","Funding required","Research statement"],
        users.map(({row,profile})=>[row.id,profile?.university,profile?.graduationYear,profile?.degree,profile?.field,profile?.gpa,profile?.gpaScale,profile?.ielts,profile?.skills,profile?.interests,profile?.projects,profile?.targetCountries,profile?.fundingRequired===undefined?"":profile.fundingRequired?"Yes":"No",profile?.statement]),
      );
    return new Response(content,{
      headers:{
        "Content-Type":"text/csv; charset=utf-8",
        "Content-Disposition":`attachment; filename="scholarmatch-${type}-users.csv"`,
        "Cache-Control":"no-store",
      },
    });
  }catch(error){
    console.error("Could not export admin user data",error);
    return NextResponse.json({error:"Could not export user data. Try again."},{status:503});
  }
}
