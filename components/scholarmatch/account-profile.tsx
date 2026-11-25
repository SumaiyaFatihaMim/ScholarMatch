"use client";
import {useEffect,useState,type FormEvent} from "react";
import {useRouter} from "next/navigation";
import {KeyRound,Save,UserRound} from "lucide-react";
import {first} from "./ui";
import {useScholarMatch} from "./provider";

export default function AccountProfile({initialError=""}:{initialError?:string}){
  const {account,setProfile}=useScholarMatch();
  const router=useRouter();
  const [name,setName]=useState(account.name);
  const [email,setEmail]=useState(account.email);
  const [currentPassword,setCurrentPassword]=useState("");
  const [accountError,setAccountError]=useState(initialError);
  const [accountMessage,setAccountMessage]=useState("");
  const [passwordError,setPasswordError]=useState("");
  const [passwordMessage,setPasswordMessage]=useState("");
  const [savingAccount,setSavingAccount]=useState(false);
  const [changingPassword,setChangingPassword]=useState(false);

  useEffect(()=>{
    setName(account.name);
    setEmail(account.email);
  },[account.name,account.email]);

  async function saveAccount(event:FormEvent<HTMLFormElement>){
    event.preventDefault();
    setSavingAccount(true);
    setAccountError("");
    setAccountMessage("");
    try{
      const response=await fetch("/api/auth/account",{
        method:"POST",
        headers:{"content-type":"application/json"},
        body:JSON.stringify({name,email,currentPassword}),
      });
      const result=await response.json();
      if(!response.ok)throw new Error(result.error||"Could not update your account.");
      const updatedName=String(result.user?.name||name).trim();
      const updatedEmail=String(result.user?.email||email).trim().toLowerCase();
      setName(updatedName);
      setEmail(updatedEmail);
      setProfile({name:updatedName,email:updatedEmail});
      setCurrentPassword("");
      setAccountMessage("Account information saved.");
      router.refresh();
    }catch(error){
      setAccountError(error instanceof Error?error.message:"Could not update your account.");
    }finally{
      setSavingAccount(false);
    }
  }

  async function updatePassword(event:FormEvent<HTMLFormElement>){
    event.preventDefault();
    const form=event.currentTarget;
    setChangingPassword(true);
    setPasswordError("");
    setPasswordMessage("");
    const values=new FormData(form);
    try{
      const response=await fetch("/api/auth/password",{
        method:"POST",
        headers:{"content-type":"application/json"},
        body:JSON.stringify({
          currentPassword:values.get("currentPassword"),
          newPassword:values.get("newPassword"),
          confirmPassword:values.get("confirmPassword"),
        }),
      });
      const result=await response.json();
      if(!response.ok)throw new Error(result.error||"Could not change your password.");
      form.reset();
      setPasswordMessage("Password changed. Other active sessions were signed out.");
    }catch(error){
      setPasswordError(error instanceof Error?error.message:"Could not change your password.");
    }finally{
      setChangingPassword(false);
    }
  }

  return <section className="account-profile-grid">
    <article className="panel account-profile-card">
      <div className="section-head"><div><h2>Account information</h2><p>Update your sign-in name and email.</p></div><UserRound size={21}/></div>
      <div className="settings-account"><span className="settings-account-avatar" role="img" aria-label={`Profile avatar for ${name}`}>{first(name)}</span><div><strong>{name}</strong><span>{email}</span></div></div>
      <form method="post" action="/api/auth/account" onSubmit={saveAccount} className="account-form">
        <label className="field"><span>Full name</span><input className="form-control" name="name" autoComplete="name" minLength={2} maxLength={100} required value={name} onChange={event=>setName(event.target.value)}/></label>
        <label className="field"><span>Sign-in email</span><input className="form-control" name="email" type="email" autoComplete="email" maxLength={254} required value={email} onChange={event=>setEmail(event.target.value)}/></label>
        <label className="field"><span>Current password to save account changes</span><input className="form-control" name="currentPassword" type="password" autoComplete="current-password" required value={currentPassword} onChange={event=>setCurrentPassword(event.target.value)}/></label>
        {accountError&&<p className="auth-error" role="alert">{accountError}</p>}
        {accountMessage&&<p className="account-success" role="status">{accountMessage}</p>}
        <button className="btn btn-primary" type="submit" disabled={savingAccount}><Save size={16}/>{savingAccount?"Saving…":"Save account"}</button>
      </form>
      <p className="fineprint">Changing your email changes the address you use to sign in. Email verification is not configured in this local demo.</p>
    </article>
    <article className="panel account-profile-card">
      <div className="section-head"><div><h2>Change password</h2><p>Use your current password to set a new one.</p></div><KeyRound size={21}/></div>
      <form method="post" action="/api/auth/password" onSubmit={updatePassword} className="account-form">
        <label className="field"><span>Current password</span><input className="form-control" name="currentPassword" type="password" autoComplete="current-password" maxLength={128} required/></label>
        <label className="field"><span>New password</span><input className="form-control" name="newPassword" type="password" autoComplete="new-password" minLength={8} maxLength={128} required/></label>
        <label className="field"><span>Confirm new password</span><input className="form-control" name="confirmPassword" type="password" autoComplete="new-password" minLength={8} maxLength={128} required/></label>
        {passwordError&&<p className="auth-error" role="alert">{passwordError}</p>}
        {passwordMessage&&<p className="account-success" role="status">{passwordMessage}</p>}
        <button className="btn btn-primary" type="submit" disabled={changingPassword}><KeyRound size={16}/>{changingPassword?"Updating…":"Update password"}</button>
      </form>
    </article>
  </section>;
}
