---
title: "How to create compliance policies in Intune, and what the results look like"
description: "A step-by-step walkthrough of building a Windows compliance policy in Intune: the settings, the assignments, a screen recording of the build, and how to read the results afterwards."
date: 2026-11-27
tags: ["Intune", "Microsoft 365", "compliance", "endpoint security"]
---

Every few months someone asks a version of the same question: are the machines we hand out actually secure?

In a tenant with two devices I can answer by opening both. At two hundred, I would be quoting a number I invented. Intune compliance policies exist because that answer has to be produced continuously, for every device, by the platform, without me opening anything.

This is the long version of that answer: what a compliance policy is, how to build one click by click, a recording of me building one, and what the results look like once it starts reporting. Everything comes from a lab tenant with two enrolled Windows devices and nobody relying on it. The screenshots are from November 2026, and Microsoft moves this interface around, so a label may have shifted by the time you read it.

## What a compliance policy is

A compliance policy is a named list of statements about a device. BitLocker on? Secure Boot on? Antivirus current? You configure the statements that matter to you, leave the rest alone, and Intune evaluates each device against them. Every device lands in one of four states, and the dashboard uses exactly these words:

- **Compliant** — every configured setting passed.
- **Not compliant** — at least one failed.
- **In grace period** — failed, but still inside the window you allowed before enforcement.
- **Not evaluated** — no policy has assessed it yet, usually because nothing targets it or it has not checked in.

A status is not an action. Intune reports it to Microsoft Entra ID, and Conditional Access reads it when someone signs in. A laptop that is encrypted and compliant opens Teams. The same laptop with BitLocker switched off is stopped at the sign-in, with a message saying the device does not meet the requirement.

That split matters more than any setting in the wizard: a compliance policy that no Conditional Access policy references is a report. It will look like security in the console and change nothing about who can open what. In the recording below nothing is blocked, because I built the reporting half. The blocking half lives in Entra ID, in a different portal, and it is the half that says no.

One more thing before you click Create: policies are per platform. There is a different policy type for Windows 10 and later, iOS/iPadOS, Android, macOS and Linux, and each one exposes its own settings. There is no Windows 11 platform — Windows 11 devices are covered by Windows 10 and later. That is why all three policies in my tenant read *Windows 10 and later* even though two of them are named Win11.

### What a policy can check

The wizard groups the settings into seven sections. In plain terms:

- **Custom compliance** — checks you write yourself, from a JSON rule file plus a PowerShell discovery script that reads the device.
- **Device health** — boot-time protections, confirmed by Microsoft Attestation Service: BitLocker, Secure Boot, code integrity.
- **Device properties** — the operating system version floor and ceiling, and which builds are allowed.
- **Configuration Manager compliance** — the co-management bridge, for devices where MECM still holds authority.
- **System security** — passwords, encryption, firewall, TPM, antivirus, antispyware, Defender health.
- **Microsoft Defender for Endpoint** — the machine risk score Defender assigns.
- **Windows Subsystem for Linux (WSL)** — settings for devices where Linux runs inside Windows.

## Where everything lives in the admin center

Everything starts at `intune.microsoft.com`. In the left navigation, under **Manage devices**, is **Compliance**: one blade holding every compliance policy in the tenant.

- **Policies** — the list and the **Create policy** button. Every policy starts here.
- **Notifications** — the message templates the "send email" action uses.
- **Compliance settings** — tenant-wide defaults for the blade, not settings for an individual policy.
- **Monitor** — how the policies in this tenant are currently reporting.

Open a policy and two tabs carry the work: **Monitor**, for what the devices report (device status, per-setting status, a full report you can export), and **Properties**, for the settings and assignments you configured. The fleet view is **Dashboard** in the left navigation: a compliance tile with counts, and a status table underneath.

The click paths I use most:

```text
Devices → Compliance → Create policy
Devices → Compliance → [policy name] → Monitor → Device status
Devices → Compliance → [policy name] → Monitor → Per-setting status
Dashboard → Device compliance
```

That is the whole map. The rest is what you do inside it.

## Step 1 — Create the policy and choose the platform

<figure>
<a href="/blog/compliance-policies-in-intune/01-compliance-list-create-policy.webp" target="_blank" rel="noopener"><img src="/blog/compliance-policies-in-intune/01-compliance-list-create-policy.webp" alt="Intune admin center, Devices → Compliance, with the Create a policy panel open on the platform dropdown." width="1700" height="811" loading="lazy" /></a>
<figcaption><strong>Figure 1.</strong> Devices → Compliance with Create policy open. The three policies in the list are all Windows 10 and later. The banner above the table is the Defender for Endpoint warning I come back to in the results. Click any screenshot in this post to open it at full size.</figcaption>
</figure>

1. Sign in to the Intune admin center and go to **Devices → Compliance**.
2. Select **Create policy**. A panel opens on the right.
3. Choose the platform. For a mix of Windows 10 and Windows 11 machines, **Windows 10 and later** covers both.
4. Select **Create** to open the wizard.

The wizard has five steps, and the state chips at the top left tell you where you are: Basics, Compliance settings, Actions for noncompliance, Assignments, Review + create. A green tick appears as each step is completed.

Step one is a name, a description, and nothing else. It is also the step everyone rushes, so I have a rule: **prefix, platform, purpose**. `CMP-Win11-Custom` is a compliance policy for Windows 11 holding custom checks. `CMP-Win11-Health` is the same platform holding built-in health checks. The prefix earns its place because a tenant will eventually contain a configuration profile and a compliance policy with near-identical names, doing completely different jobs.

In the recording I typed `new` and left the description empty. The review page read it back to me at the end, which is exactly what the policy list will say in a year: a policy called *new*, belonging to someone who has moved on.

Platform and profile type are fixed once you continue. There is no "change platform" button on a compliance policy, so a wrong choice here means starting again.

## Step 2 — Write the compliance settings

<figure>
<a href="/blog/compliance-policies-in-intune/02-compliance-settings-sections.webp" target="_blank" rel="noopener"><img src="/blog/compliance-policies-in-intune/02-compliance-settings-sections.webp" alt="The five-step wizard at step 2, showing the seven collapsed sections of Compliance settings." width="1700" height="726" loading="lazy" /></a>
<figcaption><strong>Figure 2.</strong> The seven sections of Compliance settings, all collapsed. The page looks empty because it is: a policy contains only the settings you open and configure.</figcaption>
</figure>

Everything is closed, and every toggle inside starts on **Not configured**. That phrase is the most misunderstood one in the wizard: it does not mean off, it means *not part of this policy* — a requirement you never made. A device cannot fail a requirement that was never written.

**Custom compliance** is the section for checks Microsoft did not build a toggle for. It takes two files: a JSON file listing the rules, and a PowerShell discovery script that reads the device and writes its findings out as JSON. Intune re-runs the script on the interval at the bottom of the section (eight hours in my screenshot) and compares the result to your rules. The setting names in the JSON become the row names of the report later, so name them for whoever reads it at nine in the morning — `RdpDisabled`, `SMBv1Disabled`, not `check1` and `check2`.

**Device health** is the section I would configure first on any Windows fleet.

<figure>
<a href="/blog/compliance-policies-in-intune/03-device-health.webp" target="_blank" rel="noopener"><img src="/blog/compliance-policies-in-intune/03-device-health.webp" alt="Custom compliance fields above Device health, with BitLocker, Secure Boot and code integrity toggles all set to Not configured." width="1700" height="726" loading="lazy" /></a>
<figcaption><strong>Figure 3.</strong> Custom compliance and Device health. Three toggles check that encryption and Secure Boot were active at boot, not merely installed. If I could configure only one section of a Windows policy, it would be this one.</figcaption>
</figure>

Setting **BitLocker**, **Secure Boot** and **Code integrity** to Require catches the device that was imaged by hand, or repaired by someone who turned protections off to make a driver work and never turned them back on. These are the failures nobody reports, because the machine still turns on.

**Device properties** holds the operating system version — minimum, maximum, and the mobile fields you can ignore on a Windows fleet — plus valid operating system builds. This is where a patching standard becomes a compliance requirement. Left blank, an out-of-support build is not a failure, because nothing asked it to be.

**Configuration Manager compliance** is one toggle for co-managed devices. If MECM still holds authority over compliance in your tenant, set it; if you are cloud-only, leave it. I left it alone, and left WSL collapsed as well. Both are fine choices as long as they are choices.

**System security** is the longest section, and the one people screenshot for audits.

<figure>
<a href="/blog/compliance-policies-in-intune/04-system-security-password.webp" target="_blank" rel="noopener"><img src="/blog/compliance-policies-in-intune/04-system-security-password.webp" alt="System Security expanded, showing password settings with every toggle on Not configured and greyed default values in the number fields." width="1700" height="722" loading="lazy" /></a>
<figcaption><strong>Figure 4.</strong> The password half of System security. The greyed numbers — 4, 41, 5 — are the values the fields fall back to, not requirements. They stay disabled until the toggle above them is set.</figcaption>
</figure>

<figure>
<a href="/blog/compliance-policies-in-intune/05-system-security-device.webp" target="_blank" rel="noopener"><img src="/blog/compliance-policies-in-intune/05-system-security-device.webp" alt="System Security continued: encryption, firewall, TPM, antivirus, antispyware and Defender settings, all Not configured." width="1700" height="774" loading="lazy" /></a>
<figcaption><strong>Figure 5.</strong> Encryption, firewall, TPM, antivirus, antispyware, and the Defender toggles. The rows below Microsoft Defender Antivirus grey out until it is required — the sub-settings follow the parent.</figcaption>
</figure>

For a Windows fleet, the three I would not leave blank are **encryption**, **firewall** and **TPM present**. They are the three an auditor asks about, and the three that fail quietly on a machine that was imaged badly. Requiring Microsoft Defender Antivirus unlocks the rows underneath it; the password fields behave the same way, unlocking as soon as you require a password.

**Microsoft Defender for Endpoint** holds the Machine Risk Score requirement. The connector that feeds Defender's risk assessment was already active in my tenant — that is the banner in Figure 1 — and this policy did not ask for the score, so the connector was reporting into a policy that ignored it. If Defender is licensed in your tenant, this is where the two products actually talk to each other.

When you have finished, select **Next**.

## Step 3 — Decide what happens when a device fails

<figure>
<a href="/blog/compliance-policies-in-intune/06-actions-for-noncompliance.webp" target="_blank" rel="noopener"><img src="/blog/compliance-policies-in-intune/06-actions-for-noncompliance.webp" alt="Actions for noncompliance step: Mark device noncompliant with a schedule of 7 days, an empty message template column and an empty second action row." width="1700" height="726" loading="lazy" /></a>
<figcaption><strong>Figure 6.</strong> One action per row, with the delay in days after non-compliance. I set Mark device noncompliant to seven days. The empty second row is where Send email to end users would go.</figcaption>
</figure>

A failed check does nothing on its own. This step is where it becomes an event. The **Action** dropdown offers four: send an email to the end user, mark the device noncompliant, remotely lock it, and retire it. The middle column is how many days after non-compliance the action fires.

I set **Mark device noncompliant** to seven days. For that week the device shows as non-compliant in the console while Entra ID still treats it as compliant, which is the breathing room the setting exists to give.

The email action is the one I would add before anything else. Without it, the first time a user hears about the policy is when something stops working, or when they open Company Portal and find a red banner nobody taught them to read. Choosing **Send email to end users** lets you pick a notification template and extra recipients, so the message arrives on day one and enforcement lands on day seven. That is two rows, not one — the schedule belongs to the action, not to the policy.

Remote lock and retire are for devices you have already decided to take away. They are not a first response to a missing antivirus update.

## Step 4 — Assign it to a group

<figure>
<a href="/blog/compliance-policies-in-intune/07-assignments.webp" target="_blank" rel="noopener"><img src="/blog/compliance-policies-in-intune/07-assignments.webp" alt="Assignments step with GRP-INT-Pilot-Devices included, status Active, two devices and zero users, filter None." width="1700" height="726" loading="lazy" /></a>
<figcaption><strong>Figure 7.</strong> The pilot group: two devices, no users, no filter. Device targeting is the right object type for a compliance policy, because compliance is a property of the device.</figcaption>
</figure>

Compliance policies are assigned to Microsoft Entra ID groups, never to devices one at a time. Mine went to **GRP-INT-Pilot-Devices**: two devices, zero users.

A compliance policy accepts user groups and device groups, and both are legitimate. I use device groups because compliance is a property of the device, and it avoids the question of what happens when one person signs into three machines. A user group targets every device that user signs into, which is useful when people move between machines — but it is easy to get wrong, because a group with no members, or one full of users with no enrolled devices, produces an empty report that looks like a broken policy.

**Filters** narrow a group further; mine was None. The **Excluded groups** list was empty too. If you do exclude a device, keep the consequence in view: it no longer receives this policy's assessment, and a device with no assessment is treated as not compliant by Conditional Access. An exclusion here usually needs a matching exclusion in Entra ID, or it becomes a trap for whoever inherits the tenant.

Start with a pilot group of a handful of devices. Widening the assignment later is far easier than explaining to three hundred people why their email stopped working.

## Step 5 — Review, then create

<figure>
<a href="/blog/compliance-policies-in-intune/08-review-and-create.webp" target="_blank" rel="noopener"><img src="/blog/compliance-policies-in-intune/08-review-and-create.webp" alt="Review and create summary showing name new, no description, an empty Compliance settings block, mark noncompliant after 7 days, and one included group." width="1700" height="726" loading="lazy" /></a>
<figcaption><strong>Figure 8.</strong> The summary, read as a reader would read it. Name: new. Description: No Description. Compliance settings: nothing under the heading. One action at seven days, one included group, no exclusions.</figcaption>
</figure>

The last step is a read-only summary of the policy the tenant is about to receive, and it is the most useful page in the wizard because it has nothing to sell. Read three things: the name and description, the compliance settings block, and the actions and assignments tables.

The blank space under **Compliance settings** is the giveaway. It means every assigned device will be evaluated against zero requirements and come back compliant, because a device cannot fail a test that was never written. That is not a bug; it is how "Not configured" behaves, and it is why an empty policy is more dangerous than no policy at all — it produces a green number you can put in a slide.

I stopped at this page in the recording rather than create it for that reason. The reports in the results section come from the policy I had built earlier, **CMP-Win11-Custom**, with the custom checks above, because that is the one with data behind it.

## Watch the build: the recording

<figure class="video">
<video controls preload="metadata" poster="/blog/compliance-policies-in-intune/compliance-policy-walkthrough-poster.webp" width="1920" height="1080">
<source src="/blog/compliance-policies-in-intune/compliance-policy-walkthrough.mp4" type="video/mp4" />
Your browser cannot play this video. <a href="/blog/compliance-policies-in-intune/compliance-policy-walkthrough.mp4">Download the recording (6 MB, MP4)</a>.
</video>
<figcaption><strong>The recording.</strong> Just under three minutes, screen only, no voice-over — the labels on screen are the commentary. The timestamps below are what to look at.</figcaption>
</figure>

- **0:00** — Devices → Compliance, with the three policies already in the tenant.
- **0:10** — Create policy, and the platform list.
- **0:24** — Basics: the name field, the platform, the profile type.
- **0:35** — The seven sections of Compliance settings.
- **0:40** — Custom compliance and Device health: the two-file setup, then the three attestation toggles.
- **0:50** — Encryption, firewall, TPM, antivirus, antispyware, and the Defender rows below their parent toggle.
- **1:05** — Actions for noncompliance: one action, seven days, the second row left empty.
- **1:18** — Assignments: Select groups to include.
- **1:30** — Searching the group list, then picking the pilot group with two devices in it.
- **1:46** — Review + create, read from top to bottom.
- **1:50** — I leave the wizard at the summary and discard the draft.
- **2:00** — Opening CMP-Win11-Custom on its device status report.
- **2:15** — Per-setting status: the view that names the setting that failed.
- **2:30** — The policy's Properties tab.
- **2:47** — The Monitor tab, where the two report tiles live.

Watching the state chips is a decent habit: Basics turns green as soon as the name and platform are set, Compliance settings turns green when you press Next, and so on. If a chip is still grey when you expect it ticked, that step is not finished.

## What the results look like

Evaluation starts as soon as the policy is assigned. Devices check in on a schedule — roughly every eight hours for Windows, and only when they are awake and reaching the service — so the first numbers take a little time to appear, and they move as machines report.

There are two places to read them, and they answer different questions. The policy's **Monitor** blade answers *which devices, and which setting?* The dashboard answers *how is the estate doing, and what else is broken?*

### The device status report

<figure>
<a href="/blog/compliance-policies-in-intune/09-policy-device-status.webp" target="_blank" rel="noopener"><img src="/blog/compliance-policies-in-intune/09-policy-device-status.webp" alt="CMP-Win11-Custom device status: Compliant 0, Noncompliant 1, Total 1, listing CLIENT01 with last contacted 26 October 2026." width="1700" height="726" loading="lazy" /></a>
<figcaption><strong>Figure 9.</strong> Policy status for the custom policy: one device, one failure. On the far right, the column I read before anything else — Last contacted, 26 October 2026.</figcaption>
</figure>

The counts at the top are the headline: **Compliant 0, Noncompliant 1, Total 1**. The table underneath names the device, the user, the device ID, the OS — and, on the far right, **Last contacted**.

That date is the part people skip, and it is the first thing I check. I recorded this in late November; the device had not checked in for a month. The status is therefore not a statement about the device now; it is a statement about the device in October. When a report looks wrong, read this column before opening a single setting. A device that is off, asleep, or off the network is not non-compliant; it is absent, and absence looks exactly like failure on a dashboard.

### The per-setting report

<figure>
<a href="/blog/compliance-policies-in-intune/10-per-setting-status.webp" target="_blank" rel="noopener"><img src="/blog/compliance-policies-in-intune/10-per-setting-status.webp" alt="Per-setting status for CMP-Win11-Custom: RdpDisabled with 1 compliant device, SMBv1Disabled with 1 noncompliant device." width="1700" height="650" loading="lazy" /></a>
<figcaption><strong>Figure 10.</strong> The per-setting view: RdpDisabled passed on the device, SMBv1Disabled failed on it. One device, one failed setting, and the device is non-compliant everywhere that matters.</figcaption>
</figure>

This is the view that turns a red device into a sentence you can send to the user. Two custom checks, one pass, one failure. Compliance is all-or-nothing at the device level: pass nine checks, fail the tenth, and the device is non-compliant in Conditional Access, on the dashboard, and in the user's Company Portal.

So the per-setting report is how you find the tenth, and it usually tells you what the fix is. Here the failing setting is `SMBv1Disabled`, and SMBv1 is the protocol WannaCry spread through. It is not installed by default on current Windows builds, so a failure usually means something put it back: an old application, a legacy appliance, a copied image, a fix someone applied years ago and never removed. That is a ticket, not a waiver.

### The dashboard

<figure>
<a href="/blog/compliance-policies-in-intune/11-dashboard-compliance-tile.webp" target="_blank" rel="noopener"><img src="/blog/compliance-policies-in-intune/11-dashboard-compliance-tile.webp" alt="My Dashboard showing Device compliance 2 devices not in compliance, Device configuration 3 policies with error or conflict, and a compliance status table with 0 compliant and 2 not compliant." width="1700" height="759" loading="lazy" /></a>
<figcaption><strong>Figure 11.</strong> The dashboard, which is where most people start their morning. Two red tiles, and they are not the same kind of red.</figcaption>
</figure>

The dashboard rolls the tenant up: **Device compliance** counts devices failing a compliance policy, **Device configuration** counts policies that failed to apply, and the table underneath splits devices by state — Compliant, In grace period, Not evaluated, Not compliant.

Three readings worth having in your head:

**The two red tiles are different products.** *Device compliance* is your policy results. *Device configuration* is profile delivery — a conflict, a bad setting, an unsupported configuration. Both matter, but fixing three broken configuration profiles would not have moved a single device towards compliant. Read the tile label before you open the tile.

**Not evaluated is the row that finds targeting gaps.** Two devices enrolled, two evaluated, no orphans — which is good news. If a device appears there, nothing is assessing it, and Conditional Access will treat it as non-compliant. Assignment mistakes show up in this row rather than in a red tile.

**Zero of two is a message about the policy, not the users.** The one device the policy reports on fails its SMBv1 check. At one of two I would go looking for the difference between the machines; at zero of two I look at the policy first, because the common factor is the requirement, not the hardware.

### Reading the four states

<div class="table-wrap">
<table>
<thead>
<tr><th>What you see</th><th>What it means</th><th>What to do next</th></tr>
</thead>
<tbody>
<tr><td>Compliant, all devices</td><td>The settings are being met</td><td>Check the policy is not empty, then tighten it</td></tr>
<tr><td>Some non-compliant</td><td>Real failures on specific settings</td><td>Open per-setting status and fix that setting</td></tr>
<tr><td>In grace period</td><td>Failing, but inside your delay</td><td>Tell the user; the clock is running</td></tr>
<tr><td>Not evaluated</td><td>Nothing is assessing the device</td><td>Check the group, the platform, the last check-in</td></tr>
<tr><td>Compliant, instantly, after assignment</td><td>The policy has nothing to test</td><td>Read the review page, then add settings</td></tr>
</tbody>
</table>
</div>

## If the results look wrong

- **The report is empty.** The policy is assigned to a user group, not a device group, or the platform does not match the devices. Both fail silently.
- **A device is stuck on its old status.** Look at Last contacted. It has not checked in, and nothing about the policy will change until it does.
- **Everything is compliant immediately.** The policy has no configured settings. The review page shows this before you create it.
- **A custom check shows pending or error.** The discovery script did not return usable JSON. Test it on the device with the same account Intune uses to run it.
- **One device fails one setting.** That is the policy working. Read the per-setting report, fix the setting, let the next check-in confirm it.

## Before you create your first policy

- Name and describe it at creation, with the platform and the date, instead of typing `new`.
- Set a minimum OS version in Device properties, so unsupported builds fail rather than pass by omission.
- Turn on encryption, firewall and TPM in System security before writing a single custom check.
- Add the email action at day one, with enforcement at day seven, and put the Company Portal link in the template.
- Configure Machine Risk Score in the Defender section, if the connector is already there.
- Assign it to a pilot group, and read the review page before pressing Create.

None of those are advanced. They are the difference between a policy that describes security and one that produces a green number.

The recording took under three minutes. Reading the results honestly takes longer, and that is the part worth practising — because the console will happily agree with whatever you built, including a policy that asks nothing.
