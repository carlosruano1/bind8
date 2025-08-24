'use client';

import { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  FunnelIcon, 
  MagnifyingGlassIcon,
  TicketIcon
} from '@heroicons/react/24/outline';
import TicketList from '@/components/admin/TicketList';
import TicketFilters from '@/components/admin/TicketFilters';
import CreateTicketModal from '@/components/admin/CreateTicketModal';

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

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    category: '',
    assignedAgent: '',
    search: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  useEffect(() => {
    fetchTickets();
  }, [filters, pagination.page]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...filters
      });

      const response = await fetch(`/api/admin/tickets?${params}`);
      const data = await response.json();

      if (response.ok) {
        setTickets(data.tickets);
        setPagination(prev => ({
          ...prev,
          total: data.pagination.total,
          pages: data.pagination.pages
        }));
      }
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async (ticketData: any) => {
    try {
      const response = await fetch('/api/admin/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ticketData)
      });

      if (response.ok) {
        setShowCreateModal(false);
        fetchTickets(); // Refresh the list
      }
    } catch (error) {
      console.error('Failed to create ticket:', error);
    }
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Support Tickets</h1>
            <p className="text-gray-600 mt-1">
              Manage customer support requests and track resolution progress
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            New Ticket
          </button>
        </div>
      </div>

      {/* Filters */}
      <TicketFilters
        filters={filters}
        onFilterChange={handleFilterChange}
      />

      {/* Ticket List */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">
              All Tickets ({pagination.total})
            </h2>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                Page {pagination.page} of {pagination.pages}
              </div>
            </div>
          </div>
        </div>
        
        {loading ? (
          <div className="p-6 text-center">
            <div className="inline-flex items-center">
              <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mr-2"></div>
              Loading tickets...
            </div>
          </div>
        ) : tickets.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <TicketIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No tickets found matching your criteria</p>
          </div>
        ) : (
          <TicketList
            tickets={tickets}
            onTicketUpdate={fetchTickets}
          />
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
              {pagination.total} results
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
                className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Ticket Modal */}
      {showCreateModal && (
        <CreateTicketModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateTicket}
        />
      )}
    </div>
  );
}
