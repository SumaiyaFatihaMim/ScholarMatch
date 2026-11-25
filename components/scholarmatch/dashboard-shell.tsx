"use client";
import Link from "next/link";
import {useEffect,useState,type ReactNode} from "react";
import {usePathname,useRouter} from "next/navigation";
import {ArrowRight,Bell,CheckCircle2,ChevronRight,ClipboardCheck,Compass,Download,FileText,GraduationCap,Globe,LayoutDashboard,LogOut,MoreHorizontal,Settings2,ShieldCheck,Sparkles,Shield,Users,X} from "lucide-react";
import {nav,first} from "./ui";
import {VIEW_PATHS} from "./routes";
import {useScholarMatch} from "./provider";

export default function DashboardShell({children,userName,isAdmin}:{children:ReactNode;userName:string;isAdmin:boolean}){
 const {view,store,p,mobileMenu,setMobileMenu,navigate,notify,toast,setToast,workspaceSyncError}=useScholarMatch();
 const router=useRouter();
 const pathname=usePathname();
 const isAdminRoute=pathname.startsWith("/admin");
 const adminNav=[
  {href:"/admin",label:"Overview",icon:Shield},
  {href:"/admin/users",label:"Users",icon:Users},
  {href:"/admin/cvs",label:"CVs",icon:FileText},
  {href:"/admin/professors",label:"Professors",icon:GraduationCap},
  {href:"/admin/website",label:"Website",icon:Globe},
  {href:"/admin/exports",label:"Exports",icon:Download},
 ];
 const [signingOut,setSigningOut]=useState(false);
 useEffect(()=>{
  if(!mobileMenu||!window.matchMedia("(max-width: 780px)").matches)return;
  const body=document.body;
  const scrollY=window.scrollY;
  const previousPosition=body.style.position;
  const previousTop=body.style.top;
  const previousWidth=body.style.width;
  const previousOverflow=body.style.overflow;
  const previousPaddingRight=body.style.paddingRight;
  body.style.position="fixed";
  body.style.top=`-${scrollY}px`;
  body.style.width="100%";
  body.style.overflow="hidden";
  body.style.paddingRight=`${window.innerWidth-document.documentElement.clientWidth}px`;
  return ()=>{
   body.style.position=previousPosition;
   body.style.top=previousTop;
   body.style.width=previousWidth;
   body.style.overflow=previousOverflow;
   body.style.paddingRight=previousPaddingRight;
   window.requestAnimationFrame(()=>window.scrollTo(0,scrollY));
  };
 },[mobileMenu]);
 useEffect(()=>{setMobileMenu(false);},[pathname,setMobileMenu]);
 async function signOut(){
  setSigningOut(true);
  try{
   const response=await fetch("/api/auth/signout",{method:"POST"});
   const result=await response.json();
   if(!response.ok)throw new Error(result.error||"Could not sign out.");
   router.replace("/sign-in");
   router.refresh();
  }catch(error){
   notify(error instanceof Error?error.message:"Could not sign out.");
   setSigningOut(false);
  }
 }
 const navigationItems=isAdmin
  ?adminNav.map(item=>{
   const Icon=item.icon;
   const selected=pathname===item.href||(item.href!=="/admin"&&pathname.startsWith(`${item.href}/`));
   return <Link key={item.href} href={item.href} className={`nav-item ${selected?"selected":""}`} aria-current={selected?"page":undefined} onClick={()=>setMobileMenu(false)}><Icon size={19}/><span>{item.label}</span></Link>;
  })
  :nav.map(item=>{
   const Icon=item.icon;
   const selected=view===item.id;
   return <Link key={item.id} href={VIEW_PATHS[item.id]} aria-current={selected?"page":undefined} className={`nav-item ${selected?"selected":""}`} onClick={()=>setMobileMenu(false)}><Icon size={19}/><span>{item.label}</span>{item.id==="tracker"&&store.tracked.length>0&&<span className="nav-count">{store.tracked.length}</span>}{item.id==="outreach"&&store.recipients.length>0&&<span className="nav-count">{store.recipients.length}</span>}</Link>;
  });
  return <div className={`app-shell ${isAdmin?"admin-shell":""}`}>
    <aside id="dashboard-sidebar" className={`sidebar ${mobileMenu?"sidebar-open":""}`}>
      <div className="brand"><div className="brand-mark"><GraduationCap size={24} strokeWidth={2.5}/></div><div><strong>Scholar<span>Match</span></strong><small>{isAdmin?"Platform administration":"Research, within reach."}</small></div><button className="mobile-close" aria-label="Close menu" onClick={()=>setMobileMenu(false)}><X size={20}/></button></div>
      <div className="workspace-label">{isAdmin?"ADMINISTRATION":"WORKSPACE"} <span className="workspace-dot"/></div>
      <nav className="nav-list" aria-label={isAdmin?"Admin navigation":"Main navigation"}>{navigationItems}</nav>
      <div className="sidebar-bottom">{!isAdmin&&<div className="helper-card"><div className="helper-symbol"><Sparkles size={20}/></div><h4>Your research journey</h4><p>Turn your profile into a smarter shortlist, with transparent evidence.</p><button onClick={()=>navigate("recommendations")}>Explore matches <ArrowRight size={15}/></button></div>}<div className="avatar-row"><div className="avatar">{first(p.name||userName)}</div><div className="avatar-info"><strong>{p.name||userName}</strong><small>{isAdmin?"Administrator":"Signed in"}</small></div>{!isAdmin&&<><Link href="/settings" aria-label="Open settings"><Settings2 size={16} color="#94a3b8"/></Link><button className="sidebar-signout" onClick={()=>void signOut()} disabled={signingOut} aria-label="Sign out" title="Sign out"><LogOut size={16}/></button></>}</div></div>
    </aside>
    {mobileMenu&&<button className="overlay" onClick={()=>setMobileMenu(false)} aria-label="Close navigation"/>}
    <div className="workspace">
      <header className="topbar"><div className="topbar-left"><div className="breadcrumb">{isAdmin?<><strong>Admin Center</strong>{pathname!=="/admin"&&<><ChevronRight size={14}/><strong>{adminNav.find(item=>pathname===item.href)?.label||"Administration"}</strong></>}</>:<><span className="breadcrumb-context">Workspace</span><ChevronRight size={14}/><strong>{nav.find(x=>x.id===view)?.label}</strong></>}</div></div><div className="topbar-right"><button className="sign-out-button" onClick={()=>void signOut()} disabled={signingOut}><LogOut size={15}/>{signingOut?"Signing out…":"Sign out"}</button>{!isAdmin&&<><button className="icon-button tooltip-container" title="Feature roadmap" onClick={()=>notify("Live deadlines and notifications arrive in the next development phase")}><Bell size={19}/></button><Link href="/profile" className="top-avatar" aria-label="Open user profile" title="User profile" onClick={()=>setMobileMenu(false)}>{first(userName)}</Link></>}</div></header>
      <main className="main-content">{!isAdmin&&workspaceSyncError&&<div className="workspace-sync-warning" role="status"><ShieldCheck size={16}/><span>{workspaceSyncError} Your changes are still kept in this browser.</span></div>}{children}
      </main>
      <footer className="footer"><span>© 2026 ScholarMatch · Proof-of-concept</span><span>Transparent by design <ShieldCheck size={15}/></span></footer>
    </div>
    {!isAdmin&&<nav className="mobile-bottom-nav" aria-label="Primary navigation">
      {[
        {id:"overview" as const,label:"Home",icon:LayoutDashboard},
        {id:"explore" as const,label:"Explore",icon:Compass},
        {id:"tracker" as const,label:"Tracker",icon:ClipboardCheck},
        {id:"profile" as const,label:"Profile",icon:GraduationCap},
      ].map(item=>{const Icon=item.icon;const selected=!isAdminRoute&&view===item.id;return <Link key={item.id} href={VIEW_PATHS[item.id]} aria-current={selected?"page":undefined} className={selected?"active":""} onClick={()=>setMobileMenu(false)}><Icon size={20}/><span>{item.label}</span></Link>;})}
      <button type="button" className={mobileMenu||isAdminRoute||["recommendations","outreach","settings"].includes(view)?"active":""} aria-expanded={mobileMenu} aria-controls="dashboard-sidebar" onClick={()=>setMobileMenu(!mobileMenu)}><MoreHorizontal size={20}/><span>More</span></button>
    </nav>}
    {toast&&<div className="toast" role="status"><CheckCircle2 size={17}/><span>{toast}</span><button onClick={()=>setToast("")} aria-label="Dismiss"><X size={15}/></button></div>}
  </div>;
}
