"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Code2,
  Play,
  Plus,
  Trash2,
  FileText,
  Brain,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

interface Rule {
  id: string;
  label: string;
  pattern: string;
  type: "regex" | "yara" | "sigma";
  enabled: boolean;
}

interface ScanResult {
  rule: Rule;
  matches: string[];
  lineNumbers: number[];
}

export function RuleEngine() {
  const [rules, setRules] = useState<Rule[]>([
    {
      id: "1",
      label: "Suspicious IP",
      pattern: "\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b",
      type: "regex",
      enabled: true,
    },
    {
      id: "2",
      label: "Base64 Encoded",
      pattern: "[A-Za-z0-9+/]{40,}={0,2}",
      type: "regex",
      enabled: true,
    },
    {
      id: "3",
      label: "Malware Keywords",
      pattern: "malware|exploit|payload|shellcode|reverse.?shell",
      type: "regex",
      enabled: true,
    },
  ]);

  const [newRuleInput, setNewRuleInput] = useState("");
  const [scanInput, setScanInput] = useState("");
  const [scanResults, setScanResults] = useState<ScanResult[]>([]);
  const [mlScore, setMlScore] = useState<number | null>(null);
  const [scanning, setScanning] = useState(false);

  const addRule = () => {
    const parts = newRuleInput.split("::");
    if (parts.length < 2) {
      toast.error("Format: Label::pattern");
      return;
    }

    const [label, pattern] = parts;
    const newRule: Rule = {
      id: Date.now().toString(),
      label: label.trim(),
      pattern: pattern.trim(),
      type: "regex",
      enabled: true,
    };

    try {
      new RegExp(pattern);
      setRules([...rules, newRule]);
      setNewRuleInput("");
      toast.success(`Rule "${label}" added`);
    } catch {
      toast.error("Invalid regex pattern");
    }
  };

  const deleteRule = (id: string) => {
    setRules(rules.filter((r) => r.id !== id));
    toast.success("Rule deleted");
  };

  const toggleRule = (id: string) => {
    setRules(
      rules.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    );
  };

  const runScan = async () => {
    if (!scanInput.trim()) {
      toast.error("No input to scan");
      return;
    }

    setScanning(true);
    setScanResults([]);
    setMlScore(null);

    await new Promise((resolve) => setTimeout(resolve, 500));

    const results: ScanResult[] = [];
    const lines = scanInput.split("\n");

    for (const rule of rules.filter((r) => r.enabled)) {
      try {
        const regex = new RegExp(rule.pattern, "gi");
        const matches: string[] = [];
        const lineNumbers: number[] = [];

        lines.forEach((line, idx) => {
          const lineMatches = line.match(regex);
          if (lineMatches) {
            matches.push(...lineMatches);
            lineNumbers.push(idx + 1);
          }
        });

        if (matches.length > 0) {
          results.push({ rule, matches, lineNumbers });
        }
      } catch {
        // Skip invalid patterns
      }
    }

    // Calculate ML score (entropy + keyword density)
    const entropy = calculateEntropy(scanInput);
    const suspiciousKeywords = (
      scanInput.match(/malware|exploit|payload|hack|shell|admin|root|password/gi) || []
    ).length;
    const score = Math.min(
      100,
      Math.round(entropy * 10 + suspiciousKeywords * 5 + results.length * 10)
    );

    setScanResults(results);
    setMlScore(score);
    setScanning(false);

    if (results.length > 0) {
      toast.warning(`Found ${results.length} rule matches`);
    } else {
      toast.success("No threats detected");
    }
  };

  const calculateEntropy = (str: string): number => {
    const freq: Record<string, number> = {};
    for (const char of str) {
      freq[char] = (freq[char] || 0) + 1;
    }
    let entropy = 0;
    const len = str.length;
    for (const char in freq) {
      const p = freq[char] / len;
      entropy -= p * Math.log2(p);
    }
    return entropy;
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="rules" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="rules">
            <Code2 className="h-4 w-4 mr-2" />
            Rule Builder
          </TabsTrigger>
          <TabsTrigger value="scan">
            <FileText className="h-4 w-4 mr-2" />
            Scan Input
          </TabsTrigger>
          <TabsTrigger value="yara">
            <Brain className="h-4 w-4 mr-2" />
            YARA Rules
          </TabsTrigger>
        </TabsList>

        <TabsContent value="rules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Add Detection Rule</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Label::regex_pattern (e.g., SQLi::union.*select)"
                  value={newRuleInput}
                  onChange={(e) => setNewRuleInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addRule()}
                  className="flex-1"
                />
                <Button onClick={addRule} variant="blue">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Rule
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Active Rules ({rules.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {rules.map((rule) => (
                  <div
                    key={rule.id}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      rule.enabled ? "bg-card" : "bg-muted opacity-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={rule.enabled}
                        onChange={() => toggleRule(rule.id)}
                        className="h-4 w-4"
                      />
                      <div>
                        <div className="font-medium">{rule.label}</div>
                        <code className="text-xs text-muted-foreground">
                          {rule.pattern}
                        </code>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{rule.type}</Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteRule(rule.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scan" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Content Scanner</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Paste suspicious logs, code, or network traffic here..."
                value={scanInput}
                onChange={(e) => setScanInput(e.target.value)}
                className="min-h-[200px] font-mono text-sm"
              />
              <Button onClick={runScan} disabled={scanning} className="w-full">
                {scanning ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                    Scanning...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Run Detection Scan
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Results */}
          {(scanResults.length > 0 || mlScore !== null) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  Scan Results
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* ML Score */}
                {mlScore !== null && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Threat Score</span>
                      <span
                        className={
                          mlScore >= 70
                            ? "text-red-500"
                            : mlScore >= 40
                            ? "text-yellow-500"
                            : "text-green-500"
                        }
                      >
                        {mlScore}/100
                      </span>
                    </div>
                    <Progress
                      value={mlScore}
                      className="h-2"
                      indicatorClassName={
                        mlScore >= 70
                          ? "bg-red-500"
                          : mlScore >= 40
                          ? "bg-yellow-500"
                          : "bg-green-500"
                      }
                    />
                  </div>
                )}

                {/* Rule Matches */}
                {scanResults.length > 0 ? (
                  <div className="space-y-3">
                    {scanResults.map((result, idx) => (
                      <div key={idx} className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{result.rule.label}</span>
                          <Badge variant="destructive">
                            {result.matches.length} matches
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground mb-2">
                          Lines: {result.lineNumbers.join(", ")}
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {result.matches.slice(0, 5).map((match, i) => (
                            <Badge key={i} variant="secondary" className="font-mono text-xs">
                              {match.length > 30 ? match.slice(0, 30) + "..." : match}
                            </Badge>
                          ))}
                          {result.matches.length > 5 && (
                            <Badge variant="outline">
                              +{result.matches.length - 5} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-4">
                    No rule matches found
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="yara" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>YARA Rule Integration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder={`rule suspicious_pe {
    meta:
        description = "Detects suspicious PE files"
        author = "Purple Team"
    strings:
        $mz = { 4D 5A }
        $str1 = "CreateRemoteThread"
        $str2 = "VirtualAllocEx"
    condition:
        $mz at 0 and any of ($str*)
}`}
                className="min-h-[300px] font-mono text-sm"
              />
              <div className="flex gap-2">
                <Button variant="blue" className="flex-1">
                  Compile Rule
                </Button>
                <Button variant="outline">Load from File</Button>
                <Button variant="outline">Fetch from GitHub</Button>
              </div>
              <p className="text-xs text-muted-foreground">
                YARA rules are compiled and executed via the Python backend.
                Ensure the YARA service is running.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
