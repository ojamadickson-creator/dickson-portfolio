---
title: SMB brute-force detection (purple team)
code: SEC-02
track: security
order: 2
summary: Hydra sprays 100 passwords at a domain controller over SMB. Splunk catches it with threshold, time-series and cross-source correlation searches, displayed on a three-panel dashboard.
brief: Build the attack and the detection myself, so I understand what a brute force looks like in the logs and not just in a blog post.
stack: [Splunk Enterprise, SPL, Universal Forwarder, OPNsense, Windows Server, Hydra, REMnux, VirtualBox]
repo: https://github.com/ojamadickson-creator/purple-team-smb-detection-lab
outcome: "99 failed logons from one source, caught three ways: threshold, one-minute spike, cross-source correlation."
techniques:
  - id: T1110
    name: Brute Force
trace:
  note: Excerpt of the 99 sprayed attempts. Times are relative to the first connection, and only the rows a search matched are marked.
  rows:
    - { t: "+0.0s", src: OPNsense, event: "SMB pass 192.168.56.1 → DC01:445", hit: false }
    - { t: "+0.4s", src: DC01, event: "4625 failed logon · user svc_backup", hit: false }
    - { t: "+0.6s", src: DC01, event: "4625 failed logon · user svc_backup", hit: false }
    - { t: "+1.1s", src: DC01, event: "4625 failed logon · user administrator", hit: true }
    - { t: "+1.4s", src: DC01, event: "4625 failed logon · user administrator", hit: true }
    - { t: "+1.8s", src: DC01, event: "4625 failed logon · user administrator", hit: true }
    - { t: "+2.0s", src: DC01, event: "4625 failed logon · user administrator", hit: true }
    - { t: "+2.3s", src: DC01, event: "4625 failed logon · user administrator", hit: true }
    - { t: "+2.5s", src: Splunk, event: "threshold search fired: >5 failures / 60s", hit: true }
    - { t: "+2.6s", src: Splunk, event: "timechart spike · 1-minute bucket", hit: false }
    - { t: "+2.7s", src: Splunk, event: "correlation: firewall pass + 4625 from same source", hit: false }
video: https://www.youtube.com/watch?v=wYPfKIGx95Y
evidence:
  src: /evidence/smb.webp
  alt: Splunk search results correlating OPNsense SMB connections with Windows failed logon events (Event ID 4625) from the same source IP.
  caption: Perimeter and domain controller logs combined into one timeline. Each row is a failed Windows logon from the attacking source.
  width: 1600
  height: 769
annotations:
  - { x: 33.5, y: 22.9, label: "One search over both sources: OPNsense syslog passes and domain controller events with EventCode 4625." }
  - { x: 37.5, y: 38.6, label: "99 events, the same count the dashboard showed during validation." }
  - { x: 48.5, y: 55.1, label: "attack_phase labels each row. Every row here is Phase 3a, a failed Windows logon." }
  - { x: 76.6, y: 55.1, label: "src_ip 192.168.56.1 on every row. Splunk recorded this instead of the attacker's real address, which I left as an open question." }
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
