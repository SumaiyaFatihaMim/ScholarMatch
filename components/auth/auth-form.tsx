"use client";
import {useState,type FormEvent} from "react";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {GraduationCap,LoaderCircle} from "lucide-react";

export default function AuthForm({mode,initialError=""}:{mode:"signin"|"signup";initialError?:string}){
  const router=useRouter();
  const [pending,setPending]=useState(false);
  const [error,setError]=useState(initialError);
  const isSignup=mode==="signup";

  async function submit(event:FormEvent<HTMLFormElement>){
    event.preventDefault();
    setPending(true);
    setError("");
    const values=new FormData(event.currentTarget);
    const payload={
      name:String(values.get("name")||""),
      email:String(values.get("email")||""),
      password:String(values.get("password")||""),
    };
    if(isSignup&&payload.password!==String(values.get("confirmPassword")||"")){
      setError("Passwords do not match.");
      setPending(false);
      return;
    }
    try{
      const response=await fetch(`/api/auth/${isSignup?"signup":"signin"}`,{
        method:"POST",
        headers:{"content-type":"application/json"},
        body:JSON.stringify(payload),
      });
      const result=await response.json();
      if(!response.ok)throw new Error(result.error||"Authentication failed.");
      router.replace(result.user?.isAdmin===true?"/admin":"/dashboard");
      router.refresh();
    }catch(cause){
      setError(cause instanceof Error?cause.message:"Could not connect. Please try again.");
      setPending(false);
    }
  }

  return <main className="auth-page">
    <section className="auth-card" aria-labelledby="auth-title">
      <Link href="/" className="auth-brand" aria-label="ScholarMatch home">
        <span className="auth-brand-mark"><GraduationCap size={24} strokeWidth={2.5}/></span>
        <span>Scholar<span>Match</span></span>
      </Link>
      <div className="auth-heading">
        <div className="eyebrow">{isSignup?"START YOUR JOURNEY":"WELCOME BACK"}</div>
        <h1 id="auth-title">{isSignup?"Create your account":"Sign in to ScholarMatch"}</h1>
        <p>{isSignup?"Build a focused path to your research goals.":"Continue where you left off on your research journey."}</p>
      </div>
      <form className="auth-form" method="post" action={`/api/auth/${isSignup?"signup":"signin"}`} onSubmit={submit}>
        {isSignup&&<label className="auth-field">Full name
          <input name="name" type="text" autoComplete="name" minLength={2} maxLength={100} required/>
        </label>}
        <label className="auth-field">Email address
          <input name="email" type="email" autoComplete="email" maxLength={254} required/>
        </label>
        <label className="auth-field">Password
          <input name="password" type="password" autoComplete={isSignup?"new-password":"current-password"} minLength={isSignup?8:1} maxLength={128} required/>
          {isSignup&&<small>Use at least 8 characters.</small>}
        </label>
        {isSignup&&<label className="auth-field">Confirm password
          <input name="confirmPassword" type="password" autoComplete="new-password" minLength={8} maxLength={128} required/>
        </label>}
        {error&&<p className="auth-error" role="alert">{error}</p>}
        <button className="btn btn-primary auth-submit" type="submit" disabled={pending}>
          {pending&&<LoaderCircle size={16} className="spin"/>}
          {pending?"Please wait…":isSignup?"Create account":"Sign in"}
        </button>
      </form>
      <p className="auth-switch">
        {isSignup?"Already have an account?":"New to ScholarMatch?"}{" "}
        <Link href={isSignup?"/sign-in":"/sign-up"}>{isSignup?"Sign in":"Create an account"}</Link>
      </p>
      <p className="auth-security">Your account is secured with a private server-side session.</p>
    </section>
  </main>;
}
