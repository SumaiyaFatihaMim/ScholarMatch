"use client";
import {createContext,useCallback,useContext,useEffect,useMemo,useRef,useState,type ReactNode} from "react";
import {usePathname,useRouter} from "next/navigation";
import {initialProfile,initialStore,opportunities,sampleProfessors,type Profile,type Professor,type Stage,type Store,type View} from "@/lib/data";
import {buildDraft,extractBasicCV,gapActions,profileStrength,scoreOpportunity,scoreProfessor,tier} from "@/lib/matching";
import {isValidWorkspace} from "@/lib/workspace-validation";
import {asList} from "./ui";
import {pathToView,VIEW_PATHS} from "./routes";

function useStateValue(userId:string,userName:string,userEmail:string,isAdmin:boolean){
  const [store,setStore]=useState<Store>(()=>({...initialStore,profile:{...initialProfile,name:userName,email:userEmail}}));
  const [hydrated,setHydrated]=useState(false);
  const [workspaceSyncReady,setWorkspaceSyncReady]=useState(false);
  const [workspaceSyncError,setWorkspaceSyncError]=useState("");
  const [opportunityCatalog,setOpportunityCatalog]=useState(opportunities);
  const [professorCatalog,setProfessorCatalog]=useState(sampleProfessors);
  const workspaceSaveQueue=useRef(Promise.resolve());
  const storageKey=`scholarmatch-demo-v2-${userId}-${encodeURIComponent(userEmail.trim().toLowerCase())}`;
  const pathname=usePathname();
  const router=useRouter();
  const view=pathToView(pathname);
  const [toast,setToast]=useState("");
  const [mobileMenu,setMobileMenu]=useState(false);
  const [oppQuery,setOppQuery]=useState("");
  const [country,setCountry]=useState("All countries");
  const [fundedOnly,setFundedOnly]=useState(false);
  const [profSearch,setProfSearch]=useState("");
  const [liveProfessors,setLiveProfessors]=useState<Professor[]>([]);
  const [researchLoading,setResearchLoading]=useState(false);
  const [researchError,setResearchError]=useState("");
  const [file,setFile]=useState<File|null>(null);
  const [cvText,setCvText]=useState("");
  const [extracting,setExtracting]=useState(false);
  const [activeOpportunity,setActiveOpportunity]=useState<string|null>(null);

  useEffect(()=>{
    let cancelled=false;
    const localStore=()=>{
      try{
        const saved=localStorage.getItem(storageKey);
        if(saved){
          const obj=JSON.parse(saved) as Partial<Store>;
          if(obj?.profile&&Array.isArray(obj.tracked)&&Array.isArray(obj.recipients)){
            const profile={...initialProfile,...obj.profile};
            if(profile.name===initialProfile.name)profile.name=userName;
            if(!profile.email)profile.email=userEmail;
            return {...initialStore,...obj,profile,tracked:obj.tracked,recipients:obj.recipients,customProfessors:obj.customProfessors||[]};
          }
        }
      }catch{}
      return {...initialStore,profile:{...initialProfile,name:userName,email:userEmail}};
    };
    const load=async()=>{
      const local=localStore();
      setWorkspaceSyncReady(false);
      try{
        const response=await fetch("/api/workspace");
        const data=await response.json();
        if(!response.ok)throw new Error(data.error||"Could not load your saved workspace.");
        if(data.workspace!==null&&data.workspace!==undefined&&!isValidWorkspace(data.workspace)){
          throw new Error("Your saved workspace has invalid data. It was not overwritten; contact support.");
        }
        if(cancelled)return;
        if(!cancelled){
          if(data.workspace)setStore({...data.workspace,customProfessors:data.workspace.customProfessors||[]});
          else setStore(local);
          if(Array.isArray(data.opportunities))setOpportunityCatalog(data.opportunities);
          if(Array.isArray(data.professors))setProfessorCatalog(data.professors);
        }
        if(!data.workspace){
          const saved=await fetch("/api/workspace",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({workspace:local})});
          const result=await saved.json();
          if(!saved.ok)throw new Error(result.error||"Could not move your saved data to your account.");
        }
        if(!cancelled){
          setWorkspaceSyncError("");
          setWorkspaceSyncReady(true);
        }
      }catch(error){
        if(!cancelled){
          setStore(local);
          setWorkspaceSyncError(error instanceof Error?error.message:"Workspace sync is unavailable.");
        }
      }finally{if(!cancelled)setHydrated(true);}
    };
    void load();
    return ()=>{cancelled=true;};
  },[storageKey,userName,userEmail]);
  useEffect(()=>{try{const cached=sessionStorage.getItem("scholarmatch-live-professors-v1");if(cached){const parsed=JSON.parse(cached);if(Array.isArray(parsed))setLiveProfessors(parsed);}}catch{}},[]);
  useEffect(()=>{if(hydrated){try{localStorage.setItem(storageKey,JSON.stringify(store));}catch{setWorkspaceSyncError("This browser could not save a local backup of your workspace.");}}},[store,hydrated,storageKey]);
  useEffect(()=>{
    if(!hydrated||!workspaceSyncReady)return;
    if(!isValidWorkspace(store)){
      setWorkspaceSyncError("Some profile or workspace fields are invalid. Correct them to sync your changes.");
      return;
    }
    const workspace=JSON.stringify({workspace:store});
    workspaceSaveQueue.current=workspaceSaveQueue.current.catch(()=>{}).then(async()=>{
      const response=await fetch("/api/workspace",{method:"PUT",headers:{"Content-Type":"application/json"},body:workspace});
      const data=await response.json();
      if(!response.ok)throw new Error(data.error||"Could not sync your workspace.");
      setWorkspaceSyncError("");
    }).catch(error=>{
      setWorkspaceSyncError(error instanceof Error?error.message:"Workspace sync is unavailable.");
    });
  },[store,hydrated,workspaceSyncReady]);
  useEffect(()=>{
    const reloadCatalog=async()=>{
      try{
        const response=await fetch("/api/workspace");
        const data=await response.json();
        if(!response.ok)throw new Error(data.error||"Could not refresh the platform catalog.");
        if(Array.isArray(data.opportunities))setOpportunityCatalog(data.opportunities);
        if(Array.isArray(data.professors))setProfessorCatalog(data.professors);
      }catch(error){setToast(error instanceof Error?error.message:"Could not refresh the platform catalog.");}
    };
    window.addEventListener("scholarmatch-catalog-updated",reloadCatalog);
    return ()=>window.removeEventListener("scholarmatch-catalog-updated",reloadCatalog);
  },[]);
  useEffect(()=>{if(hydrated)sessionStorage.setItem("scholarmatch-live-professors-v1",JSON.stringify(liveProfessors));},[liveProfessors,hydrated]);
  const notify=useCallback((message:string)=>{setToast(message);window.setTimeout(()=>setToast(""),3500);},[]);
  const navigate=(next:View)=>{setMobileMenu(false);setActiveOpportunity(null);router.push(VIEW_PATHS[next]);window.scrollTo({top:0,behavior:"smooth"});};
  const setProfile=(patch:Partial<Profile>)=>setStore(s=>({...s,profile:{...s.profile,...patch}}));
  const reset=()=>{if(window.confirm("Reset profile, tracker and outreach drafts to the example?")){setStore({...initialStore,profile:{...initialProfile,name:userName,email:userEmail}});setLiveProfessors([]);notify("Demo data reset");}};
  const p=store.profile;
  const strength=profileStrength(p);
  const matchList=useMemo(()=>opportunityCatalog.map(o=>({...o,fit:scoreOpportunity(p,o)})).sort((a,b)=>b.fit.score-a.fit.score),[p,opportunityCatalog]);
  const eligible=matchList.filter(o=>o.fit.eligibility!=="Not met");
  const strong=eligible.filter(o=>o.fit.score>=60).length;
  const actions=useMemo(()=>gapActions(p,opportunityCatalog),[p,opportunityCatalog]);
  const professors=[...(liveProfessors.length?liveProfessors:professorCatalog),...(store.customProfessors||[])];
  const ranked=useMemo(()=>professors.map(x=>({...x,score:scoreProfessor(p,x)})).sort((a,b)=>b.score-a.score),[professors,p]);
  const shownOpp=matchList.filter(o=>{
    const t=`${o.title} ${o.organization} ${o.country} ${o.area}`.toLowerCase();
    return t.includes(oppQuery.toLowerCase())&&(country==="All countries"||o.country===country)&&(!fundedOnly||o.funded);
  });
  const countries=["All countries",...new Set(opportunityCatalog.map(x=>x.country))];

  const addTracked=(kind:"opportunity"|"professor",id:string,title:string,subtitle:string)=>{
    if(store.tracked.some(x=>x.id===id&&x.kind===kind)){notify("Already in your tracker");return;}
    setStore(s=>({...s,tracked:[...s.tracked,{kind,id,title,subtitle,stage:"Interested"}]}));
    notify("Added to application tracker");
  };
  const addRecipient=(pr:Professor)=>{
    if(store.recipients.some(x=>x.professor.id===pr.id)){notify("Professor already in your outreach list");return;}
    setStore(s=>({...s,recipients:[...s.recipients,{id:pr.id,professor:pr,approved:false}]}));
    notify("Added to outreach drafts");
  };
  const addCustomProfessor=(details:Omit<Professor,"id"|"source"|"accepting">)=>{
    const duplicate=(store.customProfessors||[]).some(pr=>pr.name.trim().toLowerCase()===details.name.trim().toLowerCase()
      &&pr.institution.trim().toLowerCase()===details.institution.trim().toLowerCase());
    if(duplicate){notify("This professor is already in your list");return false;}
    const professor:Professor={...details,id:`student-${crypto.randomUUID()}`,source:"user",accepting:"Unknown"};
    setStore(s=>({...s,customProfessors:[...(s.customProfessors||[]),professor]}));
    notify("Professor added to your list");
    return true;
  };
  const copy=async(text:string)=>{try{await navigator.clipboard.writeText(text);notify("Copied to clipboard");}catch{notify("Clipboard unavailable; select and copy the text manually");}};
  const onSearch=async()=>{
    if(profSearch.trim().length<3){notify("Enter a research topic of at least 3 characters");return;}
    setResearchLoading(true);setResearchError("");
    try{
      const response=await fetch(`/api/openalex?q=${encodeURIComponent(profSearch.trim())}`);
      const data=await response.json();
      if(!response.ok)throw new Error(data.error||"OpenAlex request failed");
      if(!Array.isArray(data.professors)||!data.professors.length){setResearchError("No authors found. Try a broader research topic.");return;}
      setLiveProfessors(data.professors);
      notify(`${data.professors.length} research authors found via OpenAlex`);
    }catch(e){setResearchError(e instanceof Error?e.message:"Research search unavailable");}finally{setResearchLoading(false);}
  };
  const doBasicExtract=async()=>{
    let text=cvText.trim();
    if(file&&/\.(txt|md)$/i.test(file.name))text=(await file.text()).slice(0,100000);
    if(!text){notify("Paste CV text or upload a TXT/MD file. PDF/DOCX uses the AI extraction button.");return;}
    const patch=extractBasicCV(text);
    if(Object.keys(patch).length){setProfile(patch);notify("Possible fields extracted — review all values");}
    else notify("No common GPA, IELTS, email or skills found; enter details manually");
  };
  const doAIExtract=async()=>{
    if(!file){notify("Choose a PDF, DOCX, TXT, or MD CV first");return;}
    setExtracting(true);
    try{
      const data=new FormData();data.append("file",file);
      const res=await fetch("/api/ai/extract",{method:"POST",body:data});
      const result=await res.json();
      if(!res.ok)throw new Error(result.error||"Extraction failed");
      setProfile(result.profile||{});
      notify("AI fields extracted — please verify before relying on them");
    }catch(e){notify(e instanceof Error?e.message:"Extraction failed");}finally{setExtracting(false);}
  };
  const exportData=()=>{
    const blob=new Blob([JSON.stringify(store,null,2)],{type:"application/json"});const a=document.createElement("a");const url=URL.createObjectURL(blob);
    a.href=url;a.download="scholarmatch-demo-data.json";a.click();URL.revokeObjectURL(url);
  };
  const profileFields= [
    ["Field of study",p.field],["Research interests",p.interests],["Projects",p.projects],["Skills",p.skills]
  ];

  return {store,setStore,hydrated,workspaceSyncError,view,account:{name:userName,email:userEmail,isAdmin},toast,setToast,mobileMenu,setMobileMenu,
    opportunities:opportunityCatalog,sampleProfessors:professorCatalog,
    oppQuery,setOppQuery,country,setCountry,fundedOnly,setFundedOnly,
    profSearch,setProfSearch,liveProfessors,setLiveProfessors,researchLoading,researchError,
    file,setFile,cvText,setCvText,extracting,activeOpportunity,setActiveOpportunity,
    notify,navigate,setProfile,reset,p,strength,matchList,eligible,strong,actions,
    professors,ranked,shownOpp,countries,addTracked,addRecipient,addCustomProfessor,copy,onSearch,
    doBasicExtract,doAIExtract,exportData,profileFields};
}
type StateValue=ReturnType<typeof useStateValue>;
const ScholarMatchContext=createContext<StateValue|null>(null);
export function ScholarMatchProvider({children,userId,userName,userEmail,isAdmin}:{children:ReactNode;userId:string;userName:string;userEmail:string;isAdmin:boolean}){
 const value=useStateValue(userId,userName,userEmail,isAdmin);
 return <ScholarMatchContext.Provider value={value}>{children}</ScholarMatchContext.Provider>;
}
export function useScholarMatch(){
 const value=useContext(ScholarMatchContext);
 if(!value)throw new Error("useScholarMatch must be used within ScholarMatchProvider");
 return value;
}
