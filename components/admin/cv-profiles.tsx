"use client";

import {useEffect,useMemo,useState} from "react";
import Link from "next/link";
import {Activity,ChevronRight,Download,FileText,Globe,GraduationCap,LoaderCircle,Search,ShieldCheck,Users} from "lucide-react";
import type {Profile} from "@/lib/data";

type CvRecord={
  id:string;
  accountName:string;
  accountEmail:string;
  createdAt:string;
  profile?:Profile;
};

function initials(name:string){
  return name.trim().split(/\s+/).map(part=>part[0]).slice(0,2).join("").toUpperCase()||"U";
}

function formatDate(value:string){
  return new Intl.DateTimeFormat(undefined,{dateStyle:"medium"}).format(new Date(value));
}

function profileDetails(profile:Profile):Array<[string,string]>{
  return [
    ["Profile name",profile.name],
    ["Profile email",profile.email],
    ["University",profile.university],
    ["Graduation year",profile.graduationYear],
    ["Degree sought",profile.degree],
    ["Main field",profile.field],
    ["GPA",profile.gpa?`${profile.gpa} / ${profile.gpaScale}`:"Not entered"],
    ["IELTS",profile.ielts?String(profile.ielts):"Not entered"],
    ["Skills",profile.skills],
    ["Research interests",profile.interests],
    ["Projects / research work",profile.projects],
    ["Target countries",profile.targetCountries],
    ["Funding required",profile.fundingRequired?"Yes":"No"],
    ["Research statement",profile.statement],
  ].map(([label,value])=>[label,value.trim()||"Not provided"] as [string,string]);
}

export default function CvProfiles(){
  const [profiles,setProfiles]=useState<CvRecord[]>([]);
  const [query,setQuery]=useState("");
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState("");

  useEffect(()=>{
    let cancelled=false;
    const load=async()=>{
      setLoading(true);
      setError("");
      try{
        const response=await fetch("/api/admin/cvs",{cache:"no-store"});
        const data=await response.json();
        if(!response.ok)throw new Error(data.error||"Could not load saved CV profiles.");
        if(!Array.isArray(data.profiles))throw new Error("The CV profile response was invalid.");
        if(!cancelled)setProfiles(data.profiles);
      }catch(cause){
        if(!cancelled)setError(cause instanceof Error?cause.message:"Could not load saved CV profiles.");
      }finally{
        if(!cancelled)setLoading(false);
      }
    };
    void load();
    return ()=>{cancelled=true;};
  },[]);

  const filteredProfiles=useMemo(()=>{
    const term=query.trim().toLowerCase();
    if(!term)return profiles;
    return profiles.filter(record=>{
      const profile=record.profile;
      return [
        record.accountName,record.accountEmail,profile?.name,profile?.email,profile?.university,
        profile?.graduationYear,profile?.degree,profile?.field,profile?.skills,profile?.interests,
        profile?.projects,profile?.targetCountries,profile?.statement,
      ].join(" ").toLowerCase().includes(term);
    });
  },[profiles,query]);

  return <div className="admin-page">
    <header className="admin-heading">
      <div>
        <div className="admin-kicker"><span/><FileText size={14}/> ADMINISTRATION</div>
        <h1>CVs &amp; Profiles</h1>
        <p>Review saved academic information associated with each user account.</p>
      </div>
      <a className="btn btn-primary" href="/api/admin/export?type=academic"><Download size={16}/> Export academic CSV</a>
    </header>

    <nav className="admin-mobile-nav" aria-label="Admin navigation">
      {[
        {href:"/admin",label:"Overview",icon:Activity},
        {href:"/admin/users",label:"Users",icon:Users},
        {href:"/admin/cvs",label:"CVs",icon:FileText},
        {href:"/admin/professors",label:"Professors",icon:GraduationCap},
        {href:"/admin/website",label:"Website",icon:Globe},
        {href:"/admin/exports",label:"Exports",icon:Download},
      ].map(item=>{const Icon=item.icon;return <Link key={item.href} href={item.href} className={item.href==="/admin/cvs"?"active":""} aria-current={item.href==="/admin/cvs"?"page":undefined}><Icon size={20}/><span>{item.label}</span></Link>;})}
    </nav>

    <div className="admin-safety"><ShieldCheck size={18}/><span>Administrators can view profile details users saved manually or after optional extraction. Uploaded CV files are not retained by this app.</span></div>
    <label className="admin-search"><Search size={17}/><input value={query} onChange={event=>setQuery(event.target.value)} placeholder="Search users, university, skills, or interests"/></label>

    {error&&<div className="admin-feedback is-error" role="alert">{error}</div>}
    {loading?<div className="admin-loading"><LoaderCircle className="spin" size={24}/> Loading saved profiles…</div>:filteredProfiles.length===0
      ?<div className="panel admin-panel admin-empty">{profiles.length?"No saved profiles match your search.":"No user profiles are available yet."}</div>
      :<section className="admin-cv-list" aria-label="Saved CV profiles">
        {filteredProfiles.map(record=><details className="panel admin-panel admin-cv-record" key={record.id}>
          <summary>
            <span className="admin-user-avatar">{initials(record.accountName)}</span>
            <span><strong>{record.accountName}</strong><small>{record.accountEmail} · Joined {formatDate(record.createdAt)}</small></span>
            <span className="admin-role">{record.profile?"Profile saved":"No profile"}</span>
            <ChevronRight size={17}/>
          </summary>
          {record.profile
            ?<div className="admin-cv-record-details"><div className="admin-profile-grid">{profileDetails(record.profile).map(([label,value])=><div key={label}><small>{label}</small><strong>{value}</strong></div>)}</div></div>
            :<p className="admin-empty">This account has not saved an academic profile yet.</p>}
        </details>)}
      </section>}
  </div>;
}
