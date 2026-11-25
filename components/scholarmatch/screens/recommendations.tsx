"use client";
import {useState} from "react";
import Link from "next/link";
import {
  ArrowDownRight, ArrowRight, ArrowUpRight, Bell, BookOpen, BriefcaseBusiness, Check, CheckCheck,
  CheckCircle2, ChevronDown, ChevronRight, CircleHelp, ClipboardCheck, Clock3, Compass,
  Copy, Download, ExternalLink, FileText, Filter, GraduationCap, LayoutDashboard, Mail,
  Menu, MessageSquareText, Plus, RefreshCw, Search, Send, Settings2, ShieldCheck, Sparkles,
  Target, TrendingUp, UploadCloud, WandSparkles, X, Zap,
} from "lucide-react";
import type {Profile} from "@/lib/data";
import {buildDraft} from "@/lib/matching";
import {Ring,ScoreBar,Empty,first,asList,safeURL,fmt,stages} from "../ui";
import {useScholarMatch} from "../provider";

export default function ProfessorsScreen(){
  const [addingProfessor,setAddingProfessor]=useState(false);
  const [professorName,setProfessorName]=useState("");
  const [institution,setInstitution]=useState("");
  const [professorCountry,setProfessorCountry]=useState("");
  const [topics,setTopics]=useState("");
  const [paper,setPaper]=useState("");
  const [url,setUrl]=useState("");
  const {store,setStore,view,notify,navigate,p,strength,ranked,liveProfessors,setLiveProfessors,
  strong,actions,professors,addTracked,addRecipient,addCustomProfessor,copy,profileFields,
  exportData,reset,setProfile,file,setFile,cvText,setCvText,extracting,
  doBasicExtract,doAIExtract,shownOpp,oppQuery,setOppQuery,country,setCountry,
  countries,fundedOnly,setFundedOnly,activeOpportunity,setActiveOpportunity,
  profSearch,setProfSearch,researchLoading,researchError,onSearch}=useScholarMatch();
  return <>

          <div className="page-heading"><div><div className="eyebrow">FIND YOUR RESEARCH FIT</div><h1>Discover your future mentor</h1><p>Explore suggested researchers, search OpenAlex, or add a professor to your personal list.</p></div><div className="header-actions"><button className="btn btn-light" onClick={()=>setAddingProfessor(value=>!value)}><Plus size={16}/> Add a professor</button><button className="btn btn-light" onClick={()=>{setLiveProfessors([]);notify("Showing sample researchers")}}><RefreshCw size={16}/> Sample view</button></div></div>
          <div className="research-search"><div className="research-search-icon"><Search size={22}/></div><div className="research-search-content"><label htmlFor="researchQuery">Search live publication authors by research topic</label><div className="search-entry"><input id="researchQuery" value={profSearch} placeholder="e.g. multilingual NLP, computer vision, bioinformatics" onKeyDown={e=>{if(e.key==="Enter")void onSearch()}} onChange={e=>setProfSearch(e.target.value)}/><button className="btn btn-primary" disabled={researchLoading} onClick={onSearch}>{researchLoading?<RefreshCw size={16} className="spin"/>:<Search size={16}/>} {researchLoading?"Searching...":"Search OpenAlex"}</button></div><small>Research authorship is evidence of publications, not of open supervision positions or scholarships.</small></div></div>
          {researchError&&<div className="error-banner">{researchError}</div>}
          {addingProfessor&&<section className="panel" style={{marginBottom:20}}><div className="section-head"><div><h2>Add a professor</h2><p>This entry is private to your account. Verify details with the professor&apos;s official university page.</p></div></div><form onSubmit={event=>{event.preventDefault();const added=addCustomProfessor({name:professorName.trim(),institution:institution.trim(),country:professorCountry.trim()||"Unknown",topics:topics.split(",").map(topic=>topic.trim()).filter(Boolean),paper:paper.trim()||"Added manually by student",url:url.trim()});if(added){setProfessorName("");setInstitution("");setProfessorCountry("");setTopics("");setPaper("");setUrl("");setAddingProfessor(false);}}}><div className="form-grid"><label className="field"><span>Professor name *</span><input className="form-control" required maxLength={200} value={professorName} onChange={event=>setProfessorName(event.target.value)}/></label><label className="field"><span>University / institution *</span><input className="form-control" required maxLength={200} value={institution} onChange={event=>setInstitution(event.target.value)}/></label><label className="field"><span>Country</span><input className="form-control" maxLength={100} value={professorCountry} onChange={event=>setProfessorCountry(event.target.value)}/></label><label className="field"><span>Research topics * (comma-separated)</span><input className="form-control" required maxLength={1000} value={topics} onChange={event=>setTopics(event.target.value)}/></label><label className="field"><span>Research paper or reference</span><input className="form-control" maxLength={1000} value={paper} onChange={event=>setPaper(event.target.value)}/></label><label className="field"><span>Official profile URL (optional)</span><input className="form-control" type="url" maxLength={1000} value={url} onChange={event=>setUrl(event.target.value)}/></label></div><div className="inline-actions"><button className="btn btn-primary" type="submit"><Plus size={16}/> Save professor</button><button className="btn btn-light" type="button" onClick={()=>setAddingProfessor(false)}>Cancel</button></div></form></section>}
          <div className="section-label-row"><div><h2>{liveProfessors.length?"Researchers found via OpenAlex":"Suggested researcher examples"}</h2><p>{liveProfessors.length?"Live research metadata · supervision availability unknown":"Fictional profiles · use live search for real authors"}</p></div><span className="count-pill">{ranked.length} profiles</span></div>
          <div className="prof-grid">{ranked.map((pr,i)=><article className="prof-card" key={pr.id}><div className="prof-card-top"><div className={`face big face-${i%4}`}>{first(pr.name)}</div><div className="prof-fit"><span>TOPIC FIT*</span><strong>{pr.score}<small>/100</small></strong></div></div><h3>{pr.name}</h3><p className="prof-org">{pr.institution} <span>·</span> {pr.country}</p><div className="topic-tags">{pr.topics.slice(0,3).map(t=><span className="chip" key={t}>{t}</span>)}</div><div className="paper-info"><BookOpen size={15}/><span>{pr.paper}</span></div><div className="availability"><span className="status-dot"/> Accepting students: <strong>Unknown</strong></div><div className="prof-actions"><button className="btn btn-small btn-primary" onClick={()=>{addRecipient(pr);navigate("outreach")}}><Mail size={15}/> Draft email</button><button className="btn btn-small btn-light" onClick={()=>{navigate("tracker");addTracked("professor",pr.id,pr.name,pr.institution)}}><Plus size={15}/> Save</button></div><Link className="source-link" href={`/professors/${encodeURIComponent(pr.id)}`}>View professor details <ArrowRight size={13}/></Link>{pr.url&&<a className="source-link" href={safeURL(pr.url)} target="_blank" rel="noreferrer">OpenAlex profile <ExternalLink size={13}/></a>}</article>)}</div><div className="fineprint foot-space">* Topic fit uses keyword overlap in this prototype, not embeddings or verified program requirements. No source proves a professor is accepting students. Real OpenAlex records should be cross-checked with university pages.</div>
  </>;
}
