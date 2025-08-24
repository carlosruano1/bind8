'use client';

import { 
  EyeIcon, 
  PencilIcon,
  ClockIcon,
  UserIcon
} from '@heroicons/react/24/outline';

interface Ticket {
  id: string;
  ticket_number: string;
  subject: string;
  status: string;
  priority: string;
  category: string;
  customer_name: string;
  customer_email: string;
  created_at: string;
  assigned_agent_id?: string;
  admin_users?: {
    role: string;
    department: string;
  };
}

interface TicketListProps {
  tickets: Ticket[];
  onTicketUpdate: () => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'open': return 'bg-red-100 text-red-800';
    case 'in_progress': return 'bg-blue-100 text-blue-800';
    case 'waiting_on_customer': return 'bg-yellow-100 text-yellow-800';
    case 'resolved': return 'bg-green-100 text-green-800';
    case 'closed': return 'bg-gray-100 text-gray-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'critical': return 'bg-red-100 text-red-800';
    case 'urgent': return 'bg-orange-100 text-orange-800';
    case 'high': return 'bg-yellow-100 text-yellow-800';
    case 'medium': return 'bg-blue-100 text-blue-800';
    case 'low': return 'bg-gray-100 text-gray-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export default function TicketList({ tickets, onTicketUpdate }: TicketListProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Ticket
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Subject
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Customer
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Priority
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Created
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {tickets.map((ticket) => (
            <tr key={ticket.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-emerald-800">
                        {ticket.ticket_number.slice(-2)}
                      </span>
                    </div>
                  </div>
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-900">
                      {ticket.ticket_number}
                    </div>
                    <div className="text-sm text-gray-500 capitalize">
                      {ticket.category.replace('_', ' ')}
                    </div>
                  </div>
                </div>
              </td>
              
              <td className="px-6 py-4">
                <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                  {ticket.subject}
                </div>
              </td>
              
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <UserIcon className="w-4 h-4 text-gray-400 mr-2" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {ticket.customer_name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {ticket.customer_email}
                    </div>
                  </div>
                </div>
              </td>
              
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                  {ticket.status.replace('_', ' ')}
                </span>
              </td>
              
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                  {ticket.priority}
                </span>
              </td>
              
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <ClockIcon className="w-4 h-4 text-gray-400 mr-2" />
                  <div className="text-sm text-gray-900">
                    {formatDate(ticket.created_at)}
                  </div>
                </div>
              </td>
              
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex items-center space-x-2">
                  <button className="text-emerald-600 hover:text-emerald-900">
                    <EyeIcon className="w-4 h-4" />
                  </button>
                  <button className="text-blue-600 hover:text-blue-900">
                    <PencilIcon className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
