---
title: Data exfiltration and DLP detection
code: SEC-01
track: security
order: 1
summary: A segmented home SOC lab where fake PII is stolen over SMB, detected through Windows file auditing, Suricata and firewall logs in Splunk, then contained with a targeted firewall rule.
brief: Detect a quiet, low-volume data theft that crosses the network boundary, and stop it without cutting off my own management access.
stack: [OPNsense, Suricata, Splunk Enterprise, Windows audit policy (Event ID 4663), PowerShell, Kali Linux, tcpdump]
repo: https://github.com/ojamadickson-creator/Data-Exfiltration-DLP-Detection
video: https://youtu.be/Z6pmFaNt-tQ
evidence:
  src: /evidence/exfil.webp
  alt: Splunk Network Traffic dashboard listing OPNsense firewall events between the LAN and WAN segments.
  caption: Firewall traffic from OPNsense in Splunk, used to link host file-access events to the outbound SMB session.
jobFit:
  - Reading Windows Security logs and knowing which Event IDs matter
  - Firewall rule order, routing and containment
  - Turning a messy investigation into a clear write-up
---

## What I built

Five virtual machines on two subnets, separated by an OPNsense firewall: a Windows 10 victim, a Windows Server domain controller, Kali Linux as the attacker's drop server, and Splunk Enterprise as the SIEM.

- **Host auditing.** I set SACLs and `auditpol` so Windows logs every access to the sensitive folder (Event ID 4663).
- **Network detection.** Custom Suricata signatures catch suspicious SMB sessions that cross between zones, and OPNsense sends its syslog to Splunk.
- **Correlation in Splunk.** SPL queries link the file-access events, the PowerShell compression step and the firewall log of the outbound transfer.
- **Containment.** A targeted Layer 4 block rule stops SMB exfiltration but keeps management access to the firewall and Splunk. I proved it with an on-off-on test using `pfctl` and `tcpdump`.

## Issues I hit and fixed

At first, routing and the order of firewall rules either blocked everything or let the transfer through. I traced it with `tcpdump` on both sides and reordered the rules. Only then did the containment rule behave as intended.
