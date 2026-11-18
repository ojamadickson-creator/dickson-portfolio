---
title: Hybrid identity and Intune endpoint management
code: LAB-03
track: it
order: 3
summary: Extended the on-premises forest into Entra ID with Entra Connect, then enrolled Windows 11 devices in Intune with compliance policies, BitLocker escrow, Conditional Access and Win32 apps.
brief: Take a working AD domain that is only managed on the LAN and add what a modern business needs, which is remote management, health-based access and app delivery.
stack: [Entra Connect, Password hash sync, Hybrid Entra join, Intune, Autopilot, BitLocker, Conditional Access, Win32 apps, Graph PowerShell]
repo: https://github.com/ojamadickson-creator/intune-hybrid-endpoint-management
evidence:
  src: /evidence/intune.webp
  alt: Microsoft Intune admin centre Windows devices list showing CLIENT01 as an Intune-managed, compliant device.
  caption: CLIENT01 hybrid-joined, enrolled in Intune automatically and reported as compliant.
jobFit:
  - Device enrolment, compliance and "why can't I access Outlook?" tickets
  - BitLocker recovery key lookups
  - Packaging and deploying apps without touching every PC
---

## What I built

- **Entra Connect with password hash sync.** Tier 0 and Tier 1 admin OUs and service accounts are filtered out, so privileged on-premises accounts never sync to the cloud.
- **Hybrid Entra join and automatic Intune enrolment** for Windows 11, checked with `dsregcmd /status`.
- **Compliance policies** for BitLocker, Secure Boot, Defender health and patch level. BitLocker must save its recovery key to Entra ID before it encrypts the drive.
- **Conditional Access** requiring MFA and a compliant device. I ran it in report-only mode first, with break-glass accounts excluded, so nobody gets locked out.
- **Win32 app packaging** with IntuneWinAppUtil, Microsoft 365 Apps deployment, and Graph PowerShell compliance audits.

## Why these decisions

Password hash sync keeps cloud sign-in working if the on-premises link goes down. Report-only mode shows what a policy would block before it blocks anyone. Both are choices I'd defend to a manager.
