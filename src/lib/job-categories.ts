export type DepartmentKey =
  | "Executive Leadership"
  | "Operations"
  | "Finance and Accounting"
  | "Sales"
  | "Marketing"
  | "Engineering and IT"
  | "Data and AI"
  | "HR and People Operations"
  | "Legal and Compliance";

export interface JobCategory {
  category: DepartmentKey;
  focus: string;
  top_skills: string[];
  skills: string[];
}

export const ENTERPRISE_JOB_CATEGORIES: JobCategory[] = [
  {
    category: "Executive Leadership",
    focus: "Strategy, capital allocation, org direction",
    top_skills: ["Strategic planning","Decision-making","Financial acumen","Change leadership","Stakeholder management"],
    skills: ["Strategic planning","Decision-making","Financial acumen","Stakeholder management","Corporate governance","Risk management","Vision setting","Change leadership","Mergers and acquisitions","Capital allocation","Executive communication","Board relations","Organizational design","Performance management","Market analysis","Competitive strategy","Crisis management","Leadership development","Negotiation","Public speaking","ESG strategy","Digital transformation oversight","Innovation strategy","Cross-functional alignment","Talent strategy","Succession planning","Enterprise risk","Policy setting","Culture shaping","Scenario planning"],
  },
  {
    category: "Operations",
    focus: "Execution, efficiency, process",
    top_skills: ["Process optimization","Workflow design","KPI management","Project execution","Continuous improvement"],
    skills: ["Process optimization","Supply chain management","Logistics","Vendor management","Lean methodology","Six Sigma","Workflow design","Capacity planning","Quality control","Cost reduction","Operational analytics","Resource allocation","Project execution","SOP development","Procurement","Inventory management","Compliance operations","Performance tracking","Risk mitigation","Service delivery","Escalation handling","Systems thinking","Process automation","KPI management","Facilities management","Throughput optimization","Scheduling","Cross-team coordination","Operational forecasting","Continuous improvement"],
  },
  {
    category: "Finance and Accounting",
    focus: "Money, reporting, compliance",
    top_skills: ["Financial modeling","Budgeting","Forecasting","Financial reporting","FP&A"],
    skills: ["Financial modeling","Budgeting","Forecasting","GAAP and IFRS","Accounting","Variance analysis","Cash flow management","Auditing","Tax strategy","Cost accounting","Financial reporting","FP&A","Revenue recognition","Internal controls","Risk assessment","Capital planning","Investment analysis","Treasury management","Expense management","ERP systems","Data reconciliation","Compliance reporting","Financial strategy","Pricing strategy","Margin analysis","Cost optimization","Scenario modeling","Portfolio analysis","Due diligence","Financial dashboards","Invoicing"],
  },
  {
    category: "Sales",
    focus: "Revenue generation",
    top_skills: ["Prospecting","Pipeline management","Negotiation","Closing deals","Account management"],
    skills: ["Prospecting","Lead qualification","Pipeline management","CRM usage","Negotiation","Closing deals","Account management","Relationship building","Objection handling","Consultative selling","Territory planning","Forecasting","Sales analytics","Product demos","Pricing strategy","Contract negotiation","Upselling","Cross-selling","Cold outreach","Inbound conversion","Sales enablement","Buyer psychology","Storytelling","Competitive positioning","Quota management","Deal structuring","Networking","Presentation skills","Stakeholder mapping","Revenue strategy"],
  },
  {
    category: "Marketing",
    focus: "Demand generation and brand",
    top_skills: ["Brand strategy","Content marketing","Campaign management","Demand generation","Analytics"],
    skills: ["Brand strategy","Content marketing","SEO","SEM","Social media","Campaign management","Email marketing","Analytics","Growth marketing","Product marketing","Market research","Segmentation","Positioning","Messaging","Funnel optimization","Conversion rate optimization","A/B testing","Paid media","Influencer marketing","Event marketing","Copywriting","Storytelling","Marketing automation","CRM marketing","Customer insights","Lifecycle marketing","Attribution modeling","PR","Community building","Demand generation"],
  },
  {
    category: "Engineering and IT",
    focus: "Build and maintain systems",
    top_skills: ["Software development","System architecture","Cloud computing","DevOps","Cybersecurity"],
    skills: ["Software development","System architecture","APIs","Cloud computing","DevOps","CI/CD","Version control","Debugging","Testing","Cybersecurity","Data structures","Algorithms","Microservices","Containerization","Infrastructure as code","Networking","Database management","Performance optimization","Observability","Reliability engineering","Incident response","Scripting","Automation","System design","Code review","Technical documentation","Agile development","Scalability planning","Platform engineering","Integration"],
  },
  {
    category: "Data and AI",
    focus: "Insights and intelligence",
    top_skills: ["Data analysis","SQL","Machine learning","Data visualization","Predictive modeling"],
    skills: ["Data analysis","SQL","Python","Machine learning","Data visualization","ETL pipelines","Data engineering","Statistics","Predictive modeling","Natural language processing","Data governance","Feature engineering","Experimentation","A/B testing","Big data tools","BI tools","Dashboards","Data storytelling","Model deployment","MLOps","Data cleaning","Anomaly detection","Forecasting","Recommendation systems","Deep learning","Clustering","Classification","Optimization","Data architecture","AI ethics"],
  },
  {
    category: "HR and People Operations",
    focus: "Talent and culture",
    top_skills: ["Recruiting","Onboarding","Performance management","Employee relations","Talent development"],
    skills: ["Recruiting","Onboarding","Performance management","Compensation planning","Benefits administration","Employee relations","HR compliance","Talent development","Training programs","Succession planning","Culture building","DEI initiatives","Conflict resolution","Coaching","Workforce planning","HR analytics","Engagement surveys","Policy development","Employer branding","Retention strategy","Organizational development","Change management","Leadership training","HRIS systems","Payroll","Labor law","Feedback systems","Career pathing","Wellbeing programs","Internal communications"],
  },
  {
    category: "Legal and Compliance",
    focus: "Risk, contracts, regulation",
    top_skills: ["Contract law","Compliance management","Regulatory analysis","Risk assessment","Data privacy"],
    skills: ["Contract law","Negotiation","Compliance management","Regulatory analysis","Risk assessment","Corporate law","Intellectual property","Litigation management","Policy drafting","Governance","Data privacy","Due diligence","Legal research","Employment law","Vendor contracts","Dispute resolution","Ethics programs","Internal audits","Documentation","Licensing","Regulatory filings","Anti-corruption","Compliance training","Incident investigation","Legal writing","Mergers and acquisitions law","Securities law","Contract lifecycle management","Advisory","Negotiation strategy"],
  },
];

export interface QuickRole {
  title: string;
  department: DepartmentKey;
  defaultSkills: string[];
}

export const QUICK_ROLES: QuickRole[] = [
  { title: "Accounts Payable Clerk", department: "Finance and Accounting", defaultSkills: ["Data reconciliation","ERP systems","Expense management","Financial reporting","Internal controls"] },
  { title: "HR Generalist", department: "HR and People Operations", defaultSkills: ["Onboarding","Employee relations","HR compliance","HRIS systems","Policy development"] },
  { title: "Inside Sales Rep", department: "Sales", defaultSkills: ["Prospecting","Lead qualification","CRM usage","Pipeline management","Cold outreach"] },
  { title: "Marketing Coordinator", department: "Marketing", defaultSkills: ["Campaign management","Email marketing","Social media","Content marketing","Analytics"] },
  { title: "Customer Service Rep", department: "Operations", defaultSkills: ["Service delivery","Escalation handling","Performance tracking","SOP development","Cross-team coordination"] },
  { title: "Executive Assistant", department: "Operations", defaultSkills: ["Scheduling","Cross-team coordination","SOP development","Resource allocation","Performance tracking"] },
  { title: "Project Manager", department: "Operations", defaultSkills: ["Project execution","Resource allocation","KPI management","Cross-team coordination","Workflow design"] },
  { title: "Paralegal", department: "Legal and Compliance", defaultSkills: ["Legal research","Documentation","Contract lifecycle management","Compliance management","Regulatory filings"] },
  { title: "IT Support Technician", department: "Engineering and IT", defaultSkills: ["Debugging","Incident response","Networking","Scripting","Technical documentation"] },
  { title: "Operations Manager", department: "Operations", defaultSkills: ["Process optimization","KPI management","Workflow design","Resource allocation","Continuous improvement"] },
];

export function getDepartment(name: DepartmentKey): JobCategory | undefined {
  return ENTERPRISE_JOB_CATEGORIES.find((c) => c.category === name);
}

export function fuzzyMatchRoles(query: string, limit = 6): {
  type: "role" | "skill" | "department";
  label: string;
  department: DepartmentKey;
}[] {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];
  const results: { type: "role" | "skill" | "department"; label: string; department: DepartmentKey }[] = [];

  for (const r of QUICK_ROLES) {
    if (r.title.toLowerCase().includes(q)) {
      results.push({ type: "role", label: r.title, department: r.department });
    }
  }
  for (const c of ENTERPRISE_JOB_CATEGORIES) {
    if (c.category.toLowerCase().includes(q)) {
      results.push({ type: "department", label: c.category, department: c.category });
    }
    for (const s of c.skills) {
      if (s.toLowerCase().includes(q)) {
        results.push({ type: "skill", label: s, department: c.category });
        if (results.length >= limit * 2) break;
      }
    }
  }
  // dedupe by label
  const seen = new Set<string>();
  return results.filter((r) => {
    const key = `${r.type}:${r.label}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, limit);
}
