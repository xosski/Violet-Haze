import { NextResponse } from "next/server";

interface Alert {
  id: string;
  title: string;
  severity: "critical" | "warning" | "info" | "low";
  description: string;
  source: string;
  timestamp: number;
}

const mockAlerts: Alert[] = [
  {
    id: "1",
    title: "Brute Force Attack Detected",
    severity: "critical",
    description: "Multiple failed login attempts from IP 192.168.1.100",
    source: "SIEM",
    timestamp: Date.now() - 300000,
  },
  {
    id: "2",
    title: "Suspicious Outbound Connection",
    severity: "critical",
    description: "Connection to known C2 server detected on port 443",
    source: "Firewall",
    timestamp: Date.now() - 600000,
  },
  {
    id: "3",
    title: "Privilege Escalation Attempt",
    severity: "warning",
    description: "User attempted to access /etc/shadow without authorization",
    source: "Endpoint",
    timestamp: Date.now() - 900000,
  },
  {
    id: "4",
    title: "Unusual PowerShell Activity",
    severity: "warning",
    description: "Encoded PowerShell command executed with bypass flags",
    source: "EDR",
    timestamp: Date.now() - 1200000,
  },
  {
    id: "5",
    title: "Port Scan Detected",
    severity: "warning",
    description: "Sequential port scanning from external IP 45.33.32.156",
    source: "IDS",
    timestamp: Date.now() - 1500000,
  },
  {
    id: "6",
    title: "TLS Certificate Expired",
    severity: "info",
    description: "Certificate for api.internal.corp expired 2 days ago",
    source: "Certificate Monitor",
    timestamp: Date.now() - 1800000,
  },
  {
    id: "7",
    title: "New Device Connected",
    severity: "info",
    description: "Unknown USB device connected to workstation WS-042",
    source: "DLP",
    timestamp: Date.now() - 2100000,
  },
  {
    id: "8",
    title: "Failed Backup Job",
    severity: "low",
    description: "Scheduled backup for file server FS-01 failed",
    source: "Backup System",
    timestamp: Date.now() - 2400000,
  },
];

export async function GET() {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const randomizeTimestamps = mockAlerts.map((alert) => ({
    ...alert,
    timestamp: Date.now() - Math.floor(Math.random() * 3600000),
  }));

  return NextResponse.json(randomizeTimestamps);
}
