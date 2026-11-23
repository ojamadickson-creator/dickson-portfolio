// Single place to edit personal details. Everything on the site reads from here.
export const profile = {
  name: "Dickson Ojama",
  role: "IT Support Technician",
  focus: "Level 1 / Level 2 support · Microsoft 365 · Identity",
  location: "Lisbon / Almada, Portugal",
  email: "ojamadickson@proton.me",
  linkedin: "https://www.linkedin.com/in/ojama-d-28a13814a",
  github: "https://github.com/ojamadickson-creator",
  githubUser: "ojamadickson-creator",
  resumePdf: "/Dickson-Ojama-Resume.pdf",
  lookingFor: ["Service desk / IT support (L1–L2)", "Desktop & endpoint support", "Junior Microsoft 365 / identity admin"],
  languages: "English (native) · Portuguese (A2, conversational)",
  workAuth: "Portuguese residence permit (Título de Residência)",
  summary:
    "CompTIA A+, Network+ and Security+ certified support professional with three years of paid technical support and more than seven years of customer support. I resolve desktop, application, account-access and connectivity issues by phone, email and chat, and explain them in plain language. In my home lab I run a two-domain-controller Windows Server 2025 forest extended into Microsoft Entra ID and Intune, automated with PowerShell and Microsoft Graph.",
};

// Resume offered on each role landing page (/support, /soc, /sysadmin).
// Tailored PDFs go in public/. /support uses the 2026 IT support resume (no phone number);
// /soc and /sysadmin use the general resume above until tailored copies exist.
export const resumes = {
  support: "/Dickson-Ojama-Resume-Support.pdf",
  soc: profile.resumePdf,
  sysadmin: profile.resumePdf,
} as const;

export const stats = [
  { value: "99%", label: "first-contact resolution at Intelcia" },
  { value: "85%+", label: "first-contact resolution at Teleperformance" },
  { value: "3 yrs", label: "paid technical support" },
  { value: "7+ yrs", label: "customer support across industries" },
];

export const experience = [
  {
    role: "Technical Support Specialist",
    org: "Intelcia",
    where: "Lisbon · Onsite · Seasonal contract",
    when: "Nov 2026",
    points: [
      "Real-time phone support in English for candidates taking online assessments on an EU platform.",
      "99% first-contact resolution: escalated a single case across the whole contract.",
      "Troubleshoot browser, camera and audio settings while keeping anxious candidates calm.",
      "Document recurring errors to feed knowledge-base and process improvements.",
    ],
  },
  {
    role: "Technical Support Specialist",
    org: "Teleperformance Portugal",
    where: "Lisbon · Onsite",
    when: "Apr 2025 – May 2026",
    points: [
      "L1/L2 support by phone, email and chat for a global user base; 85%+ first-contact resolution, beating SLA targets.",
      "Account access and lifecycle: password resets, disabled accounts, impersonation and phishing / account-takeover cases within GDPR.",
      "Wrote runbooks, SOPs and knowledge-base articles that shortened onboarding and reduced handling time.",
    ],
  },
  {
    role: "Dispatcher",
    org: "Postal Box Logistics Inc",
    where: "Aurora, CO, USA · Remote",
    when: "Jun 2022 – Jan 2025",
    points: ["Supported drivers by phone, email and chat; investigated CRM and dispatch data discrepancies under tight SLAs."],
  },
  {
    role: "IT Support & Client Coordinator",
    org: "917Smith Inc",
    where: "Springfield, OH, USA · Remote",
    when: "May 2020 – Mar 2022",
    points: [
      "Desktop and network support for distributed staff: hardware, installs, VPN, login, password reset and LAN/Wi-Fi.",
      "95% positive resolution rate; security awareness training cut risky behaviour by ~30% and escalations by 20%.",
    ],
  },
];

// Verified credentials. Each `verify` link opens the official verification page.
// `badge` is an image in /public/badges (Credly badges); items without one show an issuer tile.
export type Credential = {
  name: string;
  short: string;
  issuer: string;
  issued?: string;
  expires?: string;
  verify: string;
  verifyLabel: string;
  badge?: string;
  mono?: string;
  kind: "cert" | "training";
};

export const credentials: Credential[] = [
  { kind: "cert", name: "CompTIA Security+ ce", short: "Security+", issuer: "CompTIA", issued: "Mar 2023", expires: "Mar 2029", verify: "https://www.credly.com/badges/1ebf4041-f4b2-4075-b608-bb4676b5bbba/linked_in_profile", verifyLabel: "Credly", badge: "/badges/secplus.webp" },
  { kind: "cert", name: "CompTIA Network+ ce", short: "Network+", issuer: "CompTIA", issued: "Jan 2023", expires: "Mar 2029", verify: "https://www.credly.com/badges/2b6eca48-8334-4dab-854a-81d059e929f5/linked_in_profile", verifyLabel: "Credly", badge: "/badges/netplus.webp" },
  { kind: "cert", name: "CompTIA A+ ce", short: "A+", issuer: "CompTIA", issued: "Dec 2022", expires: "Mar 2029", verify: "https://www.credly.com/badges/1090519b-64b6-43cc-b06d-50a8b468865b/linked_in_profile", verifyLabel: "Credly", badge: "/badges/aplus.webp" },
  { kind: "cert", name: "CompTIA Secure Infrastructure Specialist (CSIS)", short: "CSIS", issuer: "CompTIA · Stackable", issued: "Mar 2023", expires: "Mar 2029", verify: "https://www.credly.com/badges/3bce1fbe-2f12-48ad-93b1-ebbcb46d48c1/linked_in_profile", verifyLabel: "Credly", badge: "/badges/csis.webp" },
  { kind: "cert", name: "CompTIA IT Operations Specialist (CIOS)", short: "CIOS", issuer: "CompTIA · Stackable", issued: "Jan 2023", expires: "Mar 2029", verify: "https://www.credly.com/badges/127adfdb-f2c4-4bc7-83ef-e031e0c1eba2/linked_in_profile", verifyLabel: "Credly", badge: "/badges/cios.webp" },
  { kind: "training", name: "Jr Penetration Tester", short: "Jr Pen Tester", issuer: "TryHackMe", mono: "THM", issued: "Jan 2026", verify: "https://tryhackme.com/certificate/THM-YDN6IXFNPE", verifyLabel: "TryHackMe" },
  { kind: "training", name: "SOC Analyst Level 1", short: "SOC L1", issuer: "Tech Made Simple", mono: "TMS", issued: "Jul 2026", verify: "https://techmadesimple.net/certificate/c205fbcd-8396-40e9-b32d-e83faa52f051", verifyLabel: "Tech Made Simple" },
  { kind: "training", name: "Cybersecurity Fundamentals", short: "Cyber Fundamentals", issuer: "IBM SkillsBuild", issued: "Aug 2022", verify: "https://www.credly.com/badges/e12083ea-741e-4433-a9e0-5d42c4b0c7b6/linked_in_profile", verifyLabel: "Credly", badge: "/badges/ibm.webp" },
  { kind: "training", name: "Intro to Splunk", short: "Splunk", issuer: "Splunk", mono: "SPL", verify: "https://drive.google.com/file/d/1fKwquHGxTn96YEoRPeyVmno-wCEHzf99/view?usp=drive_link", verifyLabel: "certificate" },
  { kind: "training", name: "Excel Fundamentals for Data Analysis", short: "Excel", issuer: "Coursera", mono: "XLS", verify: "https://www.coursera.org/account/accomplishments/certificate/SQJR886LFSTA", verifyLabel: "Coursera" },
];

export const inProgress = [{ name: "Microsoft MD-102", note: "Endpoint Administrator" }];

export const skills = [
  { group: "Service desk", items: ["Windows 10/11", "Remote support", "ServiceNow", "JIRA Service Desk", "SLA & escalation", "Runbooks & KB articles"] },
  { group: "Identity & endpoints", items: ["Active Directory", "Group Policy", "Entra ID", "Conditional Access & MFA", "PIM", "Intune & Autopilot", "BitLocker", "Windows LAPS"] },
  { group: "Microsoft 365", items: ["SharePoint Online", "Teams", "Licensing & roles", "Microsoft Graph"] },
  { group: "Networking", items: ["TCP/IP & subnetting", "DNS / DHCP", "VLANs", "VPN", "OPNsense"] },
  { group: "Scripting", items: ["PowerShell 7", "Graph SDK", "Bash", "Python & JavaScript (working)"] },
  { group: "Security", items: ["Splunk SPL", "Wireshark", "Phishing triage", "MITRE ATT&CK", "GDPR-aware handling"] },
];

// Small tools that aren't case studies but show initiative.
export const tools = [
  { name: "CompTIA A+ exam simulator", repo: "comptia-a-plus-exam-simulator", note: "Timed, scenario-based practice exam" },
  { name: "AWS Cloud Practitioner practice", repo: "aws-practitioner-cert", note: "160 practice questions" },
  { name: "CySA+ study tracker", repo: "cysa-studytracker", note: "Progress tracker for exam prep" },
];

// AI-usage disclosure on /support. Left empty on purpose: fill it in with your own words,
// and link the project that shows it. The section stays hidden while this is null.
export const aiUsage: {
  useFor: string[];
  never: string[];
  check: string[];
  evidence?: { label: string; href: string };
} | null = null;
