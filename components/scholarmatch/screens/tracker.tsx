"use client";
import Link from "next/link";
import {
  ArrowDownRight, ArrowRight, ArrowUpRight, Bell, BookOpen, BriefcaseBusiness, Check, CheckCheck,
  CheckCircle2, ChevronDown, ChevronRight, CircleHelp, ClipboardCheck, Clock3, Compass,
  Copy, Download, ExternalLink, FileText, Filter, GraduationCap, LayoutDashboard, Mail,
  Menu, MessageSquareText, Plus, RefreshCw, Search, Send, Settings2, ShieldCheck, Sparkles,
  Target, TrendingUp, UploadCloud, WandSparkles, X, Zap,
} from "lucide-react";
import type {Profile, Stage} from "@/lib/data";
import {buildDraft} from "@/lib/matching";
import {Ring,ScoreBar,Empty,first,asList,safeURL,fmt,stages} from "../ui";
import {useScholarMatch} from "../provider";

export default function ApplicationsScreen(){
  const {store,setStore,view,notify,navigate,p,strength,ranked,liveProfessors,
  strong,actions,professors,addTracked,addRecipient,copy,profileFields,
  exportData,reset,setProfile,file,setFile,cvText,setCvText,extracting,
  doBasicExtract,doAIExtract,shownOpp,oppQuery,setOppQuery,country,setCountry,
  countries,fundedOnly,setFundedOnly,activeOpportunity,setActiveOpportunity,
  profSearch,setProfSearch,researchLoading,researchError,onSearch}=useScholarMatch();
  return <>

          <div className="page-heading"><div><div className="eyebrow">YOUR APPLICATION PIPELINE</div><h1>Keep every application on track</h1><p>Follow your own progress from your shortlist to a final result.</p></div><button className="btn btn-primary" onClick={()=>navigate("explore")}><Plus size={17}/> Find opportunities</button></div>
          <div className="tracker-summary"><span><span className="status-dot"/> {store.tracked.length} tracked items</span><span>{store.tracked.filter(x=>x.stage==="Applied").length} applications submitted (manually marked)</span><span>{store.tracked.filter(x=>x.stage==="Interview").length} in interview</span></div>
          <div className="kanban">{stages.map((stage,i)=><section key={stage} className="kanban-col"><div className="kanban-head"><span className={`kanban-dot dot-${i}`}/><strong>{stage}</strong><span className="kanban-count">{store.tracked.filter(x=>x.stage===stage).length}</span></div>{store.tracked.filter(x=>x.stage===stage).map(t=><article className="kanban-card" key={`${t.kind}-${t.id}`}><div className="tagline">{t.kind==="professor"?"PROFESSOR":"OPPORTUNITY"}</div><h4>{t.title}</h4><p>{t.subtitle}</p><select className="stage-select" aria-label={`Stage for ${t.title}`} value={t.stage} onChange={e=>setStore(s=>({...s,tracked:s.tracked.map(x=>x.id===t.id&&x.kind===t.kind?{...x,stage:e.target.value as Stage}:x)}))}>{stages.map(x=><option key={x}>{x}</option>)}</select><button className="kanban-remove" aria-label={`Remove ${t.title}`} onClick={()=>setStore(s=>({...s,tracked:s.tracked.filter(x=>x.id!==t.id||x.kind!==t.kind)}))}><X size={14}/></button></article>)}{store.tracked.filter(x=>x.stage===stage).length===0&&<div className="kanban-empty">No items yet</div>}</section>)}</div>
          {store.tracked.length===0&&<div className="panel tracker-empty"><Empty icon={ClipboardCheck} title="Build your shortlist" detail="Track a sample opportunity or professor, then move its card through each application stage." action={<button className="btn btn-primary" onClick={()=>navigate("explore")}>Browse opportunities <ArrowRight size={17}/></button>}/></div>}
  </>;
}
