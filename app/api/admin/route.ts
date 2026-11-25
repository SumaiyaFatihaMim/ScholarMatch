import {NextResponse} from "next/server";
import type {PoolClient,QueryResultRow} from "pg";
import {getAuthenticatedUser} from "@/lib/auth";
import {getPool} from "@/lib/db";
import type {Profile,Store} from "@/lib/data";
import {isValidProfile} from "@/lib/workspace-validation";

export const runtime="nodejs";

interface AdminUserRow extends QueryResultRow{
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

async function adminOnly(){
  const user=await getAuthenticatedUser();
  return user?.isAdmin?user:null;
}

export async function GET(request:Request){
  const admin=await adminOnly();
  if(!admin)return NextResponse.json({error:"Administrator access is required."},{status:403});
  try{
    const url=new URL(request.url);
    const requestedId=url.searchParams.get("userId");
    if(requestedId){
      if(!/^\d+$/.test(requestedId))return NextResponse.json({error:"Invalid account ID."},{status:400});
      const {rows}=await getPool().query<AdminUserRow>(
        `SELECT u.id,u.name,u.email,u.is_admin,u.created_at,w.data_json
         FROM users u LEFT JOIN user_workspaces w ON w.user_id=u.id
         WHERE u.id=$1 LIMIT 1`,
        [requestedId],
      );
      const row=rows[0];
      if(!row)return NextResponse.json({error:"Account not found."},{status:404});
      return NextResponse.json({user:{
        id:row.id,name:row.name,email:row.email,isAdmin:Boolean(row.is_admin),
        createdAt:row.created_at,workspace:decodeWorkspace(row.data_json),
      }});
    }

    const {rows}=await getPool().query<AdminUserRow>(
      `SELECT u.id,u.name,u.email,u.is_admin,u.created_at,w.data_json
       FROM users u LEFT JOIN user_workspaces w ON w.user_id=u.id
       ORDER BY u.created_at DESC,u.id DESC`,
    );
    const users=rows.map(row=>{
      const workspace=decodeWorkspace(row.data_json);
      return {
        id:row.id,name:row.name,email:row.email,isAdmin:Boolean(row.is_admin),
        createdAt:row.created_at,trackedCount:workspace?.tracked.length||0,
        outreachCount:workspace?.recipients.length||0,hasProjects:Boolean(workspace?.profile.projects.trim()),hasProfile:Boolean(workspace?.profile),
      };
    });
    return NextResponse.json({users});
  }catch(error){
    console.error("Could not load admin accounts",error);
    return NextResponse.json({error:"Could not load accounts. Try again."},{status:503});
  }
}

export async function PATCH(request:Request){
  const admin=await adminOnly();
  if(!admin)return NextResponse.json({error:"Administrator access is required."},{status:403});
  let body:unknown;
  try{body=await request.json();}catch{return NextResponse.json({error:"Request must be valid JSON."},{status:400});}
  if(!body||typeof body!=="object"||Array.isArray(body))return NextResponse.json({error:"Invalid account update."},{status:400});
  const {userId,isAdmin,name,email,projects,profile}=body as {userId?:unknown;isAdmin?:unknown;name?:unknown;email?:unknown;projects?:unknown;profile?:unknown};
  if(typeof userId!=="string"||!/^\d+$/.test(userId))return NextResponse.json({error:"Invalid account ID."},{status:400});
  const roleUpdate=typeof isAdmin==="boolean";
  const accountUpdate=name!==undefined||email!==undefined;
  const projectsUpdate=projects!==undefined;
  const profileUpdate=profile!==undefined;
  if(!roleUpdate&&!accountUpdate&&!projectsUpdate&&!profileUpdate)return NextResponse.json({error:"No account changes were provided."},{status:400});
  if(accountUpdate&&(typeof name!=="string"||typeof email!=="string"||name.trim().length<2||name.trim().length>100||email.trim().length>254||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))){
    return NextResponse.json({error:"Enter a valid name and email address."},{status:400});
  }
  if(projectsUpdate&&(typeof projects!=="string"||projects.length>10000)){
    return NextResponse.json({error:"Project information must be no more than 10,000 characters."},{status:400});
  }
  if(profileUpdate&&!isValidProfile(profile)){
    return NextResponse.json({error:"The personal or academic profile contains invalid information."},{status:400});
  }
  const connection:PoolClient=await getPool().connect();
  try{
    await connection.query("BEGIN");
    const {rows:targetRows}=await connection.query<AdminUserRow>(
      "SELECT id,is_admin FROM users WHERE id=$1 FOR UPDATE",
      [userId],
    );
    const target=targetRows[0];
    if(!target){await connection.query("ROLLBACK");return NextResponse.json({error:"Account not found."},{status:404});}
    if(roleUpdate&&userId===admin.id&&!isAdmin){
        await connection.query("ROLLBACK");
        return NextResponse.json({error:"Use another administrator account to remove your admin access."},{status:409});
    }
    if(roleUpdate&&!isAdmin&&target.is_admin){
      const {rows:admins}=await connection.query<QueryResultRow>(
        "SELECT id FROM users WHERE is_admin=TRUE FOR UPDATE",
      );
      if(admins.length<=1){
        await connection.query("ROLLBACK");
        return NextResponse.json({error:"The last administrator cannot be demoted."},{status:409});
      }
    }
    if(roleUpdate)await connection.query("UPDATE users SET is_admin=$1 WHERE id=$2",[isAdmin,userId]);
    if(accountUpdate)await connection.query(
      "UPDATE users SET name=$1,email=$2 WHERE id=$3",
      [(name as string).trim(),(email as string).trim().toLowerCase(),userId],
    );
    if(accountUpdate||projectsUpdate||profileUpdate){
      const {rows:workspaceRows}=await connection.query<AdminUserRow>(
        "SELECT data_json FROM user_workspaces WHERE user_id=$1 FOR UPDATE",
        [userId],
      );
      let workspace=workspaceRows[0]?decodeWorkspace(workspaceRows[0].data_json):null;
      if(projectsUpdate&&!workspace&&!profileUpdate){
        await connection.query("ROLLBACK");
        return NextResponse.json({error:"This account has not synced a workspace yet."},{status:409});
      }
      if(profileUpdate&&!workspace){
        workspace={profile:{name:"",email:"",university:"",graduationYear:"",degree:"Master's",field:"",gpa:0,gpaScale:4,ielts:0,skills:"",interests:"",projects:"",targetCountries:"",fundingRequired:false,statement:""},tracked:[],recipients:[]};
      }
      if(workspace){
        if(profileUpdate){
          workspace.profile=profile as Profile;
          await connection.query("UPDATE users SET name=$1,email=$2 WHERE id=$3",[workspace.profile.name.trim(),workspace.profile.email.trim().toLowerCase(),userId]);
        }else if(accountUpdate){
          workspace.profile.name=(name as string).trim();
          workspace.profile.email=(email as string).trim().toLowerCase();
        }
        if(projectsUpdate)workspace.profile.projects=projects as string;
        await connection.query(
          `INSERT INTO user_workspaces (user_id,data_json) VALUES ($1,$2)
           ON CONFLICT (user_id) DO UPDATE SET data_json=EXCLUDED.data_json,updated_at=CURRENT_TIMESTAMP`,
          [userId,JSON.stringify(workspace)],
        );
      }
    }
    await connection.query("COMMIT");
    return NextResponse.json({saved:true});
  }catch(error){
    await connection.query("ROLLBACK");
    if(error&&typeof error==="object"&&"code" in error&&error.code==="23505"){
      return NextResponse.json({error:"That email address is already in use."},{status:409});
    }
    console.error("Could not update admin-managed account",error);
    return NextResponse.json({error:"Could not update this account. Try again."},{status:503});
  }finally{connection.release();}
}

export async function DELETE(request:Request){
  const admin=await adminOnly();
  if(!admin)return NextResponse.json({error:"Administrator access is required."},{status:403});
  let body:unknown;
  try{body=await request.json();}catch{return NextResponse.json({error:"Request must be valid JSON."},{status:400});}
  if(!body||typeof body!=="object"||Array.isArray(body)||typeof (body as {userId?:unknown}).userId!=="string"){
    return NextResponse.json({error:"Invalid account request."},{status:400});
  }
  const userId=(body as {userId:string}).userId;
  if(!/^\d+$/.test(userId))return NextResponse.json({error:"Invalid account ID."},{status:400});
  if(userId===admin.id)return NextResponse.json({error:"You cannot delete the account you are currently using."},{status:409});
  const connection:PoolClient=await getPool().connect();
  try{
    await connection.query("BEGIN");
    const {rows:targetRows}=await connection.query<AdminUserRow>(
      "SELECT id,is_admin FROM users WHERE id=$1 FOR UPDATE",
      [userId],
    );
    const target=targetRows[0];
    if(!target){await connection.query("ROLLBACK");return NextResponse.json({error:"Account not found."},{status:404});}
    if(target.is_admin){
      const {rows:admins}=await connection.query<QueryResultRow>(
        "SELECT id FROM users WHERE is_admin=TRUE FOR UPDATE",
      );
      if(admins.length<=1){
        await connection.query("ROLLBACK");
        return NextResponse.json({error:"The last administrator cannot be deleted."},{status:409});
      }
    }
    await connection.query("DELETE FROM users WHERE id=$1",[userId]);
    await connection.query("COMMIT");
    return NextResponse.json({deleted:true});
  }catch(error){
    await connection.query("ROLLBACK");
    console.error("Could not delete account",error);
    return NextResponse.json({error:"Could not delete this account. Try again."},{status:503});
  }finally{connection.release();}
}
