'use client';

import { useState } from 'react';
import { 
  TicketIcon, 
  ClockIcon, 
  UserIcon,
  ExclamationTriangleIcon
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

interface RecentTicketsProps {
  tickets: Ticket[];
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

export default function RecentTickets({ tickets }: RecentTicketsProps) {
  const [expandedTicket, setExpandedTicket] = useState<string | null>(null);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!tickets || tickets.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">Recent Support Tickets</h2>
          <TicketIcon className="w-5 h-5 text-gray-400" />
        </div>
        <div className="text-center py-8">
          <TicketIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500">No support tickets yet</p>
          <p className="text-sm text-gray-400">Tickets will appear here when created</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-gray-900">Recent Support Tickets</h2>
        <div className="flex items-center space-x-2">
          <TicketIcon className="w-5 h-5 text-gray-400" />
          <span className="text-sm text-gray-500">{tickets.length} tickets</span>
        </div>
      </div>

      <div className="space-y-3">
        {tickets.map((ticket) => (
          <div
            key={ticket.id}
            className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors cursor-pointer"
            onClick={() => setExpandedTicket(expandedTicket === ticket.id ? null : ticket.id)}
          >
            {/* Ticket Header */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="font-mono text-sm text-gray-600">
                    {ticket.ticket_number}
                  </span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                    {ticket.status.replace('_', ' ')}
                  </span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                    {ticket.priority}
                  </span>
                </div>
                
                <h3 className="font-medium text-gray-900 mb-1">
                  {ticket.subject}
                </h3>
                
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <UserIcon className="w-4 h-4" />
                    <span>{ticket.customer_name}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <ClockIcon className="w-4 h-4" />
                    <span>{formatDate(ticket.created_at)}</span>
                  </div>
                </div>
              </div>

              {/* Priority indicator */}
              {ticket.priority === 'critical' && (
                <ExclamationTriangleIcon className="w-5 h-5 text-red-500 flex-shrink-0 ml-2" />
              )}
            </div>

            {/* Expanded Details */}
            {expandedTicket === ticket.id && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Category:</span>
                    <span className="ml-2 text-gray-600 capitalize">
                      {ticket.category.replace('_', ' ')}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Customer Email:</span>
                    <span className="ml-2 text-gray-600">{ticket.customer_email}</span>
                  </div>
                  {ticket.admin_users && (
                    <div className="col-span-2">
                      <span className="font-medium text-gray-700">Assigned Agent:</span>
                      <span className="ml-2 text-gray-600">
                        {ticket.admin_users.role} - {ticket.admin_users.department}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="mt-3 flex space-x-2">
                  <button className="px-3 py-1 text-xs bg-emerald-100 text-emerald-700 rounded-md hover:bg-emerald-200 transition-colors">
                    View Details
                  </button>
                  <button className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors">
                    Respond
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {tickets.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <a
            href="/admin/tickets"
            className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
          >
            View all tickets →
          </a>
        </div>
      )}
    </div>
  );
}
