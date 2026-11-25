import "server-only";
import {Pool} from "pg";

const globalForPostgres=globalThis as typeof globalThis & {scholarMatchPool?:Pool};

export function getPool():Pool{
  if(globalForPostgres.scholarMatchPool)return globalForPostgres.scholarMatchPool;

  const connectionString=process.env.DATABASE_URL;
  if(!connectionString){
    throw new Error("PostgreSQL is not configured. Set DATABASE_URL in .env.local.");
  }

  const pool=new Pool({connectionString,max:10});
  globalForPostgres.scholarMatchPool=pool;
  return pool;
}
