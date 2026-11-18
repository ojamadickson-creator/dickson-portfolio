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
    where: "Lisbon · Onsite",
    when: "Nov 2026 – Present",
    points: [
      "Real-time phone support in English for candidates taking online assessments on an EU platform.",
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

export const certifications = [
  { name: "CompTIA Security+", note: "Valid 2023–2029", status: "done" },
  { name: "CompTIA Network+", note: "Networking & infrastructure", status: "done" },
  { name: "CompTIA A+", note: "IT support foundations", status: "done" },
  { name: "Microsoft MD-102", note: "Endpoint Administrator", status: "progress" },
] as const;

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
