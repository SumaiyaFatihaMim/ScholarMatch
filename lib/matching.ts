import type { Opportunity, Professor, Profile } from "./data";

const normal = (s: string) => s.toLowerCase().replace(/[^a-z0-9\s]/g," ").replace(/\s+/g," ").trim();
const tokens = (s:string) => new Set(normal(s).split(" ").filter(x=>x.length>=3));

function overlap(a:string,b:string): number {
  const aa = tokens(a), bb = tokens(b);
  if (!aa.size || !bb.size) return 0;
  const shared = [...bb].filter(word=>aa.has(word)).length;
  return shared / bb.size;
}
export type Fit = { score:number; eligibility:"Pass"|"Not met"|"Unknown"; academic:number; research:number; skills:number; experience:number; reasons:string[]; gaps:string[] };

export function scoreOpportunity(p:Profile,o:Opportunity):Fit {
  const reasons:string[] = [], gaps:string[] = [];
  let eligibility:Fit["eligibility"]="Pass";
  const gpa=p.gpaScale>0 ? p.gpa/p.gpaScale*4 : 0;
  if (o.gpaMin !== null) {
    if(!p.gpa){eligibility="Unknown";gaps.push("GPA not provided");}
    else if (gpa<o.gpaMin){eligibility="Not met";gaps.push(`GPA ${gpa.toFixed(2)} / 4.0 below stated sample minimum ${o.gpaMin}`);}
    else reasons.push("GPA meets the sample threshold");
  } else if (eligibility==="Pass") eligibility="Unknown";
  if (o.ieltsMin !== null){
    if(!p.ielts){if(eligibility!=="Not met")eligibility="Unknown";gaps.push("IELTS score not provided");}
    else if(p.ielts<o.ieltsMin){eligibility="Not met";gaps.push(`IELTS ${p.ielts} below sample minimum ${o.ieltsMin}`);}
    else reasons.push("IELTS meets the sample threshold");
  } else if (eligibility==="Pass") eligibility="Unknown";
  const acadG=o.gpaMin === null ? 0.7 : !p.gpa ? 0.3 : Math.min(1,gpa/o.gpaMin);
  const acadI=o.ieltsMin === null ? 0.7 : !p.ielts ? 0.3 : Math.min(1,p.ielts/o.ieltsMin);
  const academic=(acadG+acadI)/2;
  const research=Math.min(1,0.2+overlap(`${p.field} ${p.interests} ${p.statement} ${p.projects}`,`${o.area} ${o.description}`)*2);
  const skills= o.skills.length ? o.skills.filter(x=>normal(p.skills).includes(normal(x)) || overlap(p.skills,x)>=0.5).length/o.skills.length : 0.5;
  const experience= Math.min(1,0.35 + (p.projects.trim()?0.38:0) + (p.statement.trim()?0.15:0));
  if(research>0.55)reasons.push("Research interests align with this sample field");
  if(skills>0.5)reasons.push("Relevant skills are present");
  if(skills<1)gaps.push(`Add evidence of ${o.skills.filter(x=>!normal(p.skills).includes(normal(x))).join(", ") || "relevant skills"}`);
  const weighted=Math.round((academic*35+research*30+skills*15+experience*20));
  // A confirmed hard-gate failure is not merely a poor match score.
  const score=eligibility==="Not met" ? 0 : weighted;
  return {score,eligibility,academic:Math.round(academic*35),research:Math.round(research*30),skills:Math.round(skills*15),experience:Math.round(experience*20),reasons,gaps};
}
export function scoreProfessor(p:Profile,prof:Professor):number {
  const student=`${p.field} ${p.interests} ${p.projects} ${p.statement} ${p.skills}`;
  const match=overlap(student,prof.topics.join(" ")+" "+prof.paper);
  return Math.round(Math.min(90,Math.max(35,45+match*57)));
}
export function tier(score:number):"Reach"|"Match"|"Explore" {
  if(score>=72)return "Match";
  if(score>=55)return "Explore";
  return "Reach";
}
export function gapActions(profile:Profile, items:Opportunity[]) {
  const curr=items.filter(o=>scoreOpportunity(profile,o).eligibility!=="Not met" && scoreOpportunity(profile,o).score>=60).length;
  const test=(patch:Partial<Profile>)=>items.filter(o=>scoreOpportunity({...profile,...patch},o).eligibility!=="Not met" && scoreOpportunity({...profile,...patch},o).score>=60).length-curr;
  return [
    {title:"Improve language-test readiness",detail:`Current IELTS ${profile.ielts||"not entered"}. Compare with sample requirements and plan a realistic target.`,impact:test({ielts:Math.max(profile.ielts||0,7)}),label:"IELTS 7.0"},
    {title:"Strengthen academic eligibility",detail:"Review opportunities with GPA requirements and check whether the published rules offer alternatives.",impact:test({gpa:Math.max(profile.gpa,3.5/profile.gpaScale*4)}),label:"GPA 3.5 / 4.0"},
    {title:"Evidence relevant experience",detail:"Describe projects, research contributions, and measurable results in your application.",impact:test({projects:profile.projects+" Python NLP research machine learning"}),label:"Project evidence"},
  ].sort((a,b)=>b.impact-a.impact);
}
export function profileStrength(p:Profile){
  const values=[p.name!=="Demo Student"&&p.name.trim().length>0,p.email.includes("@"),p.gpa>0,p.ielts>0,p.skills.trim().length>0,p.interests.trim().length>0,p.projects.trim().length>0,p.statement.trim().length>0,p.targetCountries.trim().length>0];
  return Math.round(values.filter(Boolean).length/values.length*100);
}
export function extractBasicCV(text:string):Partial<Profile> {
  const gpa=text.match(/(?:CGPA|GPA)\s*(?::|=|-)?\s*(\d(?:\.\d{1,2})?)/i);
  const ielts=text.match(/IELTS\s*(?:(?:overall|band|score)\s*)?(?::|=|-)?\s*([4-9](?:\.5)?)/i);
  const email=text.match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i);
  const skillList=["Python","React","Next.js","TypeScript","Machine Learning","Natural Language Processing","NLP","PyTorch","TensorFlow","Java","SQL","PostgreSQL","Docker","Research","Data Analysis"];
  const skills=skillList.filter(s=>text.toLowerCase().includes(s.toLowerCase()));
  return { ...(gpa?{gpa:Number(gpa[1])}:{}),...(ielts?{ielts:Number(ielts[1])}:{}), ...(email?{email:email[0]}:{}), ...(skills.length?{skills:skills.join(", ")}:{}), };
}
export function buildDraft(p:Profile,prof:Professor): {subject:string;body:string} {
  // Do not assert the researcher's actual opening, a publication, or an email address.
  const common=prof.topics.filter(t=>overlap(`${p.interests} ${p.field} ${p.projects}`,t)>0);
  const topic=(common[0]||prof.topics[0]||"your research area");
  const subject=`Prospective ${p.degree} student — interest in ${topic}`;
  const name=p.name==="Demo Student"?"[Your name]":p.name;
  const body=`Dear ${prof.name},\n\nI am exploring ${p.degree} research opportunities in ${p.field || "my field"}. I was interested to learn about your work related to ${topic}.\n\nMy relevant background includes ${p.projects.trim() || "[briefly describe a verified project]"}. I am especially interested in ${p.interests.trim() || "[your research interests]"}.\n\nCould you let me know whether your group expects to consider new students, or whether there is an appropriate application route I should follow? I would be glad to share my CV and further details.\n\nThank you for your time.\n\nBest regards,\n${name}`;
  return {subject,body};
}
