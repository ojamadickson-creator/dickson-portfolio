---
title: Entra ID governance, PIM and access reviews
code: LAB-02
track: it
order: 2
summary: Full identity lifecycle for 20 contractors in Microsoft Entra ID, automated with Microsoft Graph PowerShell, from CSV onboarding to just-in-time admin access and offboarding.
brief: Onboard a group of contractors quickly, give each role only the access it needs, and be able to prove later who had what and why.
stack: [Microsoft Entra ID P2, Microsoft Graph PowerShell, PIM, Administrative Units, Dynamic groups, Access reviews, Pester]
repo: https://github.com/ojamadickson-creator/entra-id-governance-lab
evidence:
  src: /evidence/entra.webp
  alt: Microsoft Entra admin centre showing a Privileged Identity Management role activation request from Marcus Reyes waiting for approval.
  caption: Just-in-time elevation through PIM. The role only activates after approval and a written justification.
jobFit:
  - New starter and leaver tickets handled the same way every time
  - Least-privilege helpdesk roles scoped with Administrative Units
  - Scripts with tests, and no secrets in the code
---

## What I built

- **Bulk onboarding from CSV** with Graph PowerShell: strong passwords, a forced reset on first sign-in, and group placement.
- **Dynamic groups** driven by job title and department, so access follows the HR data.
- **Administrative Units** that scope helpdesk administrators to their own users, plus a custom log-reader role for SOC staff.
- **Privileged Identity Management**: eligible rather than permanent admin roles, with MFA, a justification, approval and a time limit on every activation.
- **Access reviews** for groups and apps, set to apply their results automatically.
- **An offboarding script** that disables the account, revokes sessions and removes licences, in that order.
- Mock-based unit tests for the lifecycle scripts.

## How I worked

I checked every step against Microsoft Learn before writing it down. Each phase links the documentation it relies on and lists the licence it needs (P1, P2 or Governance). That way someone repeating the lab knows the cost before they start.
