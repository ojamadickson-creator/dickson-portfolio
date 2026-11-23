---
title: STRRAT malware PCAP forensics
code: SEC-04
track: security
order: 4
summary: Network forensic investigation of a STRRAT infection across 11,562 packets, using NetworkMiner triage, a Wireshark decode of the C2 traffic, IOC extraction, OSINT checks and MITRE ATT&CK mapping.
brief: Given only a packet capture, work out which machine is infected, who the attacker talks to and what was sent, then hand over indicators others can block.
stack: [Wireshark, NetworkMiner, CyberChef, AbuseIPDB, VirusTotal, YARA, Splunk SPL, MITRE ATT&CK]
outcome: "C2 pulled out of 11,562 packets: NetworkMiner triage, then a Wireshark decode and IOC extraction."
techniques:
  - id: T1071.001
    name: Web Protocols
repo: https://github.com/ojamadickson-creator/strrat-pcap-forensics
evidence:
  src: /evidence/strrat.webp
  alt: Wireshark Protocol Hierarchy Statistics for the STRRAT packet capture, broken down by protocol.
  caption: Protocol hierarchy, the first step in the triage before narrowing down to the C2 conversation.
jobFit:
  - A methodical approach under pressure, triage first and deep dive second
  - Clear IOC lists that another team can act on
  - Documenting evidence step by step
---

## Investigation

- **Triage with NetworkMiner** to identify hosts, the victim (`DESKTOP-SKBR25F`, `172.16.1.66`) and external contacts, before opening Wireshark.
- **C2 decode in Wireshark.** STRRAT's custom protocol on high-port TCP to `141.98.10.79:12132`, with the bidirectional sessions reconstructed.
- **Payload decoding with CyberChef**, which recovered the system fingerprinting strings the malware sent out.
- **OSINT checks** with AbuseIPDB and VirusTotal confirmed the C2 infrastructure.
- **Detection content.** Wireshark filters, Splunk hunting queries and YARA signatures for STRRAT components, all mapped to MITRE ATT&CK.
