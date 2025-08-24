'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  HomeIcon, 
  UsersIcon, 
  TicketIcon, 
  ChartBarIcon,
  CogIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  PhotoIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';

interface AdminSidebarProps {
  role: string;
}

const menuItems = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: HomeIcon,
    roles: ['super_admin', 'admin', 'support_agent', 'moderator']
  },
  {
    name: 'Support Tickets',
    href: '/admin/tickets',
    icon: TicketIcon,
    roles: ['super_admin', 'admin', 'support_agent']
  },
  {
    name: 'User Management',
    href: '/admin/users',
    icon: UsersIcon,
    roles: ['super_admin', 'admin']
  },
  {
    name: 'Weddings',
    href: '/admin/weddings',
    icon: CalendarIcon,
    roles: ['super_admin', 'admin', 'support_agent']
  },
  {
    name: 'Payments',
    href: '/admin/payments',
    icon: CurrencyDollarIcon,
    roles: ['super_admin', 'admin']
  },
  {
    name: 'Analytics',
    href: '/admin/analytics',
    icon: ChartBarIcon,
    roles: ['super_admin', 'admin']
  },
  {
    name: 'System Metrics',
    href: '/admin/metrics',
    icon: ChartBarIcon,
    roles: ['super_admin', 'admin']
  },
  {
    name: 'Admin Actions',
    href: '/admin/actions',
    icon: ShieldCheckIcon,
    roles: ['super_admin', 'admin']
  },
  {
    name: 'Reports',
    href: '/admin/reports',
    icon: DocumentTextIcon,
    roles: ['super_admin', 'admin']
  },
  {
    name: 'Settings',
    href: '/admin/settings',
    icon: CogIcon,
    roles: ['super_admin']
  }
];

export default function AdminSidebar({ role }: AdminSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(role)
  );

  return (
    <div className={`bg-white shadow-lg transition-all duration-300 ${
      collapsed ? 'w-16' : 'w-64'
    }`}>
      <div className="p-4">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          {collapsed ? (
            <div className="w-6 h-0.5 bg-gray-400"></div>
          ) : (
            <div className="w-6 h-0.5 bg-gray-400"></div>
          )}
        </button>
      </div>

      <nav className="mt-4">
        <ul className="space-y-2 px-3">
          {filteredMenuItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-emerald-100 text-emerald-700 border-r-2 border-emerald-500'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
                  {!collapsed && (
                    <span className="font-medium">{item.name}</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Role indicator */}
      <div className="absolute bottom-4 left-4 right-4">
        <div className={`bg-gray-100 rounded-lg p-3 ${collapsed ? 'text-center' : ''}`}>
          {!collapsed && (
            <p className="text-xs text-gray-500 mb-1">Role</p>
          )}
          <div className={`flex items-center ${collapsed ? 'justify-center' : ''}`}>
            <div className={`w-2 h-2 rounded-full mr-2 ${
              role === 'super_admin' ? 'bg-red-500' :
              role === 'admin' ? 'bg-orange-500' :
              role === 'support_agent' ? 'bg-blue-500' :
              'bg-gray-500'
            }`}></div>
            {!collapsed && (
              <span className="text-sm font-medium text-gray-700 capitalize">
                {role.replace('_', ' ')}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
