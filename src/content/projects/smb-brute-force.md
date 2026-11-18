---
title: SMB brute-force detection (purple team)
code: SEC-02
track: security
order: 2
summary: Hydra sprays 100 passwords at a domain controller over SMB. Splunk catches it with threshold, time-series and cross-source correlation searches, displayed on a three-panel dashboard.
brief: Build the attack and the detection myself, so I understand what a brute force looks like in the logs and not just in a blog post.
stack: [Splunk Enterprise, SPL, Universal Forwarder, OPNsense, Windows Server, Hydra, REMnux, VirtualBox]
repo: https://github.com/ojamadickson-creator/purple-team-smb-detection-lab
video: https://www.youtube.com/watch?v=wYPfKIGx95Y
evidence:
  src: /evidence/smb.webp
  alt: Splunk search results correlating OPNsense SMB connections with Windows failed logon events (Event ID 4625) from the same source IP.
  caption: Perimeter and domain controller logs combined into one timeline. Each row is a failed Windows logon from the attacking source.
jobFit:
  - Spotting account lockout storms and their source
  - Writing searches that cut noise instead of adding it
  - Explaining a security event in plain language
---

## What I built

- **Three network segments** in VirtualBox, with OPNsense rules allowing only ICMP, DNS, LDAP and SMB, and denying everything else.
- **Log ingestion.** The Splunk Universal Forwarder ships Windows Security, Application and System logs, and OPNsense sends syslog over UDP 514.
- **Three SPL detections:**
  - a failed-logon threshold (Event ID 4625, more than 5 per source)
  - a one-minute timechart that shows the attack as a sharp spike
  - a correlation that joins firewall passes with domain controller failures
- **A dashboard** that showed exactly 99 failed attempts from the attacking source during validation.

## Issues I hit and fixed

**Rule order.** The OPNsense deny rule sat above the pass rule, so nothing got through. I moved it below the pass rule.

**Windows Firewall on the DC** was still blocking SMB after OPNsense was fixed. I worked through that next.

**Source IP.** Splunk recorded the source as `192.168.56.1` rather than the attacker's real address. I documented this as an open question instead of hiding it.
