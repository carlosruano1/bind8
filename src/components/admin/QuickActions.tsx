'use client';

import { 
  UserPlusIcon, 
  TicketIcon, 
  CurrencyDollarIcon,
  ChartBarIcon,
  CogIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

const quickActions = [
  {
    name: 'Create User',
    description: 'Add new user account',
    icon: UserPlusIcon,
    href: '/admin/users',
    color: 'bg-blue-500',
    roles: ['super_admin', 'admin']
  },
  {
    name: 'New Support Ticket',
    description: 'Create support request',
    icon: TicketIcon,
    href: '/admin/tickets',
    color: 'bg-orange-500',
    roles: ['super_admin', 'admin', 'support_agent']
  },
  {
    name: 'View Payments',
    description: 'Monitor transactions',
    icon: CurrencyDollarIcon,
    href: '/admin/payments',
    color: 'bg-green-500',
    roles: ['super_admin', 'admin']
  },
  {
    name: 'System Analytics',
    description: 'View performance metrics',
    icon: ChartBarIcon,
    href: '/admin/analytics',
    color: 'bg-purple-500',
    roles: ['super_admin', 'admin']
  },
  {
    name: 'Admin Settings',
    description: 'Configure system',
    icon: CogIcon,
    href: '/admin/settings',
    color: 'bg-gray-500',
    roles: ['super_admin']
  },
  {
    name: 'Security Logs',
    description: 'Monitor admin actions',
    icon: ShieldCheckIcon,
    href: '/admin/actions',
    color: 'bg-red-500',
    roles: ['super_admin', 'admin']
  }
];

export default function QuickActions() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {quickActions.map((action) => {
          const Icon = action.icon;
          
          return (
            <Link
              key={action.name}
              href={action.href}
              className="group p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${action.color} group-hover:scale-110 transition-transform`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 group-hover:text-gray-700 transition-colors">
                    {action.name}
                  </h3>
                  <p className="text-sm text-gray-500">{action.description}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
