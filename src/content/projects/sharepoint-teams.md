---
title: SharePoint and Teams collaboration governance
code: LAB-04
track: it
order: 4
summary: An Operations Collaboration Hub in SharePoint Online and Microsoft Teams, with least-privilege permissions, internal-only sharing, metadata and PowerShell administration.
brief: Give an operations team one place for SOPs and incident reports, without documents being shared outside the company.
stack: [SharePoint Online, Microsoft Teams, Microsoft 365 admin centre, Teams PowerShell]
repo: https://github.com/ojamadickson-creator/sharepoint-teams-governance-lab
evidence:
  src: /evidence/sharepoint.webp
  alt: SharePoint admin centre sharing settings for the Operations Collaboration Hub, with "Only people in your organization" selected.
  caption: External sharing turned off for the site. Only people in the organisation can open its files.
jobFit:
  - Handling “I can't open this file” and permission tickets
  - Adding users to Teams and sites the right way
  - Basic Microsoft 365 tenant administration
---

## What I built

- Microsoft 365 users, admin roles and trial licences.
- A group-connected **SharePoint team site** with a document library, folders for SOPs and incident reports, a custom **Document Type** column and a filtered view.
- **Owners, members and visitors** assigned by least privilege, with **sharing limited to people inside the organisation**.
- A connected **Microsoft Teams** workspace with operational channels and the document library added as a tab.
- **Teams PowerShell** to check the team, add a member with `Add-TeamUser` and confirm membership.
- 25 screenshot steps, ending with a final permissions audit.
