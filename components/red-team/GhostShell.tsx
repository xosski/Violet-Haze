"use client";

import React, { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Ghost,
  UploadCloud,
  Trash2,
  Play,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

interface Fragment {
  index: number;
  payload: string;
  size: number;
}

export function GhostShell() {
  const [loaded, setLoaded] = useState(false);
  const [fragments, setFragments] = useState<Fragment[]>([]);
  const [ttl, setTtl] = useState(180);
  const [logs, setLogs] = useState<string[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const ghostShellBootstrap = `
(function ghostShellInit() {
    const fragments = {};
    let received = 0;

    function addFragment(index, payload) {
        if (!fragments[index]) {
            fragments[index] = payload;
            received++;
            console.log(\`[GHOST] Fragment \${index} accepted\`);
        }
    }

    function assemblePayload() {
        const fullPayload = Object.keys(fragments)
            .sort((a, b) => a - b)
            .map(i => fragments[i])
            .join('');

        try {
            console.log("[GHOST] Reassembling & executing payload...");
            (new Function(atob(fullPayload)))();
        } catch (e) {
            console.warn("[GHOST] Payload execution error:", e);
        }
    }

    window.injectGhostFragment = function(index, b64payload) {
        addFragment(index, b64payload);
    };

    window.assembleGhost = assemblePayload;

    console.log("[GHOST SHELL] Initialized");
})();
`;

  const addLog = (message: string) => {
    setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  const loadGhostShell = () => {
    try {
      // In a real scenario, this would inject into the page
      addLog("[GHOST SHELL] Bootstrap code loaded");
      addLog("[GHOST SHELL] Memory injection ready");
      setLoaded(true);

      // Start TTL countdown
      timerRef.current = setInterval(() => {
        setTtl((prev) => {
          if (prev <= 1) {
            purgeGhostShell();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      toast.success("GhostShell loaded into memory");
    } catch (e) {
      toast.error("Failed to load GhostShell");
    }
  };

  const purgeGhostShell = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setLoaded(false);
    setFragments([]);
    setTtl(180);
    addLog("[GHOST SHELL] TTL expired. Memory purged.");
    toast.info("GhostShell purged from memory");
  };

  const handleFileDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;

    const text = await file.text();
    const lines = text.trim().split("\n");

    const newFragments: Fragment[] = lines.map((line, i) => ({
      index: i,
      payload: line.replace(/[^A-Za-z0-9+/=]/g, ""),
      size: line.length,
    }));

    setFragments(newFragments);
    addLog(`[GHOST] Loaded ${newFragments.length} fragments from file`);
    
    newFragments.forEach((frag) => {
      addLog(`[GHOST] Fragment ${frag.index} accepted (${frag.size} bytes)`);
    });

    toast.success(`Injected ${newFragments.length} fragments`);
  };

  const executePayload = () => {
    if (fragments.length === 0) {
      toast.error("No fragments loaded");
      return;
    }

    addLog("[GHOST] Reassembling payload...");
    addLog("[GHOST] Executing assembled payload...");
    
    // Simulate execution
    setTimeout(() => {
      addLog("[GHOST] Payload execution complete");
      toast.success("Payload executed");
    }, 1000);
  };

  return (
    <Card className="border-red-500/30">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Ghost className="h-5 w-5 text-red-500" />
            GhostShell Module
          </div>
          {loaded && (
            <Badge variant="destructive" className="animate-pulse">
              <Clock className="h-3 w-3 mr-1" />
              TTL: {Math.floor(ttl / 60)}:{(ttl % 60).toString().padStart(2, "0")}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 rounded-lg bg-red-950/20 border border-red-500/20">
          <div className="flex items-center gap-2 text-red-400 text-sm mb-2">
            <AlertTriangle className="h-4 w-4" />
            <span>Volatile in-memory payload injector. Self-wipes after TTL.</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Operates fully in-browser. No disk writes. Fragments are base64
            encoded and assembled at runtime.
          </p>
        </div>

        {!loaded ? (
          <Button onClick={loadGhostShell} variant="red" className="w-full">
            <Ghost className="h-4 w-4 mr-2" />
            Load GhostShell
          </Button>
        ) : (
          <>
            {/* Fragment Upload */}
            <div
              onDrop={handleFileDrop}
              onDragOver={(e) => e.preventDefault()}
              className="border-2 border-dashed border-red-500/30 rounded-lg p-6 text-center hover:border-red-500/50 transition-colors cursor-pointer"
            >
              <UploadCloud className="h-8 w-8 mx-auto mb-2 text-red-400" />
              <p className="text-sm text-muted-foreground">
                Drop .txt with base64 fragments
              </p>
              {fragments.length > 0 && (
                <Badge variant="outline" className="mt-2">
                  {fragments.length} fragments loaded
                </Badge>
              )}
            </div>

            {/* Fragment List */}
            {fragments.length > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Fragments loaded</span>
                  <span>{fragments.length}</span>
                </div>
                <Progress value={(fragments.length / 10) * 100} className="h-2" />
              </div>
            )}

            {/* Console Output */}
            <div className="terminal-output h-40 overflow-y-auto text-xs">
              {logs.length === 0 ? (
                <span className="text-gray-500">Awaiting commands...</span>
              ) : (
                logs.map((log, i) => (
                  <div key={i} className={log.includes("error") ? "error" : ""}>
                    {log}
                  </div>
                ))
              )}
            </div>

            {/* Controls */}
            <div className="flex gap-2">
              <Button
                onClick={executePayload}
                disabled={fragments.length === 0}
                variant="red"
                className="flex-1"
              >
                <Play className="h-4 w-4 mr-2" />
                Execute Payload
              </Button>
              <Button onClick={purgeGhostShell} variant="outline">
                <Trash2 className="h-4 w-4 mr-2" />
                Purge
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
