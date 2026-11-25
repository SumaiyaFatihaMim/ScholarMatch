"use client";
import Link from "next/link";
import {ArrowLeft,CheckCircle2,Plus,ShieldCheck} from "lucide-react";
import {scoreOpportunity} from "@/lib/matching";
import {ScoreBar} from "../ui";
import {useScholarMatch} from "../provider";

export default function OpportunityDetail({id}:{id:string}){
 const {p,addTracked,store,opportunities}=useScholarMatch();
 const item=opportunities.find(o=>o.id===id);
 if(!item)return <div className="panel"><h1>Opportunity not found</h1><Link href="/opportunities">Back to opportunities</Link></div>;
 const fit=scoreOpportunity(p,item);
 const saved=store.tracked.some(t=>t.kind==="opportunity"&&t.id===item.id);
 return <>
  <Link href="/opportunities" className="detail-back"><ArrowLeft size={17}/> All opportunities</Link>
  <div className="page-heading"><div><div className="eyebrow">SAMPLE OPPORTUNITY DETAIL</div><h1>{item.title}</h1><p>{item.organization} · {item.country}</p></div><span className="count-pill">{fit.eligibility}</span></div>
  <div className="notice"><ShieldCheck size={18}/><span>Fictional example only: the funding and admissions requirements here are not verified. Do not apply using this data.</span></div>
  <div className="detail-layout">
   <section className="panel detail-hero"><span className="detail-pill">{item.type} · {item.area}</span><h2>About this opportunity</h2><p className="detail-meta">{item.description}</p><h3>Example requirements</h3><ul className="detail-list"><li>GPA minimum: {item.gpaMin??"Not specified"}</li><li>IELTS minimum: {item.ieltsMin??"Not specified"}</li><li>Skills: {item.skills.join(", ")||"Not specified"}</li><li>Funding in sample scenario: {item.funded?"Yes":"No"}</li></ul><div className="detail-actions"><button className="btn btn-primary" disabled={saved} onClick={()=>addTracked("opportunity",item.id,item.title,item.organization)}><Plus size={16}/>{saved?"Already tracked":"Add to application tracker"}</button><Link className="btn btn-light" href="/profile">Improve profile</Link></div></section>
   <aside className="panel detail-hero"><h2>Your sample match</h2><div className="detail-score">{fit.score}<small> / 100</small></div><p className="detail-meta">Heuristic comparison, not an admission probability.</p><ScoreBar label="Academic" value={fit.academic} max={35}/><ScoreBar label="Research" value={fit.research} max={30}/><ScoreBar label="Skills" value={fit.skills} max={15}/><ScoreBar label="Experience" value={fit.experience} max={20}/><h3>Gaps to review</h3>{fit.gaps.length?<ul className="detail-list">{fit.gaps.map(g=><li key={g}>{g}</li>)}</ul>:<p className="detail-meta"><CheckCircle2 size={16}/> No gaps reported by these sample rules.</p>}</aside>
  </div>
 </>;
}
