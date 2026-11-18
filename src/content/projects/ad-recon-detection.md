---
title: Multi-stage Active Directory reconnaissance and detection
code: SEC-03
track: security
order: 3
summary: A full red team chain against an AD domain controller (Nmap, password spraying, LDAP and post-compromise enumeration), each step detected in Splunk and mapped to MITRE ATT&CK.
brief: Follow an attacker from finding a username to enumerating the domain, and make sure every stage leaves a trace the blue team can alert on.
stack: [Kali Linux, Nmap, Hydra, ldapsearch, NetExec, Splunk Enterprise, OPNsense, MITRE ATT&CK]
repo: https://github.com/ojamadickson-creator/multi-stage-recon-lab
video: https://www.youtube.com/watch?v=NHnI9oP_xTY
evidence:
  src: /evidence/recon.webp
  alt: Splunk triggered alert history for a "Failed Login" alert, showing when the alert fired during the password spraying phase.
  caption: A real-time Splunk alert firing during the password spraying phase.
jobFit:
  - Knowing what normal versus suspicious authentication looks like
  - Alerting that someone can act on
  - Mapping findings to a framework the security team uses
---

## Attack chain

1. Username acquisition through social engineering (T1566)
2. Network and host discovery with Nmap (T1046, T1018)
3. Password spraying over SMB with Hydra (T1110), then a valid login (T1078)
4. LDAP enumeration of domain users (T1087)
5. Post-compromise enumeration with NetExec

## Detection

- The domain controller sends events over TCP 9997, and OPNsense sends syslog over UDP 514.
- SPL detections cover failed logons (4625), successful logons (4624) and the spike pattern.
- Correlation searches link the stages together, and dashboards and alerts are tuned to reduce noise.
