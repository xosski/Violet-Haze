"use client";

import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  Download,
  Trash2,
  Send,
  Wifi,
  WifiOff,
} from "lucide-react";
import { toast } from "sonner";

interface LogEntry {
  id: string;
  timestamp: Date;
  type: "info" | "warning" | "error" | "success";
  message: string;
  source?: string;
}

export function IntelConsole() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [apiInput, setApiInput] = useState("");
  const [connected, setConnected] = useState(false);
  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  const addLog = (
    message: string,
    type: LogEntry["type"] = "info",
    source?: string
  ) => {
    const entry: LogEntry = {
      id: Date.now().toString(),
      timestamp: new Date(),
      type,
      message,
      source,
    };
    setLogs((prev) => [...prev, entry]);
  };

  const simulateIntel = () => {
    const events = [
      {
        msg: "Suspicious DNS request to malware-c2.ru detected",
        type: "warning" as const,
      },
      {
        msg: "Outbound connection to known botnet IP blocked",
        type: "error" as const,
      },
      {
        msg: "TLS certificate mismatch on internal service",
        type: "warning" as const,
      },
      {
        msg: "New IOC hash match: SHA256 a1b2c3d4...",
        type: "error" as const,
      },
      {
        msg: "Firewall rule triggered: Port scan attempt",
        type: "warning" as const,
      },
      { msg: "Threat feed updated: 42 new indicators", type: "info" as const },
      { msg: "System health check passed", type: "success" as const },
    ];
    const event = events[Math.floor(Math.random() * events.length)];
    addLog(event.msg, event.type, "ThreatFeed");
  };

  const pushToLog = () => {
    if (!apiInput.trim()) {
      toast.error("No input to push");
      return;
    }
    addLog(`API Input: ${apiInput}`, "info", "User");
    setApiInput("");
  };

  const exportLogs = () => {
    const content = logs
      .map(
        (log) =>
          `[${log.timestamp.toISOString()}] [${log.type.toUpperCase()}] ${
            log.source ? `[${log.source}] ` : ""
          }${log.message}`
      )
      .join("\n");

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `intel_logs_${new Date().toISOString().split("T")[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Logs exported");
  };

  const clearLogs = () => {
    setLogs([]);
    toast.success("Logs cleared");
  };

  const toggleConnection = () => {
    setConnected(!connected);
    if (!connected) {
      addLog("Connected to threat intelligence feed", "success", "System");
      // Start simulating events
      const interval = setInterval(() => {
        if (Math.random() > 0.7) {
          simulateIntel();
        }
      }, 3000);
      return () => clearInterval(interval);
    } else {
      addLog("Disconnected from threat intelligence feed", "info", "System");
    }
  };

  const getLogColor = (type: LogEntry["type"]) => {
    switch (type) {
      case "error":
        return "text-red-400";
      case "warning":
        return "text-yellow-400";
      case "success":
        return "text-green-400";
      default:
        return "text-blue-400";
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Log Console */}
      <Card className="lg:col-span-1">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-500" />
            Intelligence Console
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge
              variant={connected ? "success" : "secondary"}
              className="flex items-center gap-1"
            >
              {connected ? (
                <Wifi className="h-3 w-3" />
              ) : (
                <WifiOff className="h-3 w-3" />
              )}
              {connected ? "Live" : "Offline"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            ref={logContainerRef}
            className="terminal-output h-80 overflow-y-auto text-sm"
          >
            {logs.length === 0 ? (
              <p className="text-gray-500">
                No logs yet. Connect to threat feed or simulate events...
              </p>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="py-1">
                  <span className="text-gray-500">
                    [{log.timestamp.toLocaleTimeString()}]
                  </span>{" "}
                  {log.source && (
                    <span className="text-purple-400">[{log.source}]</span>
                  )}{" "}
                  <span className={getLogColor(log.type)}>{log.message}</span>
                </div>
              ))
            )}
          </div>

          <div className="flex gap-2">
            <Button onClick={toggleConnection} variant={connected ? "destructive" : "blue"}>
              {connected ? (
                <>
                  <WifiOff className="h-4 w-4 mr-2" />
                  Disconnect
                </>
              ) : (
                <>
                  <Wifi className="h-4 w-4 mr-2" />
                  Connect Feed
                </>
              )}
            </Button>
            <Button onClick={simulateIntel} variant="outline">
              Simulate Event
            </Button>
            <Button onClick={exportLogs} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button onClick={clearLogs} variant="ghost">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* API Input */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>API Feed Input</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Drop API keys, targets, IOCs, or commands here..."
            value={apiInput}
            onChange={(e) => setApiInput(e.target.value)}
            className="min-h-[200px] font-mono"
          />
          <Button onClick={pushToLog} className="w-full">
            <Send className="h-4 w-4 mr-2" />
            Push to Log
          </Button>

          <div className="space-y-2">
            <h4 className="text-sm font-medium">Quick Actions</h4>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setApiInput("CHECK_IOC:192.168.1.100")}
              >
                Check IOC
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setApiInput("FETCH_FEED:alienvault")}
              >
                Fetch OTX
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setApiInput("UPDATE_RULES:yara")}
              >
                Update YARA
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setApiInput("SCAN_NETWORK:full")}
              >
                Network Scan
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
