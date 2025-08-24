'use client';

import { 
  UsersIcon, 
  CalendarIcon, 
  TicketIcon, 
  CurrencyDollarIcon 
} from '@heroicons/react/24/outline';

interface DashboardMetricsProps {
  totalUsers: number;
  totalWeddings: number;
  openTickets: number;
  totalPayments: number;
}

const metrics = [
  {
    name: 'Total Users',
    value: 'totalUsers',
    icon: UsersIcon,
    color: 'bg-blue-500',
    description: 'Registered users'
  },
  {
    name: 'Active Weddings',
    value: 'totalWeddings',
    icon: CalendarIcon,
    color: 'bg-emerald-500',
    description: 'Wedding events'
  },
  {
    name: 'Open Tickets',
    value: 'openTickets',
    icon: TicketIcon,
    color: 'bg-orange-500',
    description: 'Support requests'
  },
  {
    name: 'Total Payments',
    value: 'totalPayments',
    icon: CurrencyDollarIcon,
    color: 'bg-purple-500',
    description: 'Financial transactions'
  }
];

export default function DashboardMetrics({
  totalUsers,
  totalWeddings,
  openTickets,
  totalPayments
}: DashboardMetricsProps) {
  const getValue = (metricValue: string) => {
    switch (metricValue) {
      case 'totalUsers': return totalUsers;
      case 'totalWeddings': return totalWeddings;
      case 'openTickets': return openTickets;
      case 'totalPayments': return totalPayments;
      default: return 0;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        const value = getValue(metric.value);
        
        return (
          <div key={metric.name} className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${metric.color}`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{metric.name}</p>
                <p className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">{metric.description}</p>
          </div>
        );
      })}
    </div>
  );
}
