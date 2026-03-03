"use client";

import Link from "next/link";
import {
  ClipboardCheck,
  FlaskConical,
  FileText,
  AlertTriangle,
  TriangleAlert,
  Search,
  Megaphone,
  ShieldCheck,
  TrendingUp,
  Clock,
  ShieldAlert,
  CheckCircle2,
  Monitor,
  Dumbbell,
  Flame,
  HeartPulse,
  HardHat,
  GraduationCap,
  Phone,
} from "lucide-react";
import { useEffect, useState } from "react";
import { loadFromStore, timeAgo } from "@/lib/utils";

const quickActions = [
  { href: "/risk-assessment", label: "Risk\nAssessment", icon: ClipboardCheck, color: "var(--color-safety-orange)" },
  { href: "/coshh", label: "COSHH", icon: FlaskConical, color: "var(--color-safety-purple)" },
  { href: "/rams", label: "RAMS", icon: FileText, color: "var(--color-safety-blue)" },
  { href: "/incidents", label: "Incident\nReport", icon: AlertTriangle, color: "var(--color-safety-red)" },
  { href: "/near-miss", label: "Near\nMiss", icon: TriangleAlert, color: "var(--color-safety-yellow)" },
  { href: "/inspections", label: "Site\nInspection", icon: Search, color: "var(--color-safety-green)" },
  { href: "/dse", label: "DSE\nAssessment", icon: Monitor, color: "var(--color-safety-green)" },
  { href: "/manual-handling", label: "Manual\nHandling", icon: Dumbbell, color: "var(--color-safety-yellow)" },
  { href: "/toolbox-talks", label: "Toolbox\nTalks", icon: Megaphone, color: "var(--color-safety-orange)" },
  { href: "/permits", label: "Permits\nto Work", icon: ShieldCheck, color: "var(--color-safety-blue)" },
  { href: "/fire-drills", label: "Fire\nDrills", icon: Flame, color: "var(--color-safety-red)" },
  { href: "/first-aid", label: "First\nAid Log", icon: HeartPulse, color: "var(--color-safety-red)" },
  { href: "/ppe-register", label: "PPE\nRegister", icon: HardHat, color: "var(--color-safety-blue)" },
  { href: "/training-records", label: "Training\nRecords", icon: GraduationCap, color: "var(--color-safety-green)" },
  { href: "/emergency-contacts", label: "Emergency\nContacts", icon: Phone, color: "var(--color-safety-red)" },
];

interface ActivityItem {
  id: string;
  type: string;
  title: string;
  createdAt: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalAssessments: 0,
    openRisks: 0,
    incidents: 0,
    inspections: 0,
    training: 0,
    firstAid: 0,
  });
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);

  useEffect(() => {
    // Gather stats from localStorage
    const risks = loadFromStore<{ id: string; title: string; createdAt: string; riskLevel?: string }[]>("risk_assessments", []);
    const coshh = loadFromStore<{ id: string; substanceName: string; createdAt: string }[]>("coshh_assessments", []);
    const rams = loadFromStore<{ id: string; taskTitle: string; createdAt: string }[]>("rams", []);
    const incidents = loadFromStore<{ id: string; description: string; createdAt: string }[]>("incidents", []);
    const nearMisses = loadFromStore<{ id: string; description: string; createdAt: string }[]>("near_misses", []);
    const inspections = loadFromStore<{ id: string; siteName: string; createdAt: string }[]>("inspections", []);
    const talks = loadFromStore<{ id: string; topic: string; createdAt: string }[]>("toolbox_talks", []);
    const permits = loadFromStore<{ id: string; description: string; createdAt: string }[]>("permits", []);
    const dse = loadFromStore<{ id: string; employeeName: string; createdAt: string }[]>("dse_assessments", []);
    const manualHandling = loadFromStore<{ id: string; taskDescription: string; createdAt: string }[]>("manual_handling", []);
    const fireDrills = loadFromStore<{ id: string; location: string; createdAt: string }[]>("fire_drills", []);
    const firstAid = loadFromStore<{ id: string; patientName: string; createdAt: string }[]>("first_aid_log", []);
    const ppe = loadFromStore<{ id: string; ppeType: string; createdAt: string }[]>("ppe_register", []);
    const training = loadFromStore<{ id: string; courseName: string; createdAt: string }[]>("training_records", []);

    setStats({
      totalAssessments: risks.length + coshh.length + rams.length + dse.length + manualHandling.length,
      openRisks: risks.filter((r) => r.riskLevel === "high" || r.riskLevel === "critical").length,
      incidents: incidents.length + nearMisses.length,
      inspections: inspections.length,
      training: training.length,
      firstAid: firstAid.length,
    });

    // Build recent activity
    const allItems: ActivityItem[] = [
      ...risks.map((r) => ({ id: r.id, type: "Risk Assessment", title: r.title, createdAt: r.createdAt })),
      ...coshh.map((c) => ({ id: c.id, type: "COSHH", title: c.substanceName, createdAt: c.createdAt })),
      ...rams.map((r) => ({ id: r.id, type: "RAMS", title: r.taskTitle, createdAt: r.createdAt })),
      ...incidents.map((i) => ({ id: i.id, type: "Incident", title: i.description, createdAt: i.createdAt })),
      ...nearMisses.map((n) => ({ id: n.id, type: "Near Miss", title: n.description, createdAt: n.createdAt })),
      ...inspections.map((i) => ({ id: i.id, type: "Inspection", title: i.siteName, createdAt: i.createdAt })),
      ...talks.map((t) => ({ id: t.id, type: "Toolbox Talk", title: t.topic, createdAt: t.createdAt })),
      ...permits.map((p) => ({ id: p.id, type: "Permit", title: p.description, createdAt: p.createdAt })),
      ...dse.map((d) => ({ id: d.id, type: "DSE", title: d.employeeName, createdAt: d.createdAt })),
      ...manualHandling.map((m) => ({ id: m.id, type: "Manual Handling", title: m.taskDescription, createdAt: m.createdAt })),
      ...fireDrills.map((f) => ({ id: f.id, type: "Fire Drill", title: f.location, createdAt: f.createdAt })),
      ...firstAid.map((f) => ({ id: f.id, type: "First Aid", title: f.patientName, createdAt: f.createdAt })),
      ...ppe.map((p) => ({ id: p.id, type: "PPE", title: p.ppeType, createdAt: p.createdAt })),
      ...training.map((t) => ({ id: t.id, type: "Training", title: t.courseName, createdAt: t.createdAt })),
    ];
    allItems.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setRecentActivity(allItems.slice(0, 10));
  }, []);

  const kpis = [
    {
      label: "Total Assessments",
      value: stats.totalAssessments,
      icon: ClipboardCheck,
      color: "var(--color-safety-blue)",
    },
    {
      label: "High/Critical Risks",
      value: stats.openRisks,
      icon: ShieldAlert,
      color: "var(--color-safety-red)",
    },
    {
      label: "Incidents Logged",
      value: stats.incidents,
      icon: AlertTriangle,
      color: "var(--color-safety-orange)",
    },
    {
      label: "Inspections Done",
      value: stats.inspections,
      icon: CheckCircle2,
      color: "var(--color-safety-green)",
    },
    {
      label: "Training Records",
      value: stats.training,
      icon: GraduationCap,
      color: "var(--color-safety-purple)",
    },
    {
      label: "First Aid Entries",
      value: stats.firstAid,
      icon: HeartPulse,
      color: "var(--color-safety-red)",
    },
  ];

  return (
    <div className="px-4 pt-6 pb-28 md:px-8 md:pt-8 md:pb-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <p className="text-sm font-medium mb-1" style={{ color: "var(--color-text-muted)" }}>
          Welcome back 👋
        </p>
        <h1 className="text-2xl font-bold" style={{ color: "var(--color-text-primary)" }}>
          Dashboard
        </h1>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        {kpis.map((kpi, i) => (
          <div
            key={kpi.label}
            className="card stagger-item"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: `${kpi.color}15` }}
              >
                <kpi.icon size={16} style={{ color: kpi.color }} />
              </div>
              <TrendingUp size={14} style={{ color: "var(--color-text-muted)" }} />
            </div>
            <p
              className="text-2xl font-bold mb-0.5"
              style={{ color: "var(--color-text-primary)" }}
            >
              {kpi.value}
            </p>
            <p className="text-xs font-medium" style={{ color: "var(--color-text-muted)" }}>
              {kpi.label}
            </p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-6">
        <p className="section-header px-1">Quick Actions</p>
        <div className="grid grid-cols-4 md:grid-cols-5 gap-2.5">
          {quickActions.map((action, i) => (
            <Link
              key={action.href}
              href={action.href}
              className="flex flex-col items-center gap-2 p-3 rounded-2xl transition-all duration-200 stagger-item"
              style={{
                background: "var(--color-bg-card)",
                border: "1px solid var(--color-border)",
                textDecoration: "none",
                animationDelay: `${i * 40}ms`,
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: `${action.color}15` }}
              >
                <action.icon size={20} style={{ color: action.color }} />
              </div>
              <span
                className="text-[10px] font-semibold text-center leading-tight"
                style={{
                  color: "var(--color-text-secondary)",
                  whiteSpace: "pre-line",
                }}
              >
                {action.label}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <p className="section-header px-1">Recent Activity</p>
        {recentActivity.length === 0 ? (
          <div className="empty-state">
            <Clock size={32} style={{ color: "var(--color-text-muted)", marginBottom: "0.75rem" }} />
            <p className="text-sm font-medium" style={{ color: "var(--color-text-muted)" }}>
              No activity yet
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>
              Start by creating a risk assessment or report
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {recentActivity.map((item, i) => (
              <div
                key={item.id}
                className="card card-compact flex items-center gap-3 stagger-item"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(249,115,22,0.1)" }}
                >
                  <ClipboardCheck size={14} style={{ color: "var(--color-safety-orange)" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className="text-sm font-medium truncate"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    {item.title || "Untitled"}
                  </p>
                  <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                    {item.type}
                  </p>
                </div>
                <span className="text-[10px] font-medium flex-shrink-0" style={{ color: "var(--color-text-muted)" }}>
                  {timeAgo(item.createdAt)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
