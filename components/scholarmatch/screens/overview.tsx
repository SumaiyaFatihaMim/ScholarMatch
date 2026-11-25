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

export default function OverviewScreen(){
  const {store,setStore,view,notify,navigate,p,strength,ranked,liveProfessors,opportunities,
  strong,actions,professors,addTracked,addRecipient,copy,profileFields,
  exportData,reset,setProfile,file,setFile,cvText,setCvText,extracting,
  doBasicExtract,doAIExtract,shownOpp,oppQuery,setOppQuery,country,setCountry,
  countries,fundedOnly,setFundedOnly,activeOpportunity,setActiveOpportunity,
  profSearch,setProfSearch,researchLoading,researchError,onSearch}=useScholarMatch();
  return <>

          <div className="page-heading"><div><div className="eyebrow"><span className="eyebrow-dot"/> YOUR RESEARCH JOURNEY</div><h1>Good to see you, {p.name==="Demo Student"?"future scholar":p.name.split(" ")[0]}{"\u00a0"}<span className="wave">✳</span></h1><p>Here&apos;s where your academic journey stands. Every strong application starts with a clear plan.</p></div><button className="btn btn-primary" onClick={()=>navigate("recommendations")}>Find your fit <ArrowRight size={17}/></button></div>
          <div className="notice"><ShieldCheck size={18}/><span><strong>Interactive demo:</strong> Opportunities and default professor cards are fictional examples, not active funding listings. Match scores are illustrative, not admission predictions.</span></div>
          <div className="metrics-grid">
            <div className="metric-card"><div className="metric-icon violet"><Target size={20}/></div><div className="metric-number">{strong}<small> / {opportunities.length}</small></div><p>Potential sample matches</p><span className="metric-hint">Passing sample checks & score ≥ 60</span></div>
            <div className="metric-card"><div className="metric-icon teal"><BookOpen size={20}/></div><div className="metric-number">{ranked.length.toString().padStart(2,"0")}</div><p>Researcher profiles</p><span className="metric-hint">{liveProfessors.length?"From OpenAlex research search":"Fictional demonstration cards"}</span></div>
            <div className="metric-card"><div className="metric-icon orange"><BriefcaseBusiness size={20}/></div><div className="metric-number">{store.tracked.length.toString().padStart(2,"0")}</div><p>Saved applications</p><span className="metric-hint">Across your personal tracker</span></div>
            <div className="metric-card"><div className="metric-icon sky"><Mail size={20}/></div><div className="metric-number">{store.recipients.length.toString().padStart(2,"0")}</div><p>Outreach drafts</p><span className="metric-hint">Not sent to any recipient</span></div>
          </div>
          <div className="two-col-layout"><div className="stack">
            <section className="panel"><div className="section-head"><div><h2>Your profile, at a glance</h2><p>A complete profile helps uncover relevant gaps.</p></div><button className="text-link" onClick={()=>navigate("profile")}>Edit profile <ArrowUpRight size={16}/></button></div><div className="profile-summary"><Ring value={strength}/><div className="profile-summary-info"><h3>{strength>=80?"Looking good — keep it current":"You're building a strong foundation"}</h3><p>{p.degree} in {p.field||"your field"} · GPA {p.gpa?`${fmt(p.gpa)} / ${p.gpaScale}`:"not added"}</p><div className="summary-tags">{asList(p.skills).slice(0,4).map(x=><span className="chip" key={x}>{x}</span>)}</div></div></div>            <div className="panel-bottom"><span><CheckCircle2 size={16}/> Your changes sync to your account</span><button className="subtle-link" onClick={()=>navigate("profile")}>Complete profile <ChevronRight size={15}/></button></div></section>
            <section className="panel"><div className="section-head"><div><h2>Your next best moves</h2><p>Recomputed from the sample opportunity requirements.</p></div><div className="mini-icon"><Zap size={18}/></div></div><div className="actions-list">{actions.map((a,i)=><div className="action-item" key={a.title}><div className="action-index">0{i+1}</div><div><h4>{a.title}</h4><p>{a.detail}</p><small>{a.label} · {a.impact>0?`could bring ${a.impact} additional sample match${a.impact>1?"es":""}`:"no additional sample matches calculated"}</small></div><ArrowUpRight size={17}/></div>)}</div></section>
          </div><div className="stack"><section className="panel"><div className="section-head"><div><h2>Top suggested professors</h2><p>Based on your research interests.</p></div><button className="text-link" onClick={()=>navigate("recommendations")}>View all <ArrowRight size={16}/></button></div><div className="professor-mini-list">{ranked.slice(0,4).map((pr,i)=><button className="professor-mini" key={pr.id} onClick={()=>navigate("recommendations")}><div className={`face face-${i%4}`}>{first(pr.name)}</div><div><strong>{pr.name}</strong><small>{pr.institution}</small></div><div className="fit-small"><strong>{pr.score}</strong><span>fit*</span></div><ChevronRight size={16}/></button>)}</div><div className="panel-footnote">* Topic-overlap demo scores; accepting students is unknown.</div></section>
            <section className="insight-banner"><div className="insight-icon"><TrendingUp size={24}/></div><div><h3>A better list starts with evidence.</h3><p>Explore requirements, document your projects, and compare the gaps before applying.</p><button onClick={()=>navigate("explore")}>Explore opportunities <ArrowRight size={16}/></button></div><div className="decorative-orbit"/></section>
          </div></div>
  </>;
}
