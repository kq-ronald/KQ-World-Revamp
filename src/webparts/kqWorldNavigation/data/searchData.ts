export type KqSearchCategory =
  | 'Application'
  | 'Department'
  | 'Knowledge'
  | 'HR'
  | 'Travel'
  | 'Support'
  | 'News'
  | 'Finance'
  | 'Training'
  | 'Brand'
  | 'Manuals';
export interface IKqSearchItem {
  id: string;
  title: string;
  description?: string;
  url: string;
  keywords: string[];
  aliases?: string[];
  intents?: string[];
  category: KqSearchCategory;
  priority?: number;
  openInNewTab?: boolean;
}

export const kqSearchItems: IKqSearchItem[] = [
  {
    id: "knowledge-hub",
    title: "Knowledge Hub",
    description: "Manuals, policies, forms, notices and corporate documentation.",
    url: "https://kenyaairwaysplc.sharepoint.com/sites/kqdocshares/omnidocs",
    keywords: ["knowledge","knowledge hub","manual","manuals","document","documents","documentation","policy","policies","form","forms","notice","notices","certificate","certificates","compliance","procedure","procedures","reference","library"],
    aliases: ["KH","KQ Knowledge Hub","manual library","document library","KQ manuals"],
    intents: ["find a manual","open a manual","read a manual","find a policy","find a form","download a form","find a document","search manuals","view company documents"],
    category: "Knowledge",
    priority: 100,
    openInNewTab: true
  },
  {
    id: "internal-manuals",
    title: "Internal Manuals",
    description: "Find Kenya Airways internal operational and departmental manuals.",
    url: "https://kenyaairwaysplc.sharepoint.com/sites/kqdocshares/omnidocs",
    keywords: ["internal","internal manual","internal manuals","manual","manuals","operations","operational manual","department manual"],
    aliases: ["KQ internal manuals","company manuals"],
    intents: ["find internal manual","open internal manual","search internal manuals"],
    category: "Manuals",
    priority: 90,
    openInNewTab: true
  },
  {
    id: "external-manuals",
    title: "External Manuals",
    description: "Access external and third-party manuals available through Knowledge Hub.",
    url: "https://kenyaairwaysplc.sharepoint.com/sites/kqdocshares/omnidocs",
    keywords: ["external","external manual","external manuals","third party manual","manual"],
    aliases: ["third party manuals","external documents"],
    intents: ["find external manual","open external manual"],
    category: "Manuals",
    priority: 80,
    openInNewTab: true
  },
  {
    id: "kq-forms",
    title: "KQ Forms",
    description: "Find and download approved Kenya Airways forms.",
    url: "https://kenyaairwaysplc.sharepoint.com/sites/kqdocshares/omnidocs",
    keywords: ["form","forms","KQ form","download form","company form","document"],
    aliases: ["KQ Forms","company forms"],
    intents: ["find a form","download a form","get a form","where are forms"],
    category: "Knowledge",
    priority: 85,
    openInNewTab: true
  },
  {
    id: "policy-statements",
    title: "Policy Statements",
    description: "Access Kenya Airways policies and policy statements.",
    url: "https://kenyaairwaysplc.sharepoint.com/sites/kqdocshares/omnidocs",
    keywords: ["policy","policies","policy statement","policy statements","company policy","KQ policy","rules","guidelines"],
    aliases: ["KQ policies","company policies"],
    intents: ["find a policy","read policy","view company policy","search policies"],
    category: "Knowledge",
    priority: 85,
    openInNewTab: true
  },
  {
    id: "iata-manuals",
    title: "IATA Manuals",
    description: "Access IATA manuals and reference material.",
    url: "#TODO-IATA-MANUALS-URL",
    keywords: ["IATA","IATA manual","IATA manuals","aviation manual","aviation manuals","reference material"],
    aliases: ["IATA docs","IATA documents"],
    intents: ["open IATA manual","find IATA manual","search IATA manuals"],
    category: "Manuals",
    priority: 80,
    openInNewTab: true
  },
  {
    id: "ipride-manuals",
    title: "iPride Manuals and User Guides",
    description: "Access iPride manuals, instructions and user guides.",
    url: "#TODO-IPRIDE-URL",
    keywords: ["ipride","i pride","ipride manual","ipride manuals","ipride guide","ipride user guide","user guide"],
    aliases: ["iPride","iPride guides"],
    intents: ["how to use ipride","open ipride manual","find ipride guide","ipride instructions"],
    category: "Application",
    priority: 85,
    openInNewTab: true
  },
  {
    id: "corporate-training",
    title: "Corporate Training Reading Materials",
    description: "Training documents and learning material for Kenya Airways staff.",
    url: "#TODO-CORPORATE-TRAINING-URL",
    keywords: ["training","training material","training materials","learning","course","courses","reading material","reading materials","corporate training"],
    aliases: ["training documents","learning materials","training resources"],
    intents: ["find training material","open training documents","training resources","learning material"],
    category: "Training",
    priority: 75,
    openInNewTab: true
  },
  {
    id: "annual-leave",
    title: "Request Annual Leave",
    description: "Open the employee leave application to submit or manage leave.",
    url: "#TODO-LEAVE-APPLICATION-URL",
    keywords: ["leave","annual leave","vacation","holiday","days off","off day","request leave","leave request","leave application","leave days"],
    aliases: ["apply for leave","book leave","annual leave application","leave portal"],
    intents: ["I want to go on leave","request annual leave","apply for leave","book my leave","check my leave","check leave days","take time off"],
    category: "HR",
    priority: 100,
    openInNewTab: true
  },
  {
    id: "human-resource",
    title: "Human Resource",
    description: "Access Human Resource services and employee information.",
    url: "#TODO-HR-URL",
    keywords: ["HR","human resource","human resources","employee","staff","people","employment","benefits","employee benefits"],
    aliases: ["HR portal","people department","employee services"],
    intents: ["contact HR","employee benefits","HR services","staff information"],
    category: "HR",
    priority: 75,
    openInNewTab: true
  },
  {
    id: "it-support",
    title: "IT Support",
    description: "Get technical assistance or access the IT service desk.",
    url: "#TODO-IT-SUPPORT-URL",
    keywords: ["IT","IT support","support","computer","laptop","password","technical","technical issue","technical problem","system","access","login","wifi","internet","email","outlook","software","hardware","ticket"],
    aliases: ["service desk","helpdesk","help desk","IT helpdesk","IT service desk","ICT support"],
    intents: ["I need IT help","computer not working","laptop not working","forgot password","reset password","cannot login","system not working","raise IT ticket","report IT problem","internet not working"],
    category: "Support",
    priority: 100,
    openInNewTab: true
  },
  {
    id: "finance",
    title: "Finance",
    description: "Access Finance information and services.",
    url: "#TODO-FINANCE-URL",
    keywords: ["finance","financial","payment","payments","expense","expenses","invoice","invoices","reimbursement","money"],
    aliases: ["finance department","finance portal"],
    intents: ["submit expense","finance help","payment information","invoice"],
    category: "Finance",
    priority: 65,
    openInNewTab: true
  },
  {
    id: "provident-fund",
    title: "Provident Fund",
    description: "Access Provident Fund information and resources.",
    url: "#TODO-PROVIDENT-FUND-URL",
    keywords: ["provident","provident fund","pension","retirement","fund","benefits"],
    aliases: ["pension fund","retirement fund"],
    intents: ["check provident fund","pension information","retirement benefits"],
    category: "Finance",
    priority: 70,
    openInNewTab: true
  },
  {
    id: "brand-portal",
    title: "Brand Portal",
    description: "Access Kenya Airways brand assets, guidelines and resources.",
    url: "#TODO-BRAND-PORTAL-URL",
    keywords: ["brand","branding","brand portal","brand guideline","brand guidelines","logo","logos","KQ logo","corporate identity","brand assets"],
    aliases: ["branding portal","KQ branding","brand resources"],
    intents: ["download KQ logo","find brand guidelines","get brand assets","company logo"],
    category: "Brand",
    priority: 80,
    openInNewTab: true
  },
  {
    id: "kq-templates",
    title: "KQ Templates",
    description: "Access approved Kenya Airways corporate templates.",
    url: "#TODO-KQ-TEMPLATES-URL",
    keywords: ["template","templates","KQ template","presentation","PowerPoint","letterhead","document template","corporate template"],
    aliases: ["company templates","corporate templates","PPT template"],
    intents: ["download template","find PowerPoint template","find KQ template","get company template"],
    category: "Brand",
    priority: 75,
    openInNewTab: true
  },
  {
    id: "kq-brand-documents",
    title: "KQ Brand Documents",
    description: "Brand documentation and approved corporate identity resources.",
    url: "#TODO-KQ-BRAND-DOCUMENTS-URL",
    keywords: ["brand document","brand documents","branding","brand guidelines","corporate identity","KQ brand"],
    aliases: ["branding documents","brand guidelines"],
    intents: ["find brand document","read brand guidelines"],
    category: "Brand",
    priority: 65,
    openInNewTab: true
  },
  {
    id: "kq-blog",
    title: "KQ Blog",
    description: "Read the latest Kenya Airways stories and blog articles.",
    url: "https://corporate.kenya-airways.com/en/press-room/kq-blog/",
    keywords: ["blog","blogs","KQ blog","story","stories","article","articles","company news","news"],
    aliases: ["KQ stories","Kenya Airways blog","company blog"],
    intents: ["read latest blog","latest stories","company stories","read KQ news"],
    category: "News",
    priority: 70,
    openInNewTab: true
  },
  {
    id: "the-pride",
    title: "The Pride",
    description: "Find The Pride stories and publications.",
    url: "https://kenyaairwaysplc.sharepoint.com/homepage/SitePages/Forms/AllPages.aspx",
    keywords: ["pride","the pride","newsletter","publication","magazine","story","stories"],
    aliases: ["The Pride Newsletter","Pride newsletter","KQ Pride"],
    intents: ["read The Pride","open Pride newsletter","latest Pride","Pride stories"],
    category: "News",
    priority: 75,
    openInNewTab: true
  },
  {
    id: "take-3",
    title: "Take 3",
    description: "Find Take 3 company stories and updates.",
    url: "https://kenyaairwaysplc.sharepoint.com/homepage/SitePages/Forms/AllPages.aspx",
    keywords: ["take 3","take3","take three","news","company news","updates","stories"],
    aliases: ["Take Three","KQ Take 3"],
    intents: ["read Take 3","latest Take 3","Take 3 stories","company updates"],
    category: "News",
    priority: 75,
    openInNewTab: true
  }
];
