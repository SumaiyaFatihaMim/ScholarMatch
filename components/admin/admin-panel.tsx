"use client";

import {useEffect,useMemo,useState,type FormEvent} from "react";
import Link from "next/link";
import {Activity,ArrowLeft,BookOpen,BriefcaseBusiness,Check,ChevronRight,Download,FileText,Globe,GraduationCap,LoaderCircle,Plus,RefreshCw,Search,Shield,ShieldCheck,Trash2,Users,X} from "lucide-react";
import type {Opportunity,Professor,Profile,Store} from "@/lib/data";

type UserSummary={
  id:string;name:string;email:string;isAdmin:boolean;createdAt:string;
  trackedCount:number;outreachCount:number;hasProjects:boolean;hasProfile:boolean;
};
type UserDetail=UserSummary&{workspace:Store|null};
type Catalog={opportunities:Opportunity[];professors:Professor[]};
type OpportunityDraft=Omit<Opportunity,"id"|"skills"> & {id:string;skills:string};
type ProfessorDraft=Omit<Professor,"id"|"topics"> & {id:string;topics:string};
type Section="overview"|"users"|"cvs"|"professors"|"website"|"exports";

const emptyOpportunity:OpportunityDraft={id:"",title:"",organization:"",country:"",type:"PhD",area:"",gpaMin:null,ieltsMin:null,skills:"",funded:false,description:""};
const emptyProfessor:ProfessorDraft={id:"",name:"",institution:"",country:"",topics:"",paper:"",url:"",source:"sample",accepting:"Unknown"};
const adminSections=[
  {id:"overview" as const,label:"Overview",icon:Activity,href:"/admin"},
  {id:"users" as const,label:"Users",icon:Users,href:"/admin/users"},
  {id:"cvs" as const,label:"CVs",icon:FileText,href:"/admin/cvs"},
  {id:"professors" as const,label:"Professors",icon:GraduationCap,href:"/admin/professors"},
  {id:"website" as const,label:"Website",icon:Globe,href:"/admin/website"},
  {id:"exports" as const,label:"Exports",icon:Download,href:"/admin/exports"},
];

function emptyProfile(name:string,email:string):Profile{
  return {name,email,university:"",graduationYear:"",degree:"Master's",field:"",gpa:0,gpaScale:4,ielts:0,skills:"",interests:"",projects:"",targetCountries:"",fundingRequired:false,statement:""};
}

async function readJson(response:Response){
  const data=await response.json();
  if(!response.ok)throw new Error(data.error||"The request could not be completed.");
  return data;
}
function slug(value:string){return value.toLowerCase().trim().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");}
function formatDate(value:string){return new Intl.DateTimeFormat(undefined,{dateStyle:"medium"}).format(new Date(value));}
function listValue(value:string){return value.split(",").map(item=>item.trim()).filter(Boolean);}

export default function AdminPanel({currentUserId,section="overview"}:{currentUserId:string;section?:Section}){
  const [users,setUsers]=useState<UserSummary[]>([]);
  const [catalog,setCatalog]=useState<Catalog>({opportunities:[],professors:[]});
  const [selectedUser,setSelectedUser]=useState<UserDetail|null>(null);
  const [profileDraft,setProfileDraft]=useState<Profile|null>(null);
  const [query,setQuery]=useState("");
  const [opportunityDraft,setOpportunityDraft]=useState<OpportunityDraft>(emptyOpportunity);
  const [professorDraft,setProfessorDraft]=useState<ProfessorDraft>(emptyProfessor);
  const [editingId,setEditingId]=useState("");
  const [loading,setLoading]=useState(true);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  const [message,setMessage]=useState("");

  const load=async()=>{
    setLoading(true);setError("");
    try{
      const [userResponse,catalogResponse]=await Promise.all([fetch("/api/admin"),fetch("/api/admin/catalog")]);
      const [userData,catalogData]=await Promise.all([readJson(userResponse),readJson(catalogResponse)]);
      setUsers(userData.users);
      setCatalog({opportunities:catalogData.opportunities,professors:catalogData.professors});
    }catch(cause){setError(cause instanceof Error?cause.message:"Could not load the admin workspace.");}
    finally{setLoading(false);}
  };
  useEffect(()=>{void load();},[]);

  const filteredUsers=useMemo(()=>{
    const term=query.trim().toLowerCase();
    return users.filter(user=>!term||`${user.name} ${user.email}`.toLowerCase().includes(term));
  },[users,query]);
  const administratorCount=users.filter(user=>user.isAdmin).length;
  const profileCount=users.filter(user=>user.hasProfile).length;
  const trackedCount=users.reduce((sum,user)=>sum+user.trackedCount,0);

  async function showUser(userId:string){
    setBusy(true);setError("");setMessage("");
    setSelectedUser(null);
    try{
      const data=await readJson(await fetch(`/api/admin?userId=${encodeURIComponent(userId)}`));
      setSelectedUser(data.user);
      const savedProfile:Profile=data.user.workspace?.profile||emptyProfile(data.user.name,data.user.email);
      setProfileDraft({...savedProfile,name:savedProfile.name||data.user.name,email:savedProfile.email||data.user.email});
    }catch(cause){setError(cause instanceof Error?cause.message:"Could not load this account.");}
    finally{setBusy(false);}
  }

  async function saveProfile(event:FormEvent<HTMLFormElement>){
    event.preventDefault();
    if(!selectedUser||!profileDraft)return;
    setBusy(true);setError("");setMessage("");
    try{
      await readJson(await fetch("/api/admin",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({userId:selectedUser.id,profile:profileDraft})}));
      const currentWorkspace=selectedUser.workspace||{profile:profileDraft,tracked:[],recipients:[]};
      const updated={...selectedUser,name:profileDraft.name.trim(),email:profileDraft.email.trim().toLowerCase(),workspace:{...currentWorkspace,profile:{...profileDraft,name:profileDraft.name.trim(),email:profileDraft.email.trim().toLowerCase()}}};
      setSelectedUser(updated);
      setProfileDraft(updated.workspace.profile);
      setUsers(current=>current.map(user=>user.id===updated.id?{...user,name:updated.name,email:updated.email,hasProjects:Boolean(profileDraft.projects.trim()),hasProfile:true}:user));
      setMessage("Personal and academic profile saved.");
    }catch(cause){setError(cause instanceof Error?cause.message:"Could not update account details.");}
    finally{setBusy(false);}
  }

  async function updateRole(user:UserSummary){
    setBusy(true);setError("");setMessage("");
    try{
      await readJson(await fetch("/api/admin",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({userId:user.id,isAdmin:!user.isAdmin})}));
      setUsers(current=>current.map(item=>item.id===user.id?{...item,isAdmin:!item.isAdmin}:item));
      setSelectedUser(current=>current?.id===user.id?{...current,isAdmin:!current.isAdmin}:current);
      setMessage(`${user.name} is ${user.isAdmin?"no longer an":"now an"} administrator.`);
    }catch(cause){setError(cause instanceof Error?cause.message:"Could not update this role.");}
    finally{setBusy(false);}
  }

  async function deleteUser(user:UserDetail){
    if(!window.confirm(`Permanently delete ${user.name} (${user.email}) and their profile, projects, tracker, and outreach data?`))return;
    setBusy(true);setError("");setMessage("");
    try{
      await readJson(await fetch("/api/admin",{method:"DELETE",headers:{"Content-Type":"application/json"},body:JSON.stringify({userId:user.id})}));
      setUsers(current=>current.filter(item=>item.id!==user.id));
      setSelectedUser(null);setProfileDraft(null);
      setMessage("Account and associated workspace data deleted.");
    }catch(cause){setError(cause instanceof Error?cause.message:"Could not delete this account.");}
    finally{setBusy(false);}
  }

  async function saveCatalog(next:Catalog):Promise<boolean>{
    setBusy(true);setError("");setMessage("");
    try{
      await readJson(await fetch("/api/admin/catalog",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(next)}));
      setCatalog(next);
      setMessage("Catalog saved and published to the researcher workspace.");
      window.dispatchEvent(new Event("scholarmatch-catalog-updated"));
      return true;
    }catch(cause){setError(cause instanceof Error?cause.message:"Could not save the catalog.");}
    finally{setBusy(false);}
    return false;
  }

  async function submitOpportunity(event:FormEvent<HTMLFormElement>){
    event.preventDefault();
    const id=opportunityDraft.id.trim()||slug(opportunityDraft.title);
    if(!id){setError("Add a title to create a catalog ID.");return;}
    const item={...opportunityDraft,id,skills:listValue(opportunityDraft.skills)};
    const exists=catalog.opportunities.some(entry=>entry.id===id&&entry.id!==editingId);
    if(exists){setError("That opportunity ID is already in use.");return;}
    const next={...catalog,opportunities:editingId?catalog.opportunities.map(entry=>entry.id===editingId?item:entry):[item,...catalog.opportunities]};
    if(await saveCatalog(next)){setOpportunityDraft(emptyOpportunity);setEditingId("");}
  }

  async function submitProfessor(event:FormEvent<HTMLFormElement>){
    event.preventDefault();
    const id=professorDraft.id.trim()||slug(professorDraft.name);
    if(!id){setError("Add a name to create a researcher ID.");return;}
    const item={...professorDraft,id,topics:listValue(professorDraft.topics)};
    const exists=catalog.professors.some(entry=>entry.id===id&&entry.id!==editingId);
    if(exists){setError("That researcher ID is already in use.");return;}
    const next={...catalog,professors:editingId?catalog.professors.map(entry=>entry.id===editingId?item:entry):[item,...catalog.professors]};
    if(await saveCatalog(next)){setProfessorDraft(emptyProfessor);setEditingId("");}
  }

  function startOpportunityEdit(item:Opportunity){
    setOpportunityDraft({...item,skills:item.skills.join(", ")});
    setEditingId(item.id);setError("");setMessage("");
  }
  function startProfessorEdit(item:Professor){
    setProfessorDraft({...item,topics:item.topics.join(", ")});
    setEditingId(item.id);setError("");setMessage("");
  }

  const profile=profileDraft;
  const workspace=selectedUser?.workspace;
  const siteRoutes=[
    {path:"/",name:"Landing page",access:"Public"},
    {path:"/sign-in",name:"Sign in",access:"Public"},
    {path:"/sign-up",name:"Create account",access:"Public"},
    {path:"/dashboard",name:"Research dashboard",access:"Signed-in users"},
    {path:"/profile",name:"Academic profile",access:"Signed-in users"},
    {path:"/opportunities",name:"Opportunities",access:"Signed-in users"},
    {path:"/opportunities/[id]",name:"Opportunity details",access:"Signed-in users"},
    {path:"/professors",name:"Researchers",access:"Signed-in users"},
    {path:"/professors/[id]",name:"Researcher details",access:"Signed-in users"},
    {path:"/outreach",name:"Outreach drafts",access:"Signed-in users"},
    {path:"/applications",name:"Application tracker",access:"Signed-in users"},
    {path:"/settings",name:"Account settings",access:"Signed-in users"},
    {path:"/api/auth/signin",name:"Sign-in API",access:"Public"},
    {path:"/api/auth/signup",name:"Sign-up API",access:"Public"},
    {path:"/api/auth/signout",name:"Sign-out API",access:"Signed-in users"},
    {path:"/api/auth/password",name:"Password API",access:"Signed-in users"},
    {path:"/api/auth/account",name:"Account API",access:"Signed-in users"},
    {path:"/api/workspace",name:"Workspace API",access:"Signed-in users"},
    {path:"/api/openalex",name:"Research search API",access:"Signed-in users"},
    {path:"/api/ai/extract",name:"Optional CV extraction API",access:"Signed-in users"},
    {path:"/admin",name:"Admin overview",access:"Administrators"},
    {path:"/admin/users",name:"User management",access:"Administrators"},
    {path:"/admin/cvs",name:"Saved CV profiles",access:"Administrators"},
    {path:"/admin/professors",name:"Professor management",access:"Administrators"},
    {path:"/admin/website",name:"Website and catalog",access:"Administrators"},
    {path:"/admin/exports",name:"CSV exports",access:"Administrators"},
    {path:"/api/admin",name:"Admin users API",access:"Administrators"},
    {path:"/api/admin/cvs",name:"Saved CV profiles API",access:"Administrators"},
    {path:"/api/admin/catalog",name:"Website catalog API",access:"Administrators"},
    {path:"/api/admin/export",name:"Admin CSV export API",access:"Administrators"},
  ];

  return <div className="admin-page">
    <header className="admin-heading">
      <div>
        <div className="admin-kicker"><span/><ShieldCheck size={14}/> ADMINISTRATION</div>
        <h1>{adminSections.find(item=>item.id===section)?.label||"Overview"}</h1>
        <p>{section==="users"?"Review and manage accounts, profiles, and saved workspace activity.":section==="cvs"?"Review academic profile information saved by users. Original CV files are not retained.":section==="professors"?"Manage the shared professor and researcher directory.":section==="website"?"Review site routes and manage shared opportunity content.":section==="exports"?"Download separate personal and academic user datasets.":"Manage users, CV profiles, professors, and website content."}</p>
      </div>
      <button className="btn btn-light" onClick={()=>void load()} disabled={loading||busy}><RefreshCw size={16}/> Refresh data</button>
    </header>

    <div className="admin-safety"><ShieldCheck size={18}/><span>Restricted admin area. Role changes and account deletions are server-checked; deleting an account also deletes its workspace and sessions.</span></div>
    {(error||message)&&<div className={`admin-feedback ${error?"is-error":"is-success"}`} role={error?"alert":"status"}>{error||message}<button aria-label="Dismiss message" onClick={()=>{setError("");setMessage("");}}><X size={15}/></button></div>}

    <nav className="admin-tabs" aria-label="Admin sections">
      {adminSections.map(item=><Link key={item.id} href={item.href} className={section===item.id?"active":""}><item.icon size={16}/>{item.label}</Link>)}
    </nav>
    <nav className="admin-mobile-nav" aria-label="Admin navigation">
      {adminSections.map(item=><Link key={item.id} href={item.href} className={section===item.id?"active":""} aria-current={section===item.id?"page":undefined}><item.icon size={20}/><span>{item.label}</span></Link>)}
    </nav>

    {loading?<div className="admin-loading"><LoaderCircle className="spin" size={24}/> Loading administrator workspace…</div>:<>
      {section==="overview"&&<section className="admin-section">
        <div className="admin-stats">
          <article className="admin-stat"><span className="admin-stat-icon blue"><Users size={19}/></span><strong>{users.length}</strong><small>Registered accounts</small></article>
          <article className="admin-stat"><span className="admin-stat-icon purple"><Shield size={19}/></span><strong>{administratorCount}</strong><small>Administrators</small></article>
          <article className="admin-stat"><span className="admin-stat-icon green"><GraduationCap size={19}/></span><strong>{profileCount}</strong><small>Saved academic profiles</small></article>
          <article className="admin-stat"><span className="admin-stat-icon orange"><BriefcaseBusiness size={19}/></span><strong>{trackedCount}</strong><small>Saved application items</small></article>
        </div>
        <div className="admin-overview-grid">
          <section className="panel admin-panel">
            <div className="admin-panel-head"><div><h2>Latest accounts</h2><p>Open the directory to review profile and workspace details.</p></div><Link className="text-link" href="/admin/users">Manage users <ChevronRight size={15}/></Link></div>
            {users.length===0?<p className="admin-empty">No registered users yet.</p>:users.slice(0,5).map(user=><Link key={user.id} className="admin-user-row" href="/admin/users"><span className="admin-user-avatar">{user.name.split(/\s+/).map(part=>part[0]).slice(0,2).join("").toUpperCase()}</span><span className="admin-user-main"><strong>{user.name}</strong><small>{user.email}</small></span><span className={`admin-role ${user.isAdmin?"role-admin":""}`}>{user.isAdmin?"Admin":"Student"}</span><ChevronRight size={16}/></Link>)}
          </section>
          <section className="panel admin-panel admin-quick-actions">
            <div className="admin-panel-head"><div><h2>Platform catalog</h2><p>Keep the discovery content current.</p></div><BookOpen size={19}/></div>
            <div className="admin-catalog-count"><span>Opportunities</span><strong>{catalog.opportunities.length}</strong></div>
            <div className="admin-catalog-count"><span>Researcher examples</span><strong>{catalog.professors.length}</strong></div>
            <Link className="btn btn-light full" href="/admin/cvs">Review CV profiles <ChevronRight size={16}/></Link>
            <Link className="btn btn-light full" href="/admin/professors">Manage professors <ChevronRight size={16}/></Link>
            <Link className="btn btn-primary full" href="/admin/website">Manage website <ChevronRight size={16}/></Link>
            <p className="admin-footnote">Catalog edits are shared by all users. External OpenAlex search results remain separate.</p>
          </section>
        </div>
      </section>}

      {section==="users"&&<section className={`admin-section admin-users-layout ${selectedUser?"has-selected":""}`}>
        <div className="panel admin-panel admin-user-directory">
          <div className="admin-panel-head"><div><h2>Account directory</h2><p>{users.length} total accounts · select a row for workspace details.</p></div></div>
          <label className="admin-search"><Search size={17}/><input value={query} onChange={event=>setQuery(event.target.value)} placeholder="Search name or email"/></label>
          <div className="admin-mobile-users">{filteredUsers.map(user=><button key={user.id} className={`admin-mobile-user-card ${selectedUser?.id===user.id?"selected":""}`} onClick={()=>void showUser(user.id)}><span className="admin-user-avatar">{user.name.split(/\s+/).map(part=>part[0]).slice(0,2).join("").toUpperCase()}</span><span className="admin-user-main"><strong>{user.name}</strong><small>{user.email}</small><small>{user.trackedCount} tracked · {user.hasProjects?"Projects added":"No projects yet"}</small></span><span className={`admin-role ${user.isAdmin?"role-admin":""}`}>{user.isAdmin?"Admin":"Student"}</span><ChevronRight size={17}/></button>)}{filteredUsers.length===0&&<p className="admin-empty">No accounts match your search.</p>}</div>
          <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Account</th><th>Role</th><th>Projects</th><th>Tracked</th></tr></thead><tbody>
            {filteredUsers.map(user=><tr key={user.id} className={selectedUser?.id===user.id?"selected":""} onClick={()=>void showUser(user.id)} tabIndex={0} onKeyDown={event=>{if(event.key==="Enter")void showUser(user.id);}}>
              <td><strong>{user.name}</strong><small>{user.email}</small></td><td><span className={`admin-role ${user.isAdmin?"role-admin":""}`}>{user.isAdmin?"Admin":"Student"}</span></td><td>{user.hasProjects?"Added":"—"}</td><td>{user.trackedCount}</td>
            </tr>)}
            {filteredUsers.length===0&&<tr><td colSpan={4} className="admin-empty">No accounts match your search.</td></tr>}
          </tbody></table></div>
        </div>

        <aside className="panel admin-panel admin-user-detail">
          {!selectedUser?<div className="admin-select-empty"><span><Users size={23}/></span><h2>Select an account</h2><p>Review academic profile details, projects, saved applications, and outreach drafts.</p></div>:<>
            <div className="admin-detail-head"><button className="admin-mobile-back" onClick={()=>setSelectedUser(null)} aria-label="Back to account list"><ArrowLeft size={18}/></button><span className="admin-user-avatar large">{selectedUser.name.split(/\s+/).map(part=>part[0]).slice(0,2).join("").toUpperCase()}</span><div><h2>{selectedUser.name}</h2><p>{selectedUser.email}</p></div></div>
            <div className="admin-detail-meta"><span>Joined</span><strong>{formatDate(selectedUser.createdAt)}</strong></div>
            <div className="admin-role-control"><div><strong>Administrator access</strong><small>{selectedUser.isAdmin?"Full management access":"Standard student access"}</small></div><button className={`admin-switch ${selectedUser.isAdmin?"on":""}`} role="switch" aria-checked={selectedUser.isAdmin} aria-label={`Change administrator access for ${selectedUser.name}`} title={selectedUser.id===currentUserId?"Use another admin account to remove your own access":""} disabled={busy||selectedUser.id===currentUserId} onClick={()=>void updateRole(selectedUser)}><span/></button></div>
            {profile&&<form className="admin-profile-editor" onSubmit={saveProfile}>
              <section className="admin-profile-block">
                <h3><Users size={16}/> Personal information</h3>
                <label className="field"><span>Full name</span><input className="form-control" required minLength={2} maxLength={100} value={profile.name} onChange={event=>setProfileDraft({...profile,name:event.target.value})}/></label>
                <label className="field"><span>Email address</span><input className="form-control" type="email" required maxLength={254} value={profile.email} onChange={event=>setProfileDraft({...profile,email:event.target.value})}/></label>
              </section>
              <section className="admin-profile-block">
                <h3><GraduationCap size={16}/> Academic information</h3>
                <label className="field"><span>University</span><input className="form-control" maxLength={200} value={profile.university} onChange={event=>setProfileDraft({...profile,university:event.target.value})}/></label>
                <div className="form-grid">
                  <label className="field"><span>Graduation year</span><input className="form-control" type="number" min="1950" max="2100" step="1" value={profile.graduationYear} onChange={event=>setProfileDraft({...profile,graduationYear:event.target.value})}/></label>
                  <label className="field"><span>Degree sought</span><select className="form-control" value={profile.degree} onChange={event=>setProfileDraft({...profile,degree:event.target.value as Profile["degree"]})}><option>Master&apos;s</option><option>PhD</option></select></label>
                  <label className="field"><span>Main field</span><input className="form-control" maxLength={200} value={profile.field} onChange={event=>setProfileDraft({...profile,field:event.target.value})}/></label>
                  <label className="field"><span>GPA</span><input className="form-control" type="number" min="0" max={profile.gpaScale} step="0.01" value={profile.gpa||""} onChange={event=>setProfileDraft({...profile,gpa:event.target.value?Number(event.target.value):0})}/></label>
                  <label className="field"><span>GPA scale</span><select className="form-control" value={profile.gpaScale} onChange={event=>setProfileDraft({...profile,gpaScale:Number(event.target.value)})}><option value={4}>4.0</option><option value={5}>5.0</option><option value={10}>10.0</option><option value={100}>100</option></select></label>
                  <label className="field"><span>IELTS overall band</span><input className="form-control" type="number" min="0" max="9" step="0.5" value={profile.ielts||""} onChange={event=>setProfileDraft({...profile,ielts:event.target.value?Number(event.target.value):0})}/></label>
                </div>
                <label className="field"><span>Target countries</span><input className="form-control" maxLength={1000} value={profile.targetCountries} onChange={event=>setProfileDraft({...profile,targetCountries:event.target.value})}/></label>
                <label className="toggle-row"><input type="checkbox" checked={profile.fundingRequired} onChange={event=>setProfileDraft({...profile,fundingRequired:event.target.checked})}/><span>Looking for funded opportunities</span></label>
                <label className="field"><span>Skills</span><textarea className="form-control" rows={2} maxLength={2000} value={profile.skills} onChange={event=>setProfileDraft({...profile,skills:event.target.value})}/></label>
                <label className="field"><span>Research interests</span><textarea className="form-control" rows={2} maxLength={2000} value={profile.interests} onChange={event=>setProfileDraft({...profile,interests:event.target.value})}/></label>
                <label className="field"><span>Projects / research work</span><textarea className="form-control" rows={3} maxLength={10000} value={profile.projects} onChange={event=>setProfileDraft({...profile,projects:event.target.value})}/></label>
                <label className="field"><span>Research statement</span><textarea className="form-control" rows={3} maxLength={10000} value={profile.statement} onChange={event=>setProfileDraft({...profile,statement:event.target.value})}/></label>
              </section>
              <button className="btn btn-primary full" type="submit" disabled={busy}><Check size={15}/> Save personal & academic profile</button>
            </form>}
            <div className="admin-workspace-counts"><div><BriefcaseBusiness size={16}/><span>Tracked items</span><strong>{workspace?.tracked.length||0}</strong></div><div><BookOpen size={16}/><span>Outreach drafts</span><strong>{workspace?.recipients.length||0}</strong></div></div>
            {workspace?.tracked.length?<div className="admin-project-block"><h3>Application tracker ({workspace.tracked.length})</h3>{workspace.tracked.map(item=><div className="admin-compact-row" key={`${item.kind}-${item.id}`}><span>{item.title}</span><small>{item.stage}</small></div>)}</div>:null}
            {workspace?.recipients.length?<div className="admin-project-block"><h3>Outreach researchers ({workspace.recipients.length})</h3>{workspace.recipients.map(item=><div className="admin-compact-row" key={item.id}><span>{item.professor.name}</span><small>{item.approved?"Reviewed":"Draft"}</small></div>)}</div>:null}
            <button className="btn btn-danger full" disabled={busy||selectedUser.id===currentUserId} onClick={()=>void deleteUser(selectedUser)}><Trash2 size={16}/> Delete account and workspace</button>
            <p className="admin-footnote">Account deletion is permanent and cascades to sessions and saved workspace data.</p>
          </>}
        </aside>
      </section>}

      {section==="exports"&&<section className="admin-section admin-export-grid">
        <article className="panel admin-panel admin-export-card">
          <span className="admin-export-icon personal"><Users size={20}/></span>
          <h2>Personal information CSV</h2>
          <p>Separate export for account identity, profile contact details, account role, and join date.</p>
          <a className="btn btn-primary" href="/api/admin/export?type=personal"><Download size={16}/> Download personal CSV</a>
          <small>{users.length} user records · personal data only</small>
        </article>
        <article className="panel admin-panel admin-export-card">
          <span className="admin-export-icon academic"><GraduationCap size={20}/></span>
          <h2>Academic information CSV</h2>
          <p>Separate export for university, study goals, GPA, language score, interests, projects, and statement.</p>
          <a className="btn btn-primary" href="/api/admin/export?type=academic"><Download size={16}/> Download academic CSV</a>
          <small>{users.length} user records · academic profile only</small>
        </article>
        <p className="admin-export-note"><ShieldCheck size={16}/> Exports are administrator-only downloads. Passwords, session tokens, tracker entries, and outreach drafts are not included.</p>
      </section>}

      {section==="website"&&<section className="admin-section">
        <section className="panel admin-panel admin-route-panel">
          <div className="admin-panel-head"><div><h2>Website routes & APIs</h2><p>Current application routes and their access boundaries. Routes are defined by the application; access rules are enforced server-side.</p></div><Globe size={19}/></div>
          <div className="admin-routes-grid">{siteRoutes.map(route=><article className="admin-route-item" key={route.path}><strong>{route.name}</strong><code>{route.path}</code><span>{route.access}</span></article>)}</div>
          <p className="admin-footnote">Route paths are part of the application and are not dynamically created or deleted from this panel.</p>
        </section>
      </section>}

      {(section==="website"||section==="professors")&&<section className="admin-section">
        <div className="admin-catalog-intro"><div><h2>{section==="professors"?"Professor and researcher directory":"Shared website content"}</h2><p>{section==="professors"?"Manage curated professor examples shown to all users. Live OpenAlex search results are not stored in this directory.":"Manage the shared opportunity catalog used across researcher pages."}</p></div>{section==="website"&&<span className="count-pill">{catalog.opportunities.length} opportunities</span>}</div>
        {section==="website"?<div className="admin-catalog-layout">
          <div className="panel admin-panel admin-catalog-list"><div className="admin-panel-head"><div><h2>Opportunity examples</h2><p>Update shared titles, criteria, and descriptions.</p></div><button className="btn btn-primary btn-small" onClick={()=>{setOpportunityDraft(emptyOpportunity);setEditingId("");setError("");}}><Plus size={15}/> Add</button></div>
            {catalog.opportunities.map(item=><article className="admin-catalog-item" key={item.id}><div><strong>{item.title}</strong><small>{item.organization} · {item.country}</small><span>{item.type} · {item.area} {item.funded?"· Funding example":""}</span></div><div className="admin-catalog-actions"><button className="btn btn-light btn-small" onClick={()=>startOpportunityEdit(item)}>Edit</button><button className="admin-icon-danger" aria-label={`Delete ${item.title}`} disabled={busy} onClick={()=>{if(window.confirm(`Remove "${item.title}" from the shared opportunity catalog?`))void saveCatalog({...catalog,opportunities:catalog.opportunities.filter(entry=>entry.id!==item.id)});}}><Trash2 size={15}/></button></div></article>)}
          </div>
          <form className="panel admin-panel admin-editor-form" onSubmit={submitOpportunity}>
            <div className="admin-panel-head"><div><h2>{editingId?"Edit opportunity":"Add opportunity"}</h2><p>Changes are published immediately after saving.</p></div></div>
            <label className="field"><span>Title</span><input className="form-control" required value={opportunityDraft.title} onChange={event=>setOpportunityDraft({...opportunityDraft,title:event.target.value})}/></label>
            <div className="form-grid"><label className="field"><span>Organization</span><input className="form-control" required value={opportunityDraft.organization} onChange={event=>setOpportunityDraft({...opportunityDraft,organization:event.target.value})}/></label><label className="field"><span>Country</span><input className="form-control" required value={opportunityDraft.country} onChange={event=>setOpportunityDraft({...opportunityDraft,country:event.target.value})}/></label>
              <label className="field"><span>Type</span><input className="form-control" required value={opportunityDraft.type} onChange={event=>setOpportunityDraft({...opportunityDraft,type:event.target.value})}/></label><label className="field"><span>Area</span><input className="form-control" required value={opportunityDraft.area} onChange={event=>setOpportunityDraft({...opportunityDraft,area:event.target.value})}/></label>
              <label className="field"><span>Minimum GPA</span><input className="form-control" type="number" step="0.01" value={opportunityDraft.gpaMin??""} onChange={event=>setOpportunityDraft({...opportunityDraft,gpaMin:event.target.value?Number(event.target.value):null})}/></label><label className="field"><span>Minimum IELTS</span><input className="form-control" type="number" step="0.5" value={opportunityDraft.ieltsMin??""} onChange={event=>setOpportunityDraft({...opportunityDraft,ieltsMin:event.target.value?Number(event.target.value):null})}/></label></div>
            <label className="field"><span>Required skills (comma separated)</span><input className="form-control" value={opportunityDraft.skills} onChange={event=>setOpportunityDraft({...opportunityDraft,skills:event.target.value})}/></label>
            <label className="field"><span>Description</span><textarea className="form-control" rows={3} required value={opportunityDraft.description} onChange={event=>setOpportunityDraft({...opportunityDraft,description:event.target.value})}/></label>
            <label className="toggle-row"><input type="checkbox" checked={opportunityDraft.funded} onChange={event=>setOpportunityDraft({...opportunityDraft,funded:event.target.checked})}/> Funding included in this example</label>
            <div className="admin-form-actions"><button type="submit" className="btn btn-primary" disabled={busy}>{busy?<LoaderCircle className="spin" size={15}/>:<Check size={15}/>} Save opportunity</button>{editingId&&<button type="button" className="btn btn-light" onClick={()=>{setOpportunityDraft(emptyOpportunity);setEditingId("");}}>Cancel</button>}</div>
          </form>
        </div>:<div className="admin-catalog-layout">
          <div className="panel admin-panel admin-catalog-list"><div className="admin-panel-head"><div><h2>Researcher examples</h2><p>Maintain the sample profiles shown to all users.</p></div><button className="btn btn-primary btn-small" onClick={()=>{setProfessorDraft(emptyProfessor);setEditingId("");setError("");}}><Plus size={15}/> Add</button></div>
            {catalog.professors.map(item=><article className="admin-catalog-item" key={item.id}><div><strong>{item.name}</strong><small>{item.institution} · {item.country}</small><span>{item.topics.join(", ")}</span></div><div className="admin-catalog-actions"><button className="btn btn-light btn-small" onClick={()=>startProfessorEdit(item)}>Edit</button><button className="admin-icon-danger" aria-label={`Delete ${item.name}`} disabled={busy} onClick={()=>{if(window.confirm(`Remove "${item.name}" from the shared researcher examples?`))void saveCatalog({...catalog,professors:catalog.professors.filter(entry=>entry.id!==item.id)});}}><Trash2 size={15}/></button></div></article>)}
          </div>
          <form className="panel admin-panel admin-editor-form" onSubmit={submitProfessor}>
            <div className="admin-panel-head"><div><h2>{editingId?"Edit researcher":"Add researcher"}</h2><p>Do not imply availability unless it is verified.</p></div></div>
            <label className="field"><span>Name</span><input className="form-control" required value={professorDraft.name} onChange={event=>setProfessorDraft({...professorDraft,name:event.target.value})}/></label>
            <label className="field"><span>Institution</span><input className="form-control" required value={professorDraft.institution} onChange={event=>setProfessorDraft({...professorDraft,institution:event.target.value})}/></label>
            <div className="form-grid"><label className="field"><span>Country</span><input className="form-control" required value={professorDraft.country} onChange={event=>setProfessorDraft({...professorDraft,country:event.target.value})}/></label><label className="field"><span>Source URL</span><input className="form-control" type="url" value={professorDraft.url} onChange={event=>setProfessorDraft({...professorDraft,url:event.target.value})}/></label></div>
            <label className="field"><span>Research topics (comma separated)</span><input className="form-control" value={professorDraft.topics} onChange={event=>setProfessorDraft({...professorDraft,topics:event.target.value})}/></label>
            <label className="field"><span>Representative research</span><textarea className="form-control" rows={3} required value={professorDraft.paper} onChange={event=>setProfessorDraft({...professorDraft,paper:event.target.value})}/></label>
            <div className="admin-form-actions"><button type="submit" className="btn btn-primary" disabled={busy}>{busy?<LoaderCircle className="spin" size={15}/>:<Check size={15}/>} Save researcher</button>{editingId&&<button type="button" className="btn btn-light" onClick={()=>{setProfessorDraft(emptyProfessor);setEditingId("");}}>Cancel</button>}</div>
          </form>
        </div>}
      </section>}
    </>}
  </div>;
}
