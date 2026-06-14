import React from 'react';
import { Outlet } from 'react-router-dom';
import { Activity, Calendar, Pill, CreditCard, ShieldCheck } from 'lucide-react';

const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-slate-50 font-sans">
      {/* Left Column: Branding and Information (Visible on MD screens and above) */}
      <div className="hidden md:flex md:w-[45%] lg:w-[50%] xl:w-[55%] flex-col justify-between p-12 lg:p-16 bg-gradient-to-tr from-slate-950 via-slate-900 to-emerald-950 text-white relative overflow-hidden border-r border-slate-800">
        {/* Glow Effects */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-teal-500/10 blur-[100px] pointer-events-none" />
        
        {/* Header Branding */}
        <div className="flex items-center space-x-3 z-10">
          <div className="bg-emerald-500/20 p-2.5 rounded-xl border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            <Activity className="h-6 w-6 text-emerald-400 animate-pulse" />
          </div>
          <div>
            <span className="font-extrabold text-2xl tracking-tight bg-gradient-to-r from-emerald-400 to-teal-200 bg-clip-text text-transparent">
              Klinik
            </span>
            <span className="text-slate-400 text-xs block font-semibold tracking-wider uppercase -mt-0.5">
              Information System
            </span>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="my-auto py-12 z-10 max-w-lg">
          <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-white mb-4 leading-tight">
            Digitalisasi Pelayanan Kesehatan Modern
          </h1>
          <p className="text-slate-400 text-base mb-10 leading-relaxed">
            Satu platform terintegrasi untuk mengelola janji temu, rekam medis elektronis, resep obat, hingga transaksi pembayaran klinik secara cepat dan akurat.
          </p>

          <div className="space-y-6">
            {/* Feature 1 */}
            <div className="flex items-start space-x-4">
              <div className="mt-1 bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
                <Calendar className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-200 text-sm">Manajemen Antrean & Jadwal</h3>
                <p className="text-slate-400 text-xs mt-0.5">Atur jadwal temu pasien dengan dokter secara real-time dan teratur.</p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex items-start space-x-4">
              <div className="mt-1 bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
                <ShieldCheck className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-200 text-sm">Rekam Medis Elektronik (RME)</h3>
                <p className="text-slate-400 text-xs mt-0.5">Penyimpanan diagnosa medis dan riwayat klinis yang aman dan terenkripsi.</p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex items-start space-x-4">
              <div className="mt-1 bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
                <Pill className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-200 text-sm">Resep & Apotek Otomatis</h3>
                <p className="text-slate-400 text-xs mt-0.5">Integrasi resep elektronik dengan pengurangan stok obat otomatis.</p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="flex items-start space-x-4">
              <div className="mt-1 bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
                <CreditCard className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-200 text-sm">Billing & Pembayaran Kasir</h3>
                <p className="text-slate-400 text-xs mt-0.5">Penagihan transparan dengan kalkulasi asuransi, diskon, dan perpajakan.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-slate-500 text-xs z-10 flex items-center justify-between border-t border-slate-800/60 pt-4">
          <span>Klinik App v1.0.0</span>
          <span>© 2026 Klinik. Hak Cipta Dilindungi.</span>
        </div>
      </div>

      {/* Right Column: Auth Forms (Login / Register) */}
      <div className="w-full md:w-[55%] lg:w-[50%] xl:w-[45%] flex flex-col justify-center items-center p-8 sm:p-12 md:p-16 lg:p-24 bg-slate-50">
        {/* Mobile Header (Hidden on md screens and above) */}
        <div className="flex md:hidden items-center space-x-3 mb-8">
          <div className="bg-emerald-600 p-2 rounded-xl text-white shadow-lg">
            <Activity className="h-6 w-6" />
          </div>
          <div>
            <span className="font-extrabold text-2xl tracking-tight text-slate-900">
              Klinik
            </span>
            <span className="text-slate-500 text-xs block font-semibold tracking-wider uppercase -mt-1">
              Information System
            </span>
          </div>
        </div>

        {/* Form Container Card */}
        <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-2xl shadow-xl border border-slate-100 transition-all duration-300 hover:shadow-2xl">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
