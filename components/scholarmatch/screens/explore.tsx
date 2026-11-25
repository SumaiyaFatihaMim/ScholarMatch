"use client";
import Link from "next/link";
import {
  ArrowDownRight, ArrowRight, ArrowUpRight, Bell, BookOpen, BriefcaseBusiness, Check, CheckCheck,
  CheckCircle2, ChevronDown, ChevronRight, CircleHelp, ClipboardCheck, Clock3, Compass,
  Copy, Download, ExternalLink, FileText, Filter, GraduationCap, LayoutDashboard, Mail,
  Menu, MessageSquareText, Plus, RefreshCw, Search, Send, Settings2, ShieldCheck, Sparkles,
  Target, TrendingUp, UploadCloud, WandSparkles, X, Zap,
} from "lucide-react";
import {opportunities} from "@/lib/data";
import type {Profile} from "@/lib/data";
import {buildDraft} from "@/lib/matching";
import {Ring,ScoreBar,Empty,first,asList,safeURL,fmt,stages} from "../ui";
import {useScholarMatch} from "../provider";

export default function OpportunitiesScreen(){
  const {store,setStore,view,notify,navigate,p,strength,ranked,liveProfessors,
  strong,actions,professors,addTracked,addRecipient,copy,profileFields,
  exportData,reset,setProfile,file,setFile,cvText,setCvText,extracting,
  doBasicExtract,doAIExtract,shownOpp,oppQuery,setOppQuery,country,setCountry,
  countries,fundedOnly,setFundedOnly,activeOpportunity,setActiveOpportunity,
  profSearch,setProfSearch,researchLoading,researchError,onSearch}=useScholarMatch();
  return <>

          <div className="page-heading"><div><div className="eyebrow">DISCOVER THE POSSIBILITIES</div><h1>Find your next opportunity</h1><p>Explore sample opportunities and understand the eligibility behind each match.</p></div><div className="count-pill">{shownOpp.length} results</div></div>
          <div className="notice"><CircleHelp size={18}/><span><strong>Sample data only.</strong> None of these opportunities is a verified opening. Replace the seeds with confirmed scholarship or university records before using this for real applications.</span></div>
          <div className="filterbar"><label className="searchbox"><Search size={19}/><input value={oppQuery} placeholder="Search by field, university, or keyword" onChange={e=>setOppQuery(e.target.value)}/></label><label className="select-wrap"><Filter size={17}/><select value={country} onChange={e=>setCountry(e.target.value)}>{countries.map(c=><option key={c}>{c}</option>)}</select><ChevronDown size={15}/></label><label className="small-check"><input type="checkbox" checked={fundedOnly} onChange={e=>setFundedOnly(e.target.checked)}/> Funded examples only</label></div>
          <div className="opps-layout"><div className="opportunities-list">{shownOpp.length?shownOpp.map(o=><article key={o.id} className={`opportunity-card ${activeOpportunity===o.id?"opportunity-active":""}`}><div className="opp-top"><div className="org-mark">{first(o.organization)}</div><div className="opp-title"><span className="tagline">ILLUSTRATIVE LISTING</span><h3>{o.title}</h3><p>{o.organization} <span className="dot-sep">·</span> {o.country}</p></div><div className="score-chip"><strong>{o.fit.score}</strong><span>/ 100*</span></div></div><p className="opp-description">{o.description}</p><div className="opp-tags"><span className="soft-chip">{o.area}</span><span className="soft-chip">{o.type}</span><span className={`soft-chip ${o.funded?"funded":""}`}>{o.funded?"Funding in scenario":"Funding not included"}</span><span className={`soft-chip ${o.fit.eligibility==="Not met"?"failed":o.fit.eligibility==="Pass"?"passed":""}`}>Eligibility: {o.fit.eligibility}</span></div><div className="opp-bottom"><button className="text-link" onClick={()=>setActiveOpportunity(activeOpportunity===o.id?null:o.id)}>{activeOpportunity===o.id?"Hide breakdown":"View fit breakdown"} <ChevronRight size={16}/></button><Link className="btn btn-small btn-light" href={`/opportunities/${encodeURIComponent(o.id)}`}>Details <ArrowRight size={16}/></Link><button className="btn btn-small btn-light" onClick={()=>addTracked("opportunity",o.id,o.title,o.organization)}><Plus size={16}/> Track</button></div>{activeOpportunity===o.id&&<div className="score-detail"><h4>Illustrative score breakdown</h4><ScoreBar label="Academic" value={o.fit.academic} max={35}/><ScoreBar label="Research" value={o.fit.research} max={30}/><ScoreBar label="Skills" value={o.fit.skills} max={15}/><ScoreBar label="Experience" value={o.fit.experience} max={20}/><div className="rule-grid"><div><strong>Sample GPA minimum</strong><span>{o.gpaMin??"Not specified"}</span></div><div><strong>Sample IELTS minimum</strong><span>{o.ieltsMin??"Not specified"}</span></div></div><div className="gaps"><strong>{o.fit.gaps.length?"Things to review":"No obvious gaps in the sample rule set"}</strong>{o.fit.gaps.map(g=><p key={g}><span className="red-dot"/>{g}</p>)}</div>{o.fit.eligibility==="Not met"&&<p className="fineprint">The score is 0 when a sample hard eligibility requirement is not met.</p>}</div>}</article>):<Empty icon={Search} title="No matching examples" detail="Try another keyword or clear the filters."/>}</div><aside className="explore-side"><div className="panel"><div className="section-head"><h2>How the score works</h2></div><div className="weight-list"><div><span>Academic fit</span><b>35%</b></div><div><span>Research fit</span><b>30%</b></div><div><span>Skills fit</span><b>15%</b></div><div><span>Experience fit</span><b>20%</b></div></div><div className="section-divider"/><p className="fineprint">Known hard eligibility failures are displayed as 0, while missing criteria remain Unknown. These are illustrative heuristic scores, not acceptance probabilities.</p></div><div className="side-promo"><Target size={23}/><h3>Know where to improve</h3><p>Changing your profile recalculates the comparison and the gap action list.</p><button onClick={()=>navigate("profile")}>Update my profile <ArrowRight size={16}/></button></div></aside></div>
  </>;
}
