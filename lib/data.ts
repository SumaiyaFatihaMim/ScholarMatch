export type Degree = "Master's" | "PhD";
export type Stage = "Interested" | "Preparing" | "Applied" | "Interview" | "Result";
export type View = "overview" | "profile" | "explore" | "recommendations" | "outreach" | "tracker" | "settings";

export type Profile = {
  name: string;
  email: string;
  university: string;
  graduationYear: string;
  degree: Degree;
  field: string;
  gpa: number;
  gpaScale: number;
  ielts: number;
  skills: string;
  interests: string;
  projects: string;
  targetCountries: string;
  fundingRequired: boolean;
  statement: string;
};
export type Opportunity = {
  id: string;
  title: string;
  organization: string;
  country: string;
  type: string;
  area: string;
  gpaMin: number | null;
  ieltsMin: number | null;
  skills: string[];
  funded: boolean;
  description: string;
};
export type Professor = {
  id: string;
  name: string;
  institution: string;
  country: string;
  topics: string[];
  paper: string;
  url: string;
  source: "sample" | "openalex" | "user";
  accepting: "Unknown";
};
export type Tracked = { id: string; kind: "opportunity" | "professor"; title: string; subtitle: string; stage: Stage };
export type Recipient = { id: string; professor: Professor; approved: boolean };
export type Store = { profile: Profile; tracked: Tracked[]; recipients: Recipient[]; customProfessors?: Professor[] };

export const initialProfile: Profile = {
  name: "Demo Student", email: "", university: "", graduationYear: "", degree: "Master's", field: "Machine Learning",
  gpa: 3.2, gpaScale: 4, ielts: 6, skills: "Python, Machine Learning, Natural Language Processing, React",
  interests: "Multilingual NLP, AI, text classification", projects: "Multilingual text classification with transformer models",
  targetCountries: "Germany, Canada, Netherlands", fundingRequired: true,
  statement: "I am interested in reliable multilingual AI systems and applied natural language processing.",
};

// All opportunities are deliberately illustrative. There are no asserted real deadlines or funding awards.
export const opportunities: Opportunity[] = [
  { id:"o1",title:"Research Master's · Language AI",organization:"Demo University A",country:"Germany",type:"Master's",area:"Natural Language Processing",gpaMin:3.0,ieltsMin:6.5,skills:["Python","NLP"],funded:true,description:"Illustrative research-track program focused on multilingual language models." },
  { id:"o2",title:"Funded PhD · Trustworthy AI",organization:"Demo Institute B",country:"Canada",type:"PhD",area:"Machine Learning",gpaMin:3.3,ieltsMin:7,skills:["Python","Machine Learning"],funded:true,description:"Illustrative funded research position in robustness and model evaluation." },
  { id:"o3",title:"MSc · Data Science",organization:"Demo University C",country:"Netherlands",type:"Master's",area:"Data Science",gpaMin:3.0,ieltsMin:6.0,skills:["Python","Statistics"],funded:false,description:"Illustrative data-science program with coursework and a thesis." },
  { id:"o4",title:"Research Assistant · NLP",organization:"Demo Lab D",country:"Germany",type:"Research Assistant",area:"Natural Language Processing",gpaMin:null,ieltsMin:null,skills:["Python","NLP"],funded:true,description:"Illustrative lab appointment; actual eligibility would need verification." },
  { id:"o5",title:"MSc · Applied AI",organization:"Demo University E",country:"Sweden",type:"Master's",area:"Artificial Intelligence",gpaMin:3.2,ieltsMin:6.5,skills:["Python","Machine Learning"],funded:true,description:"Illustrative applied artificial intelligence opportunity." },
  { id:"o6",title:"PhD · Computational Linguistics",organization:"Demo University F",country:"United Kingdom",type:"PhD",area:"Linguistics",gpaMin:3.5,ieltsMin:7,skills:["NLP","Research"],funded:true,description:"Illustrative doctoral project in multilingual language processing." },
  { id:"o7",title:"MSc · Intelligent Systems",organization:"Demo University G",country:"Finland",type:"Master's",area:"Machine Learning",gpaMin:2.9,ieltsMin:6.0,skills:["Python","AI"],funded:false,description:"Illustrative master's course with intelligent systems specialization." },
  { id:"o8",title:"Research Master's · Human-Centered AI",organization:"Demo Institute H",country:"Canada",type:"Master's",area:"Human-Centered AI",gpaMin:3.1,ieltsMin:6.5,skills:["Machine Learning","NLP"],funded:true,description:"Illustrative research program focused on responsible user-facing AI." },
  { id:"o9",title:"MSc · Software Engineering",organization:"Demo University I",country:"Australia",type:"Master's",area:"Software Engineering",gpaMin:3.0,ieltsMin:6.5,skills:["React","Programming"],funded:false,description:"Illustrative advanced software engineering master's opportunity." },
  { id:"o10",title:"Funded PhD · Low-Resource NLP",organization:"Demo Institute J",country:"Netherlands",type:"PhD",area:"Natural Language Processing",gpaMin:3.4,ieltsMin:7,skills:["NLP","Python"],funded:true,description:"Illustrative research assistantship in low-resource languages." },
];
export const sampleProfessors: Professor[] = [
  {id:"p1",name:"Sample Researcher A",institution:"Demo University A",country:"Germany",topics:["multilingual NLP","text classification","Python"],paper:"Research theme: multilingual text classification (illustrative)",url:"",source:"sample",accepting:"Unknown"},
  {id:"p2",name:"Sample Researcher B",institution:"Demo Institute B",country:"Canada",topics:["machine learning","trustworthy AI","robustness"],paper:"Research theme: trustworthy machine learning (illustrative)",url:"",source:"sample",accepting:"Unknown"},
  {id:"p3",name:"Sample Researcher C",institution:"Demo University C",country:"Netherlands",topics:["language models","multilingual NLP","embeddings"],paper:"Research theme: multilingual representation learning (illustrative)",url:"",source:"sample",accepting:"Unknown"},
  {id:"p4",name:"Sample Researcher D",institution:"Demo Institute D",country:"Sweden",topics:["human-centered AI","natural language processing","evaluation"],paper:"Research theme: human-centered AI evaluation (illustrative)",url:"",source:"sample",accepting:"Unknown"},
  {id:"p5",name:"Sample Researcher E",institution:"Demo University E",country:"Finland",topics:["data mining","machine learning","Python"],paper:"Research theme: data mining methods (illustrative)",url:"",source:"sample",accepting:"Unknown"},
  {id:"p6",name:"Sample Researcher F",institution:"Demo University F",country:"United Kingdom",topics:["computational linguistics","NLP","text classification"],paper:"Research theme: computational linguistics (illustrative)",url:"",source:"sample",accepting:"Unknown"},
];
export const initialStore: Store = { profile: initialProfile, tracked: [], recipients: [], customProfessors: [] };
