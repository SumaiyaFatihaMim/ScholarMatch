import { NextRequest, NextResponse } from "next/server";
import {getAuthenticatedUser} from "@/lib/auth";

type OpenAlexWork = {
  id?: string; title?: string; publication_year?: number;
  authorships?: Array<{
    author?: { id?: string; display_name?: string };
    institutions?: Array<{ display_name?: string; country_code?: string }>;
  }>;
};
const isHttp = (s:string)=>/^https:\/\//.test(s);

export async function GET(request: NextRequest) {
  const user=await getAuthenticatedUser();
  if(!user)return NextResponse.json({error:"Please sign in again."},{status:401});
  const query = request.nextUrl.searchParams.get("q")?.trim().slice(0,100) || "";
  if(query.length < 3) return NextResponse.json({ error:"Please enter at least three characters." },{status:400});
  const params=new URLSearchParams({search:query,filter:"from_publication_date:2022-01-01",per_page:"30"});
  if(process.env.OPENALEX_API_KEY)params.set("api_key",process.env.OPENALEX_API_KEY);
  try{
    const res=await fetch(`https://api.openalex.org/works?${params}`,{next:{revalidate:3600},signal:AbortSignal.timeout(12000)});
    if(!res.ok)throw new Error(`OpenAlex returned ${res.status}. Try again later or add OPENALEX_API_KEY.`);
    const payload=await res.json() as { results?:OpenAlexWork[] };
    const map=new Map<string,{id:string;name:string;institution:string;country:string;topics:string[];paper:string;url:string;source:"openalex";accepting:"Unknown"}>();
    for(const work of payload.results||[]){
      const title=work.title||"Research publication";
      for(const author of (work.authorships||[]).slice(0,4)){
        const id=author.author?.id;
        const name=author.author?.display_name;
        if(!id||!name||!isHttp(id)||map.has(id))continue;
        const inst=author.institutions?.[0];
        map.set(id,{
          id,name,institution:inst?.display_name||"Institution not listed",country:inst?.country_code||"Unknown",
          topics:[query],paper:title,url:id,source:"openalex",accepting:"Unknown"
        });
        if(map.size>=18)break;
      }
      if(map.size>=18)break;
    }
    return NextResponse.json({professors:[...map.values()],fetchedAt:new Date().toISOString(),note:"OpenAlex verifies research authorship, not admission requirements or whether the professor is accepting students."});
  }catch(e){
    return NextResponse.json({error:e instanceof Error?e.message:"Research search is temporarily unavailable."},{status:502});
  }
}
