"use client";

import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  Bug,
  Eye,
  Ghost,
  Zap,
  AlertTriangle,
  Terminal,
  Code2,
  Globe,
} from "lucide-react";

import { AlertDashboard } from "@/components/blue-team/AlertDashboard";
import { IntelConsole } from "@/components/blue-team/IntelConsole";
import { RuleEngine } from "@/components/blue-team/RuleEngine";
import { ThreatIntelDashboard } from "@/components/blue-team/ThreatIntelDashboard";
import { ExploitConsole } from "@/components/red-team/ExploitConsole";
import { GhostShell } from "@/components/red-team/GhostShell";
import { ReconModule } from "@/components/red-team/ReconModule";
import { PayloadGenerator } from "@/components/red-team/PayloadGenerator";

export default function HomePage() {
  const [activeTeam, setActiveTeam] = useState<"blue" | "red">("blue");

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center">
                <span className="text-2xl">🌫️</span>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Violet Haze
                </h1>
                <p className="text-xs text-muted-foreground">
                  Purple Team Toolkit
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="hidden sm:flex">
                <div className="h-2 w-2 rounded-full bg-green-500 mr-2 animate-pulse" />
                Systems Online
              </Badge>
              <div className="flex rounded-lg overflow-hidden border">
                <button
                  onClick={() => setActiveTeam("blue")}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    activeTeam === "blue"
                      ? "bg-blue-600 text-white"
                      : "bg-transparent hover:bg-muted"
                  }`}
                >
                  <Shield className="h-4 w-4 inline mr-1" />
                  Blue Team
                </button>
                <button
                  onClick={() => setActiveTeam("red")}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    activeTeam === "red"
                      ? "bg-red-600 text-white"
                      : "bg-transparent hover:bg-muted"
                  }`}
                >
                  <Bug className="h-4 w-4 inline mr-1" />
                  Red Team
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {activeTeam === "blue" ? (
          <BlueTeamSection />
        ) : (
          <RedTeamSection />
        )}
      </main>

      <footer className="border-t border-border mt-12 py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>
            🌫️ Violet Haze — "You gaze into the Violet Haze, and the Haze gazes
            also into you."
          </p>
          <p className="mt-1">
            For demonstration, training, and chaos engineering only.
          </p>
        </div>
      </footer>
    </div>
  );
}

function BlueTeamSection() {
  return (
    <Tabs defaultValue="alerts" className="space-y-6">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="alerts" className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          <span className="hidden sm:inline">Alerts</span>
        </TabsTrigger>
        <TabsTrigger value="intel" className="flex items-center gap-2">
          <Terminal className="h-4 w-4" />
          <span className="hidden sm:inline">Intel Console</span>
        </TabsTrigger>
        <TabsTrigger value="rules" className="flex items-center gap-2">
          <Code2 className="h-4 w-4" />
          <span className="hidden sm:inline">Rule Engine</span>
        </TabsTrigger>
        <TabsTrigger value="threat-intel" className="flex items-center gap-2">
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">Threat Intel</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="alerts">
        <AlertDashboard />
      </TabsContent>
      <TabsContent value="intel">
        <IntelConsole />
      </TabsContent>
      <TabsContent value="rules">
        <RuleEngine />
      </TabsContent>
      <TabsContent value="threat-intel">
        <ThreatIntelDashboard />
      </TabsContent>
    </Tabs>
  );
}

function RedTeamSection() {
  return (
    <Tabs defaultValue="exploit" className="space-y-6">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="exploit" className="flex items-center gap-2">
          <Bug className="h-4 w-4" />
          <span className="hidden sm:inline">Exploit</span>
        </TabsTrigger>
        <TabsTrigger value="recon" className="flex items-center gap-2">
          <Eye className="h-4 w-4" />
          <span className="hidden sm:inline">Recon</span>
        </TabsTrigger>
        <TabsTrigger value="payload" className="flex items-center gap-2">
          <Zap className="h-4 w-4" />
          <span className="hidden sm:inline">Payload Gen</span>
        </TabsTrigger>
        <TabsTrigger value="ghost" className="flex items-center gap-2">
          <Ghost className="h-4 w-4" />
          <span className="hidden sm:inline">GhostShell</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="exploit">
        <ExploitConsole />
      </TabsContent>
      <TabsContent value="recon">
        <ReconModule />
      </TabsContent>
      <TabsContent value="payload">
        <PayloadGenerator />
      </TabsContent>
      <TabsContent value="ghost">
        <GhostShell />
      </TabsContent>
    </Tabs>
  );
}
