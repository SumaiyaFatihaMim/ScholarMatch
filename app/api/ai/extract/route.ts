import { NextRequest, NextResponse } from "next/server";
import mammoth from "mammoth";
import {getAuthenticatedUser} from "@/lib/auth";

export const runtime="nodejs";

export async function POST(request: NextRequest) {
  const user=await getAuthenticatedUser();
  if(!user)return NextResponse.json({error:"Please sign in again."},{status:401});
  if(!process.env.ANTHROPIC_API_KEY) return NextResponse.json({error:"AI extraction is not configured. Add ANTHROPIC_API_KEY to .env.local; the manual editor works without it."},{status:503});
  let data:FormData;
  try {data=await request.formData();}catch {return NextResponse.json({error:"Invalid upload."},{status:400});}
  const raw=data.get("file");
  if(!(raw instanceof File))return NextResponse.json({error:"Choose a PDF, DOCX or TXT file first."},{status:400});
  if(raw.size>5*1024*1024)return NextResponse.json({error:"The demo accepts files up to 5 MB."},{status:413});
  const lower=raw.name.toLowerCase();
  if(!(/\.(pdf|docx|txt|md)$/.test(lower)))return NextResponse.json({error:"Supported types: PDF, DOCX, TXT or MD."},{status:415});
  const instructions=`Extract ONLY facts explicitly present in the CV. Never fabricate an institution, qualification, grade, score, publication, or skill. Reply with a JSON object (no markdown) using keys: name (string), email (string), degree ("Master's" or "PhD" only if explicitly indicated as degree SOUGHT, otherwise omit), field (string), gpa (number), gpaScale (number), ielts (number), skills (comma-separated string), interests (string), projects (string), statement (string). Leave absent keys out. If GPA scale is unclear, omit gpaScale. Do not infer test results.`;
  try {
    let content:unknown[]=[];
    if(lower.endsWith(".pdf")){
      const bytes=Buffer.from(await raw.arrayBuffer());
      content=[{type:"document",source:{type:"base64",media_type:"application/pdf",data:bytes.toString("base64")}}, {type:"text",text:instructions}];
    } else {
      const text=lower.endsWith(".docx")?(await mammoth.extractRawText({buffer:Buffer.from(await raw.arrayBuffer())})).value:await raw.text();
      content=[{type:"text",text:`${instructions}\n\nCV text:\n${text.slice(0,45000)}`}];
    }
    const response=await fetch("https://api.anthropic.com/v1/messages",{
      method:"POST",
      headers:{"content-type":"application/json","x-api-key":process.env.ANTHROPIC_API_KEY,"anthropic-version":"2023-06-01"},
      body:JSON.stringify({model:process.env.ANTHROPIC_MODEL||"claude-sonnet-4-5",max_tokens:1400,messages:[{role:"user",content}]}),
      signal:AbortSignal.timeout(30000)
    });
    const json=await response.json() as {content?:Array<{type:string;text?:string}>;error?:{message:string}};
    if(!response.ok)return NextResponse.json({error:json.error?.message||`AI provider returned ${response.status}`},{status:502});
    const text=(json.content||[]).filter(x=>x.type==="text").map(x=>x.text||"").join("\n");
    const match=text.match(/\{[\s\S]*\}/);
    if(!match)throw new Error("AI did not return structured JSON.");
    const obj=JSON.parse(match[0]) as Record<string,unknown>;
    const fields=["name","email","degree","field","gpa","gpaScale","ielts","skills","interests","projects","statement"];
    const cleaned:Record<string,unknown>={};
    for(const field of fields){
      const v=obj[field];
      if(field==="gpa"||field==="gpaScale"||field==="ielts"){
        if(typeof v==="number"&&Number.isFinite(v)&&v>=0)cleaned[field]=v;
      } else if(typeof v==="string"&&v.length<6000)cleaned[field]=v;
    }
    return NextResponse.json({profile:cleaned,note:"Review every extracted field before relying on it. Uploaded files are not saved by this demo."});
  } catch(e) {
    return NextResponse.json({error:e instanceof Error?e.message:"Could not extract profile"},{status:502});
  }
}
