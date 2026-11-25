import "server-only";
import {createHash,randomBytes,scrypt,timingSafeEqual} from "node:crypto";
import {cookies} from "next/headers";
import type {PoolClient,QueryResultRow} from "pg";
import {getPool} from "@/lib/db";

export const SESSION_COOKIE="scholarmatch_session";
export const SESSION_TTL_SECONDS=60*60*24*7;
const PASSWORD_KEY_LENGTH=64;

interface UserRow extends QueryResultRow{
  id:string;
  name:string;
  email:string;
  password_hash:string;
  is_admin:boolean|number;
}

interface PasswordRow extends QueryResultRow{
  password_hash:string;
  is_admin:boolean|number;
}

export interface AuthUser{
  id:string;
  name:string;
  email:string;
  isAdmin:boolean;
}

function deriveKey(password:string,salt:Buffer):Promise<Buffer>{
  return new Promise((resolve,reject)=>{
    scrypt(password,salt,PASSWORD_KEY_LENGTH,(error,key)=>{
      if(error)reject(error);
      else resolve(key);
    });
  });
}

export async function hashPassword(password:string):Promise<string>{
  const salt=randomBytes(16);
  const key=await deriveKey(password,salt);
  return `scrypt$${salt.toString("base64url")}$${key.toString("base64url")}`;
}

export async function verifyPassword(password:string,encoded:string):Promise<boolean>{
  const [algorithm,saltValue,keyValue]=encoded.split("$");
  if(algorithm!=="scrypt"||!saltValue||!keyValue)return false;
  const salt=Buffer.from(saltValue,"base64url");
  const expected=Buffer.from(keyValue,"base64url");
  if(expected.length!==PASSWORD_KEY_LENGTH)return false;
  const actual=await deriveKey(password,salt);
  return timingSafeEqual(actual,expected);
}

function tokenHash(token:string):string{
  return createHash("sha256").update(token).digest("hex");
}

export async function issueSession(userId:string):Promise<string>{
  const token=randomBytes(32).toString("base64url");
  const expiresAt=new Date(Date.now()+SESSION_TTL_SECONDS*1000);
  await getPool().query(
    "INSERT INTO auth_sessions (token_hash,user_id,expires_at) VALUES ($1,$2,$3)",
    [tokenHash(token),userId,expiresAt],
  );
  return token;
}

export async function registerUser(name:string,email:string,password:string):Promise<{user:AuthUser;token:string}>{
  const connection:PoolClient=await getPool().connect();
  try{
    await connection.query("BEGIN");
    const passwordHash=await hashPassword(password);
    const {rows}=await connection.query<UserRow>(
      "INSERT INTO users (name,email,password_hash) VALUES ($1,$2,$3) RETURNING id",
      [name,email,passwordHash],
    );
    const user={id:rows[0].id,name,email,isAdmin:false};
    const token=randomBytes(32).toString("base64url");
    const expiresAt=new Date(Date.now()+SESSION_TTL_SECONDS*1000);
    await connection.query(
      "INSERT INTO auth_sessions (token_hash,user_id,expires_at) VALUES ($1,$2,$3)",
      [tokenHash(token),user.id,expiresAt],
    );
    await connection.query("COMMIT");
    return {user,token};
  }catch(error){
    await connection.query("ROLLBACK");
    throw error;
  }finally{
    connection.release();
  }
}

export async function authenticateUser(email:string,password:string):Promise<{user:AuthUser;token:string}|null>{
  const {rows}=await getPool().query<UserRow>(
    "SELECT id,name,email,password_hash,is_admin FROM users WHERE LOWER(email)=LOWER($1) LIMIT 1",
    [email],
  );
  const user=rows[0];
  if(!user||!(await verifyPassword(password,user.password_hash)))return null;
  return {user:{id:user.id,name:user.name,email:user.email,isAdmin:Boolean(user.is_admin)},token:await issueSession(user.id)};
}

export async function updateAccountDetails(
  userId:string,
  name:string,
  email:string,
  currentPassword:string,
):Promise<AuthUser|null>{
  const {rows}=await getPool().query<PasswordRow>(
    "SELECT password_hash,is_admin FROM users WHERE id=$1 LIMIT 1",
    [userId],
  );
  const row=rows[0];
  if(!row||!(await verifyPassword(currentPassword,row.password_hash)))return null;
  await getPool().query("UPDATE users SET name=$1,email=$2 WHERE id=$3",[name,email,userId]);
  return {id:userId,name,email,isAdmin:Boolean(row.is_admin)};
}

export async function changePassword(
  userId:string,
  currentPassword:string,
  newPassword:string,
):Promise<string|null>{
  const connection:PoolClient=await getPool().connect();
  try{
    await connection.query("BEGIN");
    const {rows}=await connection.query<PasswordRow>(
      "SELECT password_hash FROM users WHERE id=$1 FOR UPDATE",
      [userId],
    );
    const row=rows[0];
    if(!row||!(await verifyPassword(currentPassword,row.password_hash))){
      await connection.query("ROLLBACK");
      return null;
    }

    const passwordHash=await hashPassword(newPassword);
    const token=randomBytes(32).toString("base64url");
    const expiresAt=new Date(Date.now()+SESSION_TTL_SECONDS*1000);
    await connection.query("UPDATE users SET password_hash=$1 WHERE id=$2",[passwordHash,userId]);
    await connection.query("DELETE FROM auth_sessions WHERE user_id=$1",[userId]);
    await connection.query(
      "INSERT INTO auth_sessions (token_hash,user_id,expires_at) VALUES ($1,$2,$3)",
      [tokenHash(token),userId,expiresAt],
    );
    await connection.query("COMMIT");
    return token;
  }catch(error){
    await connection.query("ROLLBACK");
    throw error;
  }finally{
    connection.release();
  }
}

export async function getAuthenticatedUser():Promise<AuthUser|null>{
  const token=(await cookies()).get(SESSION_COOKIE)?.value;
  if(!token)return null;
  const {rows}=await getPool().query<UserRow>(
    `SELECT u.id,u.name,u.email,u.is_admin
     FROM auth_sessions s JOIN users u ON u.id=s.user_id
     WHERE s.token_hash=$1 AND s.expires_at>CURRENT_TIMESTAMP
     LIMIT 1`,
    [tokenHash(token)],
  );
  const user=rows[0];
  return user?{id:user.id,name:user.name,email:user.email,isAdmin:Boolean(user.is_admin)}:null;
}

export async function revokeSession(token:string):Promise<void>{
  await getPool().query("DELETE FROM auth_sessions WHERE token_hash=$1",[tokenHash(token)]);
}
