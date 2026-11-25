"use client";
import Link from "next/link";
import {ArrowLeft,BookOpen,Mail,Plus,ShieldCheck,ExternalLink} from "lucide-react";
import {useScholarMatch} from "../provider";
import {safeURL} from "../ui";
export default function ProfessorDetail({id}:{id:string}){
 const {professors,p,addRecipient,addTracked,store,liveProfessors}=useScholarMatch();
 const prof=professors.find(pr=>pr.id===id);
 if(!prof)return <div className="panel detail-hero"><h1>Professor not found</h1><p>Live research results are available after searching OpenAlex. You may need to repeat your search.</p><Link className="btn btn-light" href="/professors">Search professors</Link></div>;
 const saved=store.tracked.some(t=>t.kind==="professor"&&t.id===prof.id);
 const selected=store.recipients.some(x=>x.professor.id===prof.id);
 return <>
  <Link href="/professors" className="detail-back"><ArrowLeft size={17}/> All professors</Link>
  <div className="page-heading"><div><div className="eyebrow">{prof.source==="sample"?"ILLUSTRATIVE RESEARCHER":prof.source==="user"?"ADDED TO YOUR PERSONAL LIST":"OPENALEX PUBLICATION AUTHOR"}</div><h1>{prof.name}</h1><p>{prof.institution} · {prof.country}</p></div></div>
  <div className="notice"><ShieldCheck size={18}/><span>Research metadata is not evidence of available supervision, admission eligibility, or funding. Confirm information on the university website.</span></div>
  <div className="detail-layout"><section className="panel detail-hero"><h2>Research topics</h2><div className="topic-tags">{prof.topics.map(t=><span className="chip" key={t}>{t}</span>)}</div><h2 style={{marginTop:28}}>Representative research</h2><p className="detail-meta"><BookOpen size={16}/> {prof.paper}</p><p className="detail-meta">Accepting students: <strong>Unknown</strong></p><div className="detail-actions"><button className="btn btn-primary" disabled={selected} onClick={()=>addRecipient(prof)}><Mail size={16}/>{selected?"Already in outreach":"Create outreach draft"}</button><button className="btn btn-light" disabled={saved} onClick={()=>addTracked("professor",prof.id,prof.name,prof.institution)}><Plus size={16}/>{saved?"Already tracked":"Save to tracker"}</button></div>{prof.url&&<a href={safeURL(prof.url)} rel="noreferrer" target="_blank" className="source-link">Research source <ExternalLink size={15}/></a>}</section>
   <aside className="panel detail-hero"><h2>Before contacting</h2><ul className="detail-list"><li>Verify the current university and research group</li><li>Read the paper or research profile first</li><li>Confirm whether supervision opportunities exist</li><li>Write a fact-based email using your verified profile</li></ul><p className="fineprint">{liveProfessors.length?"Search results are cached in this browser session.":"Showing fictional researcher data until you run an OpenAlex search."}</p><Link className="btn btn-light" href="/outreach">View outreach drafts</Link></aside>
  </div>
 </>;
}
