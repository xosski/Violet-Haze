"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Eye,
  Globe,
  Server,
  Wifi,
  Search,
  FileText,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

interface ScanResult {
  type: string;
  target: string;
  data: Record<string, any>;
  timestamp: Date;
}

export function ReconModule() {
  const [target, setTarget] = useState("");
  const [scanning, setScanning] = useState(false);
  const [results, setResults] = useState<ScanResult[]>([]);

  const runScan = async (scanType: string) => {
    if (!target.trim()) {
      toast.error("Enter a target domain or IP");
      return;
    }

    setScanning(true);
    toast.info(`Running ${scanType} scan on ${target}...`);

    // Simulated scan delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const mockResults: Record<string, Record<string, any>> = {
      dns: {
        "A Records": ["192.168.1.1", "192.168.1.2"],
        "MX Records": ["mail.example.com"],
        "NS Records": ["ns1.example.com", "ns2.example.com"],
        "TXT Records": ["v=spf1 include:_spf.example.com ~all"],
      },
      whois: {
        Registrar: "Example Registrar Inc.",
        Created: "2020-01-15",
        Expires: "2025-01-15",
        "Name Servers": ["ns1.example.com", "ns2.example.com"],
        Status: "clientTransferProhibited",
      },
      ports: {
        "22/tcp": "SSH - OpenSSH 8.2",
        "80/tcp": "HTTP - nginx 1.18.0",
        "443/tcp": "HTTPS - nginx 1.18.0",
        "3306/tcp": "MySQL 8.0.23",
        "6379/tcp": "Redis 6.0.10",
      },
      subdomains: {
        Found: [
          "www.example.com",
          "api.example.com",
          "mail.example.com",
          "dev.example.com",
          "staging.example.com",
          "admin.example.com",
        ],
        "Total Found": 6,
      },
      headers: {
        Server: "nginx/1.18.0",
        "X-Powered-By": "Express",
        "Content-Security-Policy": "default-src 'self'",
        "Strict-Transport-Security": "max-age=31536000",
        "X-Frame-Options": "DENY",
      },
    };

    const result: ScanResult = {
      type: scanType,
      target,
      data: mockResults[scanType] || {},
      timestamp: new Date(),
    };

    setResults((prev) => [result, ...prev]);
    setScanning(false);
    toast.success(`${scanType} scan complete`);
  };

  const exportResults = () => {
    const content = JSON.stringify(results, null, 2);
    const blob = new Blob([content], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `recon_${target}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Results exported");
  };

  return (
    <Card className="border-red-500/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5 text-red-500" />
          Reconnaissance Module
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Target Input */}
        <div className="flex gap-2">
          <Input
            placeholder="Enter target domain or IP (e.g., example.com)"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            className="flex-1"
          />
          <Button onClick={exportResults} variant="outline" disabled={results.length === 0}>
            <FileText className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>

        {/* Scan Types */}
        <Tabs defaultValue="dns">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dns">
              <Globe className="h-4 w-4 mr-1" />
              DNS
            </TabsTrigger>
            <TabsTrigger value="whois">
              <Search className="h-4 w-4 mr-1" />
              WHOIS
            </TabsTrigger>
            <TabsTrigger value="ports">
              <Server className="h-4 w-4 mr-1" />
              Ports
            </TabsTrigger>
            <TabsTrigger value="subdomains">
              <Wifi className="h-4 w-4 mr-1" />
              Subdomains
            </TabsTrigger>
            <TabsTrigger value="headers">
              <FileText className="h-4 w-4 mr-1" />
              Headers
            </TabsTrigger>
          </TabsList>

          {["dns", "whois", "ports", "subdomains", "headers"].map((scanType) => (
            <TabsContent key={scanType} value={scanType} className="space-y-4">
              <Button
                onClick={() => runScan(scanType)}
                disabled={scanning}
                variant="red"
                className="w-full"
              >
                {scanning ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                    Scanning...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Run {scanType.toUpperCase()} Scan
                  </>
                )}
              </Button>

              {/* Results for this scan type */}
              {results
                .filter((r) => r.type === scanType)
                .slice(0, 1)
                .map((result, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Target: {result.target}</span>
                      <span>{result.timestamp.toLocaleString()}</span>
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Property</TableHead>
                          <TableHead>Value</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {Object.entries(result.data).map(([key, value]) => (
                          <TableRow key={key}>
                            <TableCell className="font-medium">{key}</TableCell>
                            <TableCell className="font-mono text-sm">
                              {Array.isArray(value) ? (
                                <div className="flex flex-wrap gap-1">
                                  {value.map((v, i) => (
                                    <Badge key={i} variant="secondary">
                                      {v}
                                    </Badge>
                                  ))}
                                </div>
                              ) : (
                                String(value)
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ))}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
