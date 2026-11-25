"use client";
import type React from "react";
import {LayoutDashboard,GraduationCap,Compass,BookOpen,Mail,ClipboardCheck,Settings2} from "lucide-react";
import type {View,Stage} from "@/lib/data";
export type Nav = {id:View;label:string;icon:typeof LayoutDashboard;group?:string};
export const nav:Nav[]=[
  {id:"overview",label:"Overview",icon:LayoutDashboard},
  {id:"profile",label:"My Profile",icon:GraduationCap},
  {id:"explore",label:"Opportunities",icon:Compass},
  {id:"recommendations",label:"Professors",icon:BookOpen},
  {id:"outreach",label:"Outreach",icon:Mail},
  {id:"tracker",label:"Application Tracker",icon:ClipboardCheck},
  {id:"settings",label:"Settings",icon:Settings2},
];
export const stages:Stage[]=["Interested","Preparing","Applied","Interview","Result"];
export const first=(s:string)=>s.split(" ").map(x=>x[0]).slice(0,2).join("").toUpperCase();
export const asList=(s:string)=>s.split(",").map(x=>x.trim()).filter(Boolean);
export const safeURL=(s:string)=>s.startsWith("https://")?s:"";
export const fmt=(n:number)=>Number.isFinite(n)?n.toFixed(1):"—";

export function Ring({value,size=104}:{value:number;size?:number}){
  const r=44,c=2*Math.PI*r;
  return <div className="ring" style={{width:size,height:size}}>
    <svg viewBox="0 0 112 112" aria-label={`${value}%`} role="img">
      <circle cx="56" cy="56" r={r} stroke="#e8edf5" strokeWidth="9" fill="none"/>
      <circle cx="56" cy="56" r={r} stroke="#315ce6" strokeWidth="9" strokeLinecap="round" fill="none" strokeDasharray={`${(value/100)*c} ${c}`} transform="rotate(-90 56 56)"/>
    </svg>
    <div className="ring-number"><strong>{value}%</strong><span>Complete</span></div>
  </div>
}
export function ScoreBar({value,max,label}:{value:number;max:number;label:string}){
  return <div className="score-bar"><div className="score-bar-top"><span>{label}</span><strong>{value}/{max}</strong></div><div className="score-track"><span style={{width:`${Math.min(100,value/max*100)}%`}}/></div></div>;
}
export function Empty({icon:Icon,title,detail,action}:{icon:typeof Mail;title:string;detail:string;action?:React.ReactNode}){
  return <div className="empty"><div className="empty-icon"><Icon size={25}/></div><h3>{title}</h3><p>{detail}</p>{action}</div>
}

