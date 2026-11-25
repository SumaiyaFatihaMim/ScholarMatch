import {randomBytes,scrypt} from "node:crypto";
import pg from "pg";

const {Pool}=pg;
const {DATABASE_URL}=process.env;

if(!DATABASE_URL){
  console.error("Set DATABASE_URL in .env.local first.");
  process.exit(1);
}

const email="demo@scholarmatch.local";
const name="Demo Student";
const password=randomBytes(24).toString("base64url");
const salt=randomBytes(16);
const key=await new Promise((resolve,reject)=>{
  scrypt(password,salt,64,(error,derivedKey)=>{
    if(error)reject(error);
    else resolve(derivedKey);
  });
});
const passwordHash=`scrypt$${salt.toString("base64url")}$${key.toString("base64url")}`;
const pool=new Pool({connectionString:DATABASE_URL,max:1});

try{
  await pool.query(
    "INSERT INTO users (name,email,password_hash) VALUES ($1,$2,$3)",
    [name,email,passwordHash],
  );
  console.log("Local demo account created. Use these credentials to sign in:");
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);
  console.log("Save this password now; it cannot be retrieved later.");
  console.log("For local development only. Do not run this against a production database.");
}catch(error){
  if(error&&typeof error==="object"&&"code" in error&&error.code==="23505"){
    console.error(`The demo account ${email} already exists. Sign up with another email or remove the existing demo row before recreating it.`);
  }else{
    console.error("Could not create the demo account. Confirm PostgreSQL is running and database/schema.sql has been applied.");
  }
  process.exitCode=1;
}finally{
  await pool.end();
}
