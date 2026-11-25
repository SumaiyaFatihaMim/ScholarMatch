import {randomBytes,scrypt} from "node:crypto";
import pg from "pg";

const {Pool}=pg;
const {DATABASE_URL}=process.env;

if(!DATABASE_URL){
  console.error("Set DATABASE_URL in .env.local first.");
  process.exit(1);
}

const accounts=[
  {name:"Demo Student",email:"student@scholarmatch.local",isAdmin:false,password:randomBytes(24).toString("base64url")},
  {name:"Demo Administrator",email:"admin@scholarmatch.local",isAdmin:true,password:randomBytes(24).toString("base64url")},
];

async function hashPassword(password){
  const salt=randomBytes(16);
  const key=await new Promise((resolve,reject)=>{
    scrypt(password,salt,64,(error,derivedKey)=>{
      if(error)reject(error);
      else resolve(derivedKey);
    });
  });
  return `scrypt$${salt.toString("base64url")}$${key.toString("base64url")}`;
}

const pool=new Pool({connectionString:DATABASE_URL,max:1});
const client=await pool.connect();

try{
  await client.query("BEGIN");
  const emails=accounts.map(account=>account.email);
  const {rows:existing}=await client.query(
    "SELECT email FROM users WHERE LOWER(email)=ANY($1::text[])",
    [emails],
  );
  if(existing.length){
    throw new Error(`Demo account already exists: ${existing.map(row=>row.email).join(", ")}. No accounts were changed.`);
  }
  for(const account of accounts){
    await client.query(
      "INSERT INTO users (name,email,password_hash,is_admin) VALUES ($1,$2,$3,$4)",
      [account.name,account.email,await hashPassword(account.password),account.isAdmin],
    );
  }
  await client.query("COMMIT");
  console.log("Created local demo accounts. Save these randomly generated passwords now:");
  for(const account of accounts){
    console.log(`${account.isAdmin?"Admin":"Student"}: ${account.email} / ${account.password}`);
  }
  console.log("Development only. Do not use these accounts in production.");
}catch(error){
  await client.query("ROLLBACK");
  if(error instanceof Error&&error.message.startsWith("Demo account already exists:")){
    console.error(error.message);
  }else if(error&&typeof error==="object"&&"code" in error&&error.code==="23505"){
    console.error("A demo account already exists. No duplicate account was created.");
  }else{
    console.error("Could not create demo accounts. Confirm PostgreSQL is running and database/schema.sql has been applied.");
  }
  process.exitCode=1;
}finally{
  client.release();
  await pool.end();
}
