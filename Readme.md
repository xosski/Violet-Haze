🌫️ Violet Haze - Purple Team Toolkit

"You gaze into the Violet Haze, and the Haze gazes also into you."
A modular, in-browser red/purple team toolkit for threat simulation, detection tuning, and security chaos... in pastel.

📦 What is Violet Haze?

Violet Haze is a web-based purple team toolkit designed to simulate threats, test detection rules, visualize alerts, and generally make SOC dashboards sweat. It consists of multiple React-based modules masquerading as “research tools,” with full client-side interactivity, suspicious amounts of red accents, and a dangerously low regard for restraint.

🧩 Modules Overview
1. AlertDashboard

Centralized feed for real-time alert data.

Auto-refreshes every 15 seconds (like your stress).

Severity-based visualization with flashy icons.

Allows acknowledgment of individual alerts.

2. IntelConsole

Terminal-style log viewer for simulated threat intelligence.

Supports:

Simulated threat events

Log export

Fake API feed interaction (input box for pretending)

Bonus: Buttons that look important.

3. RuleEngine

Build, manage, and test detection rules (regex/sigma/yara).

Features:

Custom rule creation (Label::Pattern)

Content scanning with rule matching

ML-inspired "Threat Score" via entropy and keyword density

YARA tab for writing rules (compilation not actually wired up... yet?).

4. ThreatIntelDashboard

Fancy IP/domain/hash reputation tool.

Randomized fake intel from "AbuseIPDB" or "OTX" to make you feel like it’s working.

Includes:

Associated domains

Threat types

Location mapping

Quick query history.

5. ExploitConsole

Retro terminal for simulated exploitation.

Commands like scan, exploit, and run all do mock things.

Interactive, stateful, and supports command history scrollback.

Typing help will make you feel powerful again.

6. GhostShell

Volatile in-memory script loader (b64 fragment injection).

TTL countdown, auto-purge, and zero disk writes.

Simulates base64 payload assembly and execution.

For when you want a vibe of APT32 but with React components.

7. ReconModule

Targeted recon with:

DNS

WHOIS

Port scan

Subdomain enumeration

Header inspection

Runs simulated scans with generated results.

Export recon data to JSON, for those who pretend to review it later.

🧪 Why?

Because building something this dramatic in React is somehow both an act of rebellion and a red team recruiting trick. Violet Haze can be used for:

SOC Training

Detection Testing

Red Team Demos

Pretending you're in a cyberpunk hacking anime

🛠️ Requirements

A browser.

Mild self-loathing.

No actual backend required (unless you add one for style points).

🚫 Disclaimer

Violet Haze does not perform real attacks. Everything is simulated, randomized, and over-designed. This is for demonstration, training, and chaos engineering only. Use responsibly—especially around impressionable interns.