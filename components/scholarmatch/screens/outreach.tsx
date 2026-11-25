"use client";
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

export default function OutreachScreen(){
  const {store,setStore,view,notify,navigate,p,strength,ranked,liveProfessors,
  strong,actions,professors,addTracked,addRecipient,copy,profileFields,
  exportData,reset,setProfile,file,setFile,cvText,setCvText,extracting,
  doBasicExtract,doAIExtract,shownOpp,oppQuery,setOppQuery,country,setCountry,
  countries,fundedOnly,setFundedOnly,activeOpportunity,setActiveOpportunity,
  profSearch,setProfSearch,researchLoading,researchError,onSearch}=useScholarMatch();
  return <>

          <div className="page-heading"><div><div className="eyebrow">PERSONALIZED OUTREACH</div><h1>Write with purpose</h1><p>Draft an individual, fact-based introduction for each researcher.</p></div><button className="btn btn-primary" onClick={()=>navigate("recommendations")}><Plus size={17}/> Add researchers</button></div>
          <div className="notice"><ShieldCheck size={18}/><span><strong>Draft-only workflow.</strong> These emails have not been sent. Gmail OAuth, verified recipient addresses, scheduled sending and reply sync are future integrations.</span></div>
          <div className="workflow"><div className="workflow-step done"><span>1</span>Select researchers</div><div className="workflow-line"/><div className={`workflow-step ${store.recipients.length?"done":""}`}><span>2</span>Review individual drafts</div><div className="workflow-line"/><div className="workflow-step muted"><span>3</span>Connect Gmail & send (future)</div></div>
          {store.recipients.length===0?<div className="panel"><Empty icon={MessageSquareText} title="Your outreach list is empty" detail="Open the Professors page, choose a researcher, and generate a respectful first-contact email." action={<button className="btn btn-primary" onClick={()=>navigate("recommendations")}>Explore professors <ArrowRight size={17}/></button>}/></div>:<div className="campaign-layout"><div className="stack">{store.recipients.map((rec,i)=>{const draft=buildDraft(p,rec.professor);return <article className="panel draft-panel" key={rec.id}><div className="draft-head"><div className="face face-1">{first(rec.professor.name)}</div><div><div className="tagline">DRAFT {String(i+1).padStart(2,"0")}</div><h3>{rec.professor.name}</h3><p>{rec.professor.institution}</p></div><button className="delete-button" title="Remove draft" onClick={()=>setStore(s=>({...s,recipients:s.recipients.filter(x=>x.id!==rec.id)}))}><X size={18}/></button></div><div className="draft-mail"><div className="mail-subject"><span>Subject</span><strong>{draft.subject}</strong></div><pre>{draft.body}</pre></div><div className="draft-actions"><label className="small-check"><input type="checkbox" checked={rec.approved} onChange={e=>setStore(s=>({...s,recipients:s.recipients.map(x=>x.id===rec.id?{...x,approved:e.target.checked}:x)}))}/> Reviewed & approved</label><button className="btn btn-small btn-light" onClick={()=>copy(`Subject: ${draft.subject}\n\n${draft.body}`)}><Copy size={15}/> Copy draft</button></div></article>})}</div><aside className="stack"><div className="panel"><div className="section-head"><h2>Campaign overview</h2></div><div className="campaign-metrics"><div><strong>{store.recipients.length}</strong><span>Recipients selected</span></div><div><strong>{store.recipients.filter(x=>x.approved).length}</strong><span>Drafts reviewed</span></div></div><div className="section-divider"/><p className="fineprint">This first version does not discover or validate contact emails. Sending is intentionally unavailable until mailbox integration and explicit review are implemented.</p><button className="btn btn-primary full" disabled><Send size={16}/> Sending not connected</button><p className="fineprint center-text">Copy approved drafts to your own email account.</p></div><div className="side-promo"><ShieldCheck size={23}/><h3>Protect your reputation</h3><p>Personalize every message. Verify the recipient, cite only real papers and projects, and respect requests not to be contacted.</p></div></aside></div>}
  </>;
}
