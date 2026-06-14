import React from 'react';
import { Outlet, useNavigate, NavLink } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui/button';
import { LayoutDashboard, Users, UserRound, Pill, Stethoscope, Calendar, FileText, ClipboardList, CreditCard, LogOut, User as UserIcon } from 'lucide-react';

const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const adminMenu = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Users', path: '/admin/users', icon: Users },
    { name: 'Patients', path: '/admin/patients', icon: UserRound },
    { name: 'Medicines', path: '/admin/medicines', icon: Pill },
    { name: 'Doctors', path: '/admin/doctors', icon: Stethoscope },
    { name: 'Appointments', path: '/admin/appointments', icon: Calendar },
    { name: 'Medical Records', path: '/admin/medical-records', icon: ClipboardList },
    { name: 'Prescriptions', path: '/admin/prescriptions', icon: FileText },
    { name: 'Payments', path: '/admin/payments', icon: CreditCard },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:block">
        <div className="h-16 flex items-center px-6 border-b border-slate-200">
          <span className="text-xl font-bold text-slate-800">Klinik Sehat</span>
        </div>
        <nav className="p-4 space-y-1">
          {adminMenu.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${isActive
                  ? 'bg-slate-100 text-slate-900'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              <item.icon className="mr-3 h-4 w-4" />
              {item.name}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">
          <div className="font-medium text-slate-800 capitalize">
            {user?.role.toLowerCase()} Area
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <UserIcon className="h-5 w-5 text-slate-500" />
              <span className="text-sm font-medium text-slate-700">{user?.name}</span>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
