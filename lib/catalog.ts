import "server-only";
import {opportunities,sampleProfessors,type Opportunity,type Professor} from "@/lib/data";
import {getPool} from "@/lib/db";
import type {PoolClient,QueryResultRow} from "pg";

type Catalog={opportunities:Opportunity[];professors:Professor[]};
interface CatalogRow extends QueryResultRow{catalog_key:string;data_json:Catalog["opportunities"]|Catalog["professors"]|string}

function decode<T>(value:T|string):T{
  return typeof value==="string"?JSON.parse(value) as T:value;
}

export async function getPlatformCatalog():Promise<Catalog>{
  const pool=getPool();
  await pool.query(
    `INSERT INTO platform_catalog (catalog_key,data_json) VALUES ($1,$2),($3,$4)
     ON CONFLICT (catalog_key) DO NOTHING`,
    ["opportunities",JSON.stringify(opportunities),"professors",JSON.stringify(sampleProfessors)],
  );
  const {rows}=await pool.query<CatalogRow>(
    "SELECT catalog_key,data_json FROM platform_catalog WHERE catalog_key IN ($1,$2)",
    ["opportunities","professors"],
  );
  const catalog:Catalog={opportunities:[],professors:[]};
  for(const row of rows){
    if(row.catalog_key==="opportunities")catalog.opportunities=decode(row.data_json) as Opportunity[];
    if(row.catalog_key==="professors")catalog.professors=decode(row.data_json) as Professor[];
  }
  if(!Array.isArray(catalog.opportunities)||!Array.isArray(catalog.professors)){
    throw new Error("The platform catalog contains invalid data.");
  }
  return catalog;
}

export async function savePlatformCatalog(catalog:Catalog):Promise<void>{
  const connection:PoolClient=await getPool().connect();
  try{
    await connection.query("BEGIN");
    for(const key of ["opportunities","professors"] as const){
      await connection.query(
        `INSERT INTO platform_catalog (catalog_key,data_json) VALUES ($1,$2)
         ON CONFLICT (catalog_key) DO UPDATE SET data_json=EXCLUDED.data_json,updated_at=CURRENT_TIMESTAMP`,
        [key,JSON.stringify(catalog[key])],
      );
    }
    await connection.query("COMMIT");
  }catch(error){
    await connection.query("ROLLBACK");
    throw error;
  }finally{
    connection.release();
  }
}
