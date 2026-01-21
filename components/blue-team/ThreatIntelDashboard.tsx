"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Globe, AlertTriangle, MapPin } from "lucide-react";
import { toast } from "sonner";

interface ThreatIntelResult {
  ip: string;
  reputation: string;
  riskScore: number;
  source: string;
  associatedDomains: string[];
  geoLocation: string;
  country: string;
  lastSeen: string;
  threatType: string[];
}

export function ThreatIntelDashboard() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ThreatIntelResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  const queryThreatIntel = async () => {
    if (!query.trim()) {
      toast.error("Please enter an IP address or domain");
      return;
    }

    setLoading(true);
    
    // Simulated threat intel lookup
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const mockResult: ThreatIntelResult = {
      ip: query,
      reputation: Math.random() > 0.5 ? "High Risk" : "Moderate Risk",
      riskScore: Math.floor(Math.random() * 100),
      source: ["AbuseIPDB", "VirusTotal", "OTX"][Math.floor(Math.random() * 3)],
      associatedDomains: ["malware-c2.ru", "phishing-site.xyz", "evil.corp"].slice(
        0,
        Math.floor(Math.random() * 3) + 1
      ),
      geoLocation: "Eastern Europe",
      country: ["Russia", "China", "North Korea"][Math.floor(Math.random() * 3)],
      lastSeen: new Date().toISOString(),
      threatType: ["C2", "Malware", "Phishing", "Spam"].slice(
        0,
        Math.floor(Math.random() * 3) + 1
      ),
    };

    setResults((prev) => [mockResult, ...prev]);
    setHistory((prev) => [query, ...prev.filter((h) => h !== query)].slice(0, 10));
    setLoading(false);
    toast.success("Threat intelligence query complete");
  };

  const getRiskColor = (score: number) => {
    if (score >= 70) return "text-red-500";
    if (score >= 40) return "text-yellow-500";
    return "text-green-500";
  };

  return (
    <div className="space-y-6">
      {/* Query Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-blue-500" />
            Threat Intelligence Query
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter IP address, domain, or hash..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && queryThreatIntel()}
              className="flex-1"
            />
            <Button onClick={queryThreatIntel} disabled={loading} variant="blue">
              {loading ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                  Querying...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Query Intel
                </>
              )}
            </Button>
          </div>

          {/* Quick History */}
          {history.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <span className="text-xs text-muted-foreground">Recent:</span>
              {history.slice(0, 5).map((h) => (
                <Badge
                  key={h}
                  variant="secondary"
                  className="cursor-pointer hover:bg-secondary/80"
                  onClick={() => setQuery(h)}
                >
                  {h}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Table */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Intelligence Results ({results.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Indicator</TableHead>
                  <TableHead>Risk Score</TableHead>
                  <TableHead>Reputation</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Threat Types</TableHead>
                  <TableHead>Associated Domains</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((result, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-mono">{result.ip}</TableCell>
                    <TableCell>
                      <span className={`font-bold ${getRiskColor(result.riskScore)}`}>
                        {result.riskScore}/100
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          result.reputation === "High Risk"
                            ? "destructive"
                            : "warning"
                        }
                      >
                        {result.reputation}
                      </Badge>
                    </TableCell>
                    <TableCell>{result.source}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {result.country}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {result.threatType.map((type) => (
                          <Badge key={type} variant="outline" className="text-xs">
                            {type}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {result.associatedDomains.map((domain) => (
                          <Badge
                            key={domain}
                            variant="secondary"
                            className="text-xs font-mono"
                          >
                            {domain}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
