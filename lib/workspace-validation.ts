import type {Professor,Profile,Store} from "./data";

const isRecord=(value:unknown):value is Record<string,unknown>=>Boolean(value)&&typeof value==="object"&&!Array.isArray(value);

export function isValidProfile(value:unknown):value is Profile{
  if(!isRecord(value))return false;
  const textFields=["name","email","university","graduationYear","field","skills","interests","projects","targetCountries","statement"] as const;
  if(textFields.some(field=>typeof value[field]!=="string"))return false;

  const name=value.name as string;
  const email=value.email as string;
  const graduationYear=value.graduationYear as string;
  if(name.trim().length<2||name.length>100
    ||email.length>254||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    ||(value.university as string).length>200
    ||(value.field as string).length>200||(value.skills as string).length>2000
    ||(value.interests as string).length>2000||(value.projects as string).length>10000
    ||(value.targetCountries as string).length>1000||(value.statement as string).length>10000)return false;
  if(graduationYear&&(!/^\d{4}$/.test(graduationYear)||Number(graduationYear)<1950||Number(graduationYear)>2100))return false;

  return (value.degree==="Master's"||value.degree==="PhD")
    &&typeof value.gpa==="number"&&Number.isFinite(value.gpa)&&value.gpa>=0
    &&typeof value.gpaScale==="number"&&[4,5,10,100].includes(value.gpaScale)&&value.gpa<=value.gpaScale
    &&typeof value.ielts==="number"&&Number.isFinite(value.ielts)&&value.ielts>=0&&value.ielts<=9
    &&typeof value.fundingRequired==="boolean";
}

function isValidProfessor(value:unknown):value is Professor{
  if(!isRecord(value))return false;
  return typeof value.id==="string"&&value.id.length<=500
    &&typeof value.name==="string"&&value.name.length<=200
    &&typeof value.institution==="string"&&value.institution.length<=200
    &&typeof value.country==="string"&&value.country.length<=100
    &&Array.isArray(value.topics)&&value.topics.length<=50
    &&value.topics.every(topic=>typeof topic==="string"&&topic.length<=200)
    &&typeof value.paper==="string"&&value.paper.length<=1000
    &&typeof value.url==="string"&&value.url.length<=1000
    &&(value.source==="sample"||value.source==="openalex"||value.source==="user")
    &&value.accepting==="Unknown";
}

export function isValidWorkspace(value:unknown):value is Store{
  if(!isRecord(value)||!isValidProfile(value.profile)||!Array.isArray(value.tracked)||!Array.isArray(value.recipients))return false;
  if(value.customProfessors!==undefined&&(!Array.isArray(value.customProfessors)
    ||value.customProfessors.length>200||value.customProfessors.some(item=>!isValidProfessor(item))))return false;

  if(value.tracked.length>500||value.tracked.some(item=>!isRecord(item)
    ||typeof item.id!=="string"||item.id.length>500
    ||typeof item.title!=="string"||item.title.length>500
    ||typeof item.subtitle!=="string"||item.subtitle.length>1000
    ||(item.kind!=="opportunity"&&item.kind!=="professor")
    ||!["Interested","Preparing","Applied","Interview","Result"].includes(String(item.stage))))return false;

  if(value.recipients.length>500||value.recipients.some(item=>!isRecord(item)
    ||typeof item.id!=="string"||item.id.length>500
    ||typeof item.approved!=="boolean"
    ||!isValidProfessor(item.professor)))return false;

  return JSON.stringify(value).length<=1_000_000;
}
