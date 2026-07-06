import Link from 'next/link';
import { LogOut, Users, Laptop, Cpu, Car, LayoutGrid, Settings, ClipboardList, Wrench } from 'lucide-react';
import { logoutAction } from '@/app/actions/auth';
import { getSession } from '@/lib/auth';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-800">
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col sticky top-0 h-screen z-40">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-[#374151] tracking-tight">Corp Manager</h2>
        </div>

        <nav className="flex-1 py-6 overflow-y-auto custom-scrollbar">
          <ul className="space-y-1 px-4">
            <li>
              <Link href="/dashboard" className="flex items-center px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-100 text-[15px]">
                <LayoutGrid className="w-5 h-5 mr-3 shrink-0" />
                <span className="truncate">Dashboard</span>
              </Link>
            </li>
            <li>
              <Link href="/dashboard/employees" className="flex items-center px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-100 text-[15px]">
                <Users className="w-5 h-5 mr-3 shrink-0" />
                <span className="truncate">Employees</span>
              </Link>
            </li>
            <li>
              <Link href="/dashboard/laptops" className="flex items-center px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-100 text-[15px]">
                <Laptop className="w-5 h-5 mr-3 shrink-0" />
                <span className="truncate">Laptops Register</span>
              </Link>
            </li>
            <li>
              <Link href="/dashboard/other-assets" className="flex items-center px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-100 text-[15px]">
                <LayoutGrid className="w-5 h-5 mr-3 shrink-0" />
                <span className="truncate">Other Assets</span>
              </Link>
            </li>
            <li>
              <Link href="/dashboard/ai-subscriptions" className="flex items-center px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-100 text-[15px]">
                <Cpu className="w-5 h-5 mr-3 shrink-0" />
                <span className="truncate">AI Subscriptions</span>
              </Link>
            </li>
            <li>
              <Link href="/dashboard/assignments" className="flex items-center px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-100 text-[15px]">
                <LayoutGrid className="w-5 h-5 mr-3 shrink-0" />
                <span className="truncate">Assignments</span>
              </Link>
            </li>
            <li>
              <Link href="/dashboard/repair-history" className="flex items-center px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-100 text-[15px]">
                <Wrench className="w-5 h-5 mr-3 shrink-0" />
                <span className="truncate">Repair History</span>
              </Link>
            </li>
            <li>
              <Link href="/dashboard/parking" className="flex items-center px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-100 text-[15px]">
                <Car className="w-5 h-5 mr-3 shrink-0" />
                <span className="truncate">Parking Permits</span>
              </Link>
            </li>
          </ul>

          {session?.role === 'ADMIN' && (
            <>
              <div className="mt-8 mb-4">
                <h3 className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Administration
                </h3>
              </div>
              <ul className="space-y-1 px-4">
                <li>
                  <Link href="/dashboard/audit" className="flex items-center px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-100 text-[15px]">
                    <ClipboardList className="w-5 h-5 mr-3 shrink-0" />
                    <span className="truncate">Audit Logs</span>
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/settings" className="flex items-center px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-100 text-[15px]">
                    <Settings className="w-5 h-5 mr-3 shrink-0" />
                    <span className="truncate">Settings</span>
                  </Link>
                </li>
              </ul>
            </>
          )}
        </nav>

        <div className="p-4 border-t border-gray-100 mt-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold shrink-0">
              {session?.name ? session.name[0].toUpperCase() : 'U'}
            </div>
            <div className="truncate">
              <p className="text-sm font-medium text-gray-900 truncate">{session?.name || 'Admin User'}</p>
              <p className="text-xs text-gray-500 truncate">{session?.email || 'admin@admin.com'}</p>
            </div>
          </div>
          <form action={logoutAction}>
            <button type="submit" className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#f8f9fa] px-4 md:px-8">
        <header className="h-16 flex items-center shrink-0 border-b border-gray-200">
          <div className="text-sm text-gray-500 flex items-center">
             Welcome to Corp Manager
          </div>
        </header>
        <div className="py-6 flex-1 min-h-0 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
