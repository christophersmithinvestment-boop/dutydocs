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
  BarChart3,
  Calendar,
} from "lucide-react";
import { useEffect, useState } from "react";
import { loadFromStore, timeAgo, getExpiryStatus } from "@/lib/utils";
import { useSubscription } from "@/hooks/useSubscription";
import UpgradeModal from "@/components/UpgradeModal";

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
  const { isPro, hasModuleAccess } = useSubscription();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [modalConfig, setModalConfig] = useState({ title: "", description: "" });

  const [stats, setStats] = useState({
    totalAssessments: 0,
    openRisks: 0,
    incidents: 0,
    inspections: 0,
    training: 0,
    firstAid: 0,
    activePermits: 0,
    expiredTraining: 0,
    expiringTraining: 0,
    expiredPPE: 0,
    expiringPPE: 0,
    complianceScore: 100,
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
    const permits = loadFromStore<{ id: string; description: string; status: string; createdAt: string }[]>("permits", []);
    const dse = loadFromStore<{ id: string; employeeName: string; createdAt: string }[]>("dse_assessments", []);
    const manualHandling = loadFromStore<{ id: string; taskDescription: string; createdAt: string }[]>("manual_handling", []);
    const fireDrills = loadFromStore<{ id: string; location: string; createdAt: string }[]>("fire_drills", []);
    const firstAid = loadFromStore<{ id: string; patientName: string; createdAt: string }[]>("first_aid_log", []);
    const ppe = loadFromStore<{ id: string; ppeType: string; expiryDate?: string; createdAt: string }[]>("ppe_register", []);
    const training = loadFromStore<{ id: string; courseName: string; expiryDate?: string; createdAt: string }[]>("training_records", []);

    const expiredT = training.filter(t => getExpiryStatus(t.expiryDate) === "expired").length;
    const expiringT = training.filter(t => getExpiryStatus(t.expiryDate) === "expiring").length;
    const expiredP = ppe.filter(p => getExpiryStatus(p.expiryDate) === "expired").length;
    const expiringP = ppe.filter(p => getExpiryStatus(p.expiryDate) === "expiring").length;

    // Simple compliance score calculation
    const totalItems = training.length + ppe.length;
    const nonCompliant = expiredT + expiredP + expiringT + expiringP;
    const score = totalItems > 0 ? Math.max(0, Math.round(((totalItems - nonCompliant) / totalItems) * 100)) : 100;

    setStats({
      totalAssessments: risks.length + coshh.length + rams.length + dse.length + manualHandling.length,
      openRisks: risks.filter((r) => r.riskLevel === "high" || r.riskLevel === "critical").length,
      incidents: incidents.length + nearMisses.length,
      inspections: inspections.length,
      training: training.length,
      firstAid: firstAid.length,
      activePermits: permits.filter(p => p.status === "active").length,
      expiredTraining: expiredT,
      expiringTraining: expiringT,
      expiredPPE: expiredP,
      expiringPPE: expiringP,
      complianceScore: score,
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
      label: "High Risks",
      value: stats.openRisks,
      icon: ShieldAlert,
      color: "var(--color-safety-red)",
    },
    {
      label: "Active Permits",
      value: stats.activePermits,
      icon: ShieldCheck,
      color: "var(--color-safety-green)",
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
      color: "var(--color-safety-teal)",
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-sm font-medium mb-1" style={{ color: "var(--color-text-muted)" }}>
            Welcome back 👋
          </p>
          <h1 className="text-2xl font-bold" style={{ color: "var(--color-text-primary)" }}>
            Dashboard
          </h1>
        </div>
        <div className="hidden md:flex items-center gap-2">
          <div className="flex flex-col items-end">
            <span className="text-xs font-bold" style={{ color: "var(--color-text-primary)" }}>Compliance Score</span>
            <span className="text-xl font-black text-[var(--color-safety-green)]">{stats.complianceScore}%</span>
          </div>
          <div className="w-12 h-12 rounded-full border-4 flex items-center justify-center" style={{ borderColor: stats.complianceScore > 80 ? "var(--color-safety-green)" : "var(--color-safety-yellow)", background: stats.complianceScore > 80 ? "rgba(34,197,94,0.1)" : "rgba(234,179,8,0.1)" }}>
            <TrendingUp size={20} style={{ color: stats.complianceScore > 80 ? "var(--color-safety-green)" : "var(--color-safety-yellow)" }} />
          </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Left Column: KPI Grid */}
        <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-4">
          {kpis.map((kpi, i) => (
            <div
              key={kpi.label}
              className="card stagger-item hover:scale-[1.02] transition-transform cursor-default"
              style={{ animationDelay: `${i * 60}ms`, border: "1px solid var(--color-border-light)" }}
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: `${kpi.color}15` }}
                >
                  <kpi.icon size={18} style={{ color: kpi.color }} />
                </div>
              </div>
              <p className="text-2xl font-black mb-1" style={{ color: "var(--color-text-primary)" }}>
                {kpi.value}
              </p>
              <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>
                {kpi.label}
              </p>
            </div>
          ))}
        </div>

        {/* Right Column: Compliance & Summary */}
        <div className="space-y-4">
          <div className="card h-full flex flex-col justify-between" style={{ background: "var(--color-bg-secondary)", border: "none" }}>
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <BarChart3 size={16} className="text-[var(--color-accent)]" />
                  Compliance Status
                </h3>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${stats.complianceScore > 80 ? "bg-green-500/10 text-green-500" : "bg-yellow-500/10 text-yellow-500"}`}>
                  {stats.complianceScore > 80 ? "EXCELLENT" : "ATTENTION"}
                </span>
              </div>

              <div className="space-y-4">
                {/* Score Bar */}
                <div>
                  <div className="flex justify-between text-[10px] font-bold mb-1.5 uppercase opacity-60">
                    <span>Global Score</span>
                    <span>{stats.complianceScore}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full overflow-hidden bg-black/5 dark:bg-white/5">
                    <div
                      className="h-full bg-[var(--color-safety-green)] transition-all duration-1000"
                      style={{ width: `${stats.complianceScore}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-black/5 dark:bg-white/5">
                    <span className="text-[10px] font-bold uppercase opacity-60">Training Compliance</span>
                    <span className="text-xs font-bold" style={{ color: stats.expiredTraining > 0 ? "var(--color-safety-red)" : "var(--color-text-primary)" }}>
                      {stats.training - stats.expiredTraining}/{stats.training}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-black/5 dark:bg-white/5">
                    <span className="text-[10px] font-bold uppercase opacity-60">PPE Inspections</span>
                    <span className="text-xs font-bold" style={{ color: stats.expiredPPE > 0 ? "var(--color-safety-red)" : "var(--color-text-primary)" }}>
                      {stats.expiringPPE + stats.expiredPPE > 0 ? "ACTION REQ" : "COMPLIANT"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <Link href="/training-records" className="btn btn-primary btn-sm mt-4 w-full">
              View Compliance Report
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Actions Section */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <p className="section-header px-1">Quick Tools</p>
          <Link href="/more" className="text-[10px] font-bold uppercase text-[var(--color-accent)] hover:underline">
            See all modules
          </Link>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
          {quickActions.map((action, i) => {
            const moduleName = action.href.replace("/", "").replace(/-/g, "_");
            const isLocked = !hasModuleAccess(moduleName);

            return (
              <button
                key={action.href}
                onClick={(e) => {
                  if (isLocked) {
                    e.preventDefault();
                    setModalConfig({
                      title: "Unlock Premium Module",
                      description: `The ${action.label.replace("\n", " ")} module is exclusive to DutyDocs Pro users.`
                    });
                    setShowUpgradeModal(true);
                  } else {
                    window.location.href = action.href;
                  }
                }}
                className="flex flex-col items-center gap-3 p-4 rounded-2xl transition-all duration-300 stagger-item group hover:shadow-lg active:scale-95 border border-[var(--color-border-light)] bg-[var(--color-bg-card)]"
                style={{ animationDelay: `${i * 30}ms` }}
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center relative transition-transform group-hover:rotate-6"
                  style={{ background: `${action.color}15` }}
                >
                  <action.icon size={22} style={{ color: action.color }} />
                  {isLocked && (
                    <div className="absolute -top-1 -right-1 bg-[var(--color-bg-primary)] rounded-full p-1 border border-[var(--color-border)] shadow-md">
                      <ShieldAlert size={10} className="text-amber-500" />
                    </div>
                  )}
                </div>
                <span
                  className="text-[11px] font-bold text-center leading-tight transition-colors group-hover:text-[var(--color-text-primary)]"
                  style={{ color: "var(--color-text-secondary)", whiteSpace: "pre-line" }}
                >
                  {action.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Grid: Recent Activity & Calendar/Upcoming */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <p className="section-header px-1 mb-4">Recent Activity</p>
          {recentActivity.length === 0 ? (
            <div className="empty-state">
              <Clock size={32} style={{ color: "var(--color-text-muted)", marginBottom: "0.75rem" }} />
              <p className="text-sm font-medium" style={{ color: "var(--color-text-muted)" }}>No activity yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((item, i) => (
                <div
                  key={item.id}
                  className="card card-compact flex items-center gap-4 stagger-item hover:bg-[var(--color-bg-secondary)] transition-colors group"
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors"
                    style={{ background: "var(--color-bg-secondary)" }}
                  >
                    <ClipboardCheck size={16} className="text-[var(--color-accent)] opacity-60 group-hover:opacity-100" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate" style={{ color: "var(--color-text-primary)" }}>
                      {item.title || "Untitled Record"}
                    </p>
                    <p className="text-[10px] uppercase font-bold tracking-wider opacity-40">
                      {item.type}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold flex-shrink-0 opacity-40 uppercase">
                    {timeAgo(item.createdAt)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Reminders / Secondary Column */}
        <div>
          <p className="section-header px-1 mb-4">Daily Check</p>
          <div className="space-y-3">
            <div className="card p-4 flex flex-col gap-3" style={{ border: "2px dashed var(--color-border)" }}>
              <div className="flex items-center gap-3">
                <Calendar size={18} className="text-[var(--color-accent)]" />
                <div>
                  <p className="text-xs font-bold leading-tight" style={{ color: "var(--color-text-primary)" }}>Safety Briefing</p>
                  <p className="text-[10px] font-medium" style={{ color: "var(--color-text-muted)" }}>Ensure p-shift talk is complete</p>
                </div>
              </div>
              <button className="btn btn-ghost btn-xs w-fit text-[var(--color-accent)]" style={{ padding: 0 }}>
                + Record Talk
              </button>
            </div>

            <div className="card p-4 flex flex-col gap-3" style={{ border: "1px solid var(--color-border-light)" }}>
              <div className="flex items-center gap-3">
                <ShieldCheck size={18} className="text-[var(--color-safety-green)]" />
                <div>
                  <p className="text-xs font-bold leading-tight" style={{ color: "var(--color-text-primary)" }}>Site Inspection</p>
                  <p className="text-[10px] font-medium" style={{ color: "var(--color-text-muted)" }}>Walk-through due today</p>
                </div>
              </div>
              <button className="btn btn-ghost btn-xs w-fit text-[var(--color-accent)]" style={{ padding: 0 }}>
                + Start Inspection
              </button>
            </div>
          </div>
        </div>
      </div>

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        title={modalConfig.title}
        description={modalConfig.description}
      />
    </div>
  );
}
