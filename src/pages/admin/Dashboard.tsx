import React, { useEffect, useState } from "react";
import {
  reportService,
  type RevenueReportData,
  type AppointmentReportData,
  type PatientReportData,
} from "@/services/reportService";
import {
  appointmentService,
  type Appointment,
} from "@/services/appointmentService";
import { medicineService, type Medicine } from "@/services/medicineService";
import { formatCurrency } from "@/utils/currencyFormatter";
import {
  DollarSign,
  Calendar,
  Users,
  Pill,
  TrendingUp,
  Clock,
  CheckCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const DashboardPage: React.FC = () => {
  const [revenueData, setRevenueData] = useState<RevenueReportData | null>(
    null,
  );
  const [appointmentData, setAppointmentData] =
    useState<AppointmentReportData | null>(null);
  const [patientData, setPatientData] = useState<PatientReportData | null>(
    null,
  );
  const [recentAppointments, setRecentAppointments] = useState<Appointment[]>(
    [],
  );
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        // Let's set date range for last 30 days
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - 30);

        const format = (d: Date) => d.toISOString().split("T")[0];
        const startDateStr = format(start);
        const endDateStr = format(end);

        const [rev, app, pat, recent, meds] = await Promise.all([
          reportService
            .getRevenueReport(startDateStr, endDateStr)
            .catch(() => null),
          reportService
            .getAppointmentReport(startDateStr, endDateStr)
            .catch(() => null),
          reportService
            .getPatientReport(startDateStr, endDateStr)
            .catch(() => null),
          appointmentService.getAll({ limit: 5 }),
          medicineService.getAll({ limit: 5 }),
        ]);

        setRevenueData(rev);
        setAppointmentData(app);
        setPatientData(pat);
        setRecentAppointments(recent?.data || []);
        setMedicines(meds?.data || []);
      } catch (error) {
        console.error("Failed to load dashboard data", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Revenue (30d)",
      value: revenueData ? formatCurrency(revenueData.netRevenue) : "Rp 0",
      description: `Before tax: ${revenueData ? formatCurrency(revenueData.totalRevenue) : "Rp 0"}`,
      icon: DollarSign,
      color: "bg-emerald-500",
    },
    {
      title: "Appointments (30d)",
      value: appointmentData ? appointmentData.totalAppointments : 0,
      description: `Completed: ${appointmentData ? appointmentData.completedCount : 0}`,
      icon: Calendar,
      color: "bg-indigo-500",
    },
    {
      title: "Registered Patients",
      value: patientData ? patientData.totalRegistered : 0,
      description: `New patients (30d): +${patientData ? patientData.newPatients : 0}`,
      icon: Users,
      color: "bg-blue-500",
    },
    {
      title: "Low-Stock Medicines",
      value: medicines.filter((m) => m.stock < 10).length,
      description: `Total medicine types: ${medicines.length}`,
      icon: Pill,
      color: "bg-rose-500",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
      </div>

      {/* Grid Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => (
          <div
            key={idx}
            className="bg-white p-6 rounded-xl border shadow-sm flex items-center justify-between"
          >
            <div className="space-y-2">
              <span className="text-sm font-medium text-slate-500">
                {card.title}
              </span>
              <h3 className="text-2xl font-bold text-slate-800">
                {card.value}
              </h3>
              <p className="text-xs text-slate-400">{card.description}</p>
            </div>
            <div className={`p-3 rounded-lg text-white ${card.color}`}>
              <card.icon className="h-6 w-6" />
            </div>
          </div>
        ))}
      </div>

      {/* Grid Analytics Charts and Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SVG Revenue Bar Chart */}
        <div className="bg-white p-6 rounded-xl border shadow-sm lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-slate-800">
              Revenue Trend (Last 30 Days)
            </h3>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> Growth Stable
            </span>
          </div>
          {revenueData &&
            revenueData.byDate &&
            revenueData.byDate.length > 0 ? (
            <div className="h-64 flex items-end justify-between pt-6 px-4 space-x-2">
              {revenueData.byDate.map((item, idx) => {
                const maxVal = Math.max(
                  ...revenueData.byDate.map((d) => d.amount),
                  1,
                );
                const heightPct = (item.amount / maxVal) * 80 + 10; // min 10% height
                return (
                  <div
                    key={idx}
                    className="flex-1 flex flex-col items-center group relative"
                  >
                    <div
                      className="w-full bg-indigo-100 hover:bg-indigo-500 rounded-t transition-colors duration-200"
                      style={{ height: `${heightPct}%` }}
                    />
                    <span className="text-[10px] text-slate-400 mt-2 truncate w-full text-center">
                      {new Date(item.date).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-2 bg-slate-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-lg">
                      {formatCurrency(item.amount)} (${item.count} bills)
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-slate-400 bg-slate-50 border border-dashed rounded-lg">
              No revenue trend data available for this range.
            </div>
          )}
        </div>

        {/* Appointment Status Pie (represented with beautiful Progress Bars) */}
        <div className="bg-white p-6 rounded-xl border shadow-sm space-y-6">
          <h3 className="font-semibold text-slate-800">Appointment Metrics</h3>
          {appointmentData ? (
            <div className="space-y-5">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-slate-600 flex items-center gap-1">
                    <CheckCircle className="h-4 w-4 text-emerald-500" />{" "}
                    Completed
                  </span>
                  <span className="font-bold text-slate-800">
                    {appointmentData.completedCount}
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all"
                    style={{
                      width: `${(appointmentData.completedCount / appointmentData.totalAppointments) * 100}%`,
                    }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-slate-600 flex items-center gap-1">
                    <Clock className="h-4 w-4 text-blue-500" /> Scheduled
                  </span>
                  <span className="font-bold text-slate-800">
                    {appointmentData.scheduledCount}
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-500 h-full rounded-full transition-all"
                    style={{
                      width: `${(appointmentData.scheduledCount / appointmentData.totalAppointments) * 100}%`,
                    }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-slate-600 flex items-center gap-1">
                    <Clock className="h-4 w-4 text-red-500" /> Cancelled
                  </span>
                  <span className="font-bold text-slate-800">
                    {appointmentData.cancelledCount}
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-red-500 h-full rounded-full transition-all"
                    style={{
                      width: `${(appointmentData.cancelledCount / appointmentData.totalAppointments) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="h-40 flex items-center justify-center text-slate-400 bg-slate-50 border border-dashed rounded-lg">
              No appointment stats available.
            </div>
          )}
        </div>
      </div>

      {/* Grid Recent Appointments & Doctors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Appointments */}
        <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
          <h3 className="font-semibold text-slate-800">Recent Appointments</h3>
          <div className="space-y-3">
            {recentAppointments.length > 0 ? (
              recentAppointments.map((app) => (
                <div
                  key={app.id}
                  className="flex justify-between items-center border-b pb-2 last:border-b-0 last:pb-0"
                >
                  <div className="space-y-1">
                    <p className="font-medium text-slate-800 text-sm">
                      {app.patientName}
                    </p>
                    <p className="text-xs text-slate-400">
                      {app.doctorName} - {app.reason}
                    </p>
                  </div>
                  <span className="text-xs text-slate-500 font-semibold">
                    {new Date(app.appointmentDateTime).toLocaleTimeString(
                      "id-ID",
                      { hour: "2-digit", minute: "2-digit" },
                    )}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-slate-400 text-sm">
                No recent appointments today.
              </p>
            )}
          </div>
        </div>

        {/* Doctor Stats Rank */}
        <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
          <h3 className="font-semibold text-slate-800">
            Top Performing Doctors
          </h3>
          <div className="space-y-3">
            {appointmentData &&
              appointmentData.byDoctor &&
              appointmentData.byDoctor.length > 0 ? (
              appointmentData.byDoctor.map((doc, idx) => (
                <div
                  key={doc.doctorId}
                  className="flex justify-between items-center"
                >
                  <div className="flex items-center space-x-3">
                    <span className="h-6 w-6 rounded-full bg-indigo-50 text-indigo-700 font-bold text-xs flex items-center justify-center">
                      #{idx + 1}
                    </span>
                    <span className="text-sm font-semibold text-slate-700">
                      {doc.doctorName}
                    </span>
                  </div>
                  <Badge
                    variant="outline"
                    className="text-slate-700 bg-slate-50"
                  >
                    {doc.count} Appointments
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-slate-400 text-sm">
                No doctor stats available.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
