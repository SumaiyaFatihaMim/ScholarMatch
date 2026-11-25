import {NextResponse} from "next/server";
import type {Opportunity,Professor} from "@/lib/data";
import {getAuthenticatedUser} from "@/lib/auth";
import {getPlatformCatalog,savePlatformCatalog} from "@/lib/catalog";

export const runtime="nodejs";
const isRecord=(value:unknown):value is Record<string,unknown>=>Boolean(value)&&typeof value==="object"&&!Array.isArray(value);
const isStringList=(value:unknown):value is string[]=>Array.isArray(value)&&value.length<=50&&value.every(item=>typeof item==="string"&&item.length<=200);

function validOpportunity(value:unknown):value is Opportunity{
  if(!isRecord(value))return false;
  return typeof value.id==="string"&&value.id.length<=120&&typeof value.title==="string"&&value.title.length<=200
    &&typeof value.organization==="string"&&value.organization.length<=200&&typeof value.country==="string"&&value.country.length<=100
    &&typeof value.type==="string"&&value.type.length<=100&&typeof value.area==="string"&&value.area.length<=200
    &&(value.gpaMin===null||typeof value.gpaMin==="number")&&(value.ieltsMin===null||typeof value.ieltsMin==="number")
    &&isStringList(value.skills)&&typeof value.funded==="boolean"&&typeof value.description==="string"&&value.description.length<=5000;
}

function validProfessor(value:unknown):value is Professor{
  if(!isRecord(value))return false;
  return typeof value.id==="string"&&value.id.length<=500&&typeof value.name==="string"&&value.name.length<=200
    &&typeof value.institution==="string"&&value.institution.length<=200&&typeof value.country==="string"&&value.country.length<=100
    &&isStringList(value.topics)&&typeof value.paper==="string"&&value.paper.length<=1000&&typeof value.url==="string"&&value.url.length<=1000
    &&(value.source==="sample"||value.source==="openalex")&&value.accepting==="Unknown";
}

export async function GET(){
  const user=await getAuthenticatedUser();
  if(!user?.isAdmin)return NextResponse.json({error:"Administrator access is required."},{status:403});
  try{return NextResponse.json(await getPlatformCatalog());}
  catch(error){
    console.error("Could not load admin catalog",error);
    return NextResponse.json({error:"Could not load the catalog. Try again."},{status:503});
  }
}

export async function PUT(request:Request){
  const user=await getAuthenticatedUser();
  if(!user?.isAdmin)return NextResponse.json({error:"Administrator access is required."},{status:403});
  let body:unknown;
  try{body=await request.json();}catch{return NextResponse.json({error:"Catalog data must be valid JSON."},{status:400});}
  if(!isRecord(body)||!Array.isArray(body.opportunities)||!Array.isArray(body.professors)
    ||body.opportunities.length>500||body.professors.length>500
    ||!body.opportunities.every(validOpportunity)||!body.professors.every(validProfessor)){
    return NextResponse.json({error:"The catalog has invalid or incomplete entries."},{status:400});
  }
  const opportunityIds=(body.opportunities as Opportunity[]).map(item=>item.id);
  const professorIds=(body.professors as Professor[]).map(item=>item.id);
  if(new Set(opportunityIds).size!==opportunityIds.length||new Set(professorIds).size!==professorIds.length){
    return NextResponse.json({error:"Catalog IDs must be unique."},{status:400});
  }
  try{
    await savePlatformCatalog({opportunities:body.opportunities as Opportunity[],professors:body.professors as Professor[]});
    return NextResponse.json({saved:true});
  }catch(error){
    console.error("Could not save admin catalog",error);
    return NextResponse.json({error:"Could not save the catalog. Try again."},{status:503});
  }
}
