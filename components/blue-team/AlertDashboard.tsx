"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, ShieldCheck, ServerCrash, Shield } from "lucide-react";
import { toast } from "sonner";

interface Alert {
  id: string;
  title: string;
  severity: "critical" | "warning" | "info" | "low";
  description: string;
  source: string;
  timestamp: number;
  acknowledged?: boolean;
}

export function AlertDashboard() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async () => {
    try {
      const res = await fetch("/api/alerts");
      if (!res.ok) throw new Error("Failed to fetch alerts");
      const data = await res.json();
      setAlerts(data);
    } catch (err) {
      toast.error("Security alert sync failed. Check network or API access.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 15000);
    return () => clearInterval(interval);
  }, []);

  const getIcon = (severity: Alert["severity"]) => {
    switch (severity) {
      case "critical":
        return <ServerCrash className="h-5 w-5 text-red-500" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case "info":
        return <ShieldCheck className="h-5 w-5 text-blue-500" />;
      case "low":
        return <Shield className="h-5 w-5 text-gray-400" />;
    }
  };

  const acknowledgeAlert = (alert: Alert) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alert.id ? { ...a, acknowledged: true } : a))
    );
    toast.success(`Acknowledged: ${alert.title}`);
  };

  const stats = {
    critical: alerts.filter((a) => a.severity === "critical").length,
    warning: alerts.filter((a) => a.severity === "warning").length,
    info: alerts.filter((a) => a.severity === "info").length,
    total: alerts.length,
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-red-500/50">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-red-500">{stats.critical}</div>
            <div className="text-sm text-muted-foreground">Critical</div>
          </CardContent>
        </Card>
        <Card className="border-yellow-500/50">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-yellow-500">{stats.warning}</div>
            <div className="text-sm text-muted-foreground">Warnings</div>
          </CardContent>
        </Card>
        <Card className="border-blue-500/50">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-blue-500">{stats.info}</div>
            <div className="text-sm text-muted-foreground">Info</div>
          </CardContent>
        </Card>
        <Card className="border-purple-500/50">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-purple-500">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total Alerts</div>
          </CardContent>
        </Card>
      </div>

      {/* Alert Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <Card className="col-span-full">
            <CardContent className="p-8 text-center text-muted-foreground">
              Loading security alerts...
            </CardContent>
          </Card>
        ) : alerts.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="p-8 text-center text-muted-foreground">
              <ShieldCheck className="h-12 w-12 mx-auto mb-4 text-green-500" />
              No active alerts. System secure.
            </CardContent>
          </Card>
        ) : (
          alerts.map((alert) => (
            <Card
              key={alert.id}
              className={`transition-all ${
                alert.acknowledged ? "opacity-50" : ""
              } ${
                alert.severity === "critical"
                  ? "border-red-500/50 glow-red"
                  : ""
              }`}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getIcon(alert.severity)}
                    <CardTitle className="text-lg">{alert.title}</CardTitle>
                  </div>
                  <Badge
                    variant={alert.severity as any}
                    className="capitalize"
                  >
                    {alert.severity}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  {alert.description}
                </p>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Source: {alert.source}</span>
                  <span>{new Date(alert.timestamp).toLocaleString()}</span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full"
                  disabled={alert.acknowledged}
                  onClick={() => acknowledgeAlert(alert)}
                >
                  {alert.acknowledged ? "Acknowledged" : "Acknowledge"}
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
