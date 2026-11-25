"use client";
import {Download,RefreshCw,Settings2,ShieldCheck} from "lucide-react";
import {useScholarMatch} from "../provider";
import {first} from "../ui";
export default function SettingsScreen(){
 const {account,store,exportData,reset}=useScholarMatch();
 return <><div className="page-heading"><div><div className="eyebrow">WORKSPACE SETTINGS</div><h1>Settings</h1><p>Manage your ScholarMatch account and saved workspace.</p></div></div>
 <div className="settings-grid"><section className="panel"><Settings2 size={24}/><h2>Account profile</h2><div className="settings-account"><span className="settings-account-avatar" role="img" aria-label={`Profile avatar for ${account.name}`}>{first(account.name)}</span><div><strong>{account.name}</strong><span>{account.email}</span></div></div><p>Authentication and your profile, tracker, and outreach drafts are stored in PostgreSQL and synced to this account.</p><p className="detail-meta">{store.tracked.length} tracked applications · {store.recipients.length} outreach drafts</p><button className="btn btn-light" onClick={exportData}><Download size={16}/> Export your workspace (JSON)</button></section>
 <section className="panel"><ShieldCheck size={24}/><h2>Privacy & reset</h2><p>Your account workspace is stored server-side and may be reviewed by platform administrators. AI extraction sends a selected CV to the configured provider only when requested.</p><button className="btn btn-light" onClick={reset}><RefreshCw size={16}/> Reset demo data</button></section></div>
 <div className="notice"><ShieldCheck size={18}/><span>Profile, project, application, and outreach data sync across devices for this account. Gmail integration and notifications are not configured.</span></div></>;
}
