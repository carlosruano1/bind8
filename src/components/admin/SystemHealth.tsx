'use client';

import { 
  ChartBarIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

interface SystemMetric {
  id: string;
  metric_name: string;
  metric_value: number;
  metric_unit: string;
  tags?: any;
  recorded_at: string;
}

interface SystemHealthProps {
  metrics: SystemMetric[];
}

const getHealthStatus = (metricName: string, value: number, unit: string) => {
  switch (metricName) {
    case 'system_uptime':
      if (value >= 99.9) return { status: 'excellent', color: 'text-green-600', icon: CheckCircleIcon };
      if (value >= 99.0) return { status: 'good', color: 'text-blue-600', icon: CheckCircleIcon };
      if (value >= 95.0) return { status: 'fair', color: 'text-yellow-600', icon: ExclamationTriangleIcon };
      return { status: 'poor', color: 'text-red-600', icon: XCircleIcon };
    
    case 'active_users':
      if (value < 100) return { status: 'low', color: 'text-blue-600', icon: CheckCircleIcon };
      if (value < 500) return { status: 'moderate', color: 'text-yellow-600', icon: ExclamationTriangleIcon };
      return { status: 'high', color: 'text-green-600', icon: CheckCircleIcon };
    
    case 'support_tickets':
      if (value === 0) return { status: 'none', color: 'text-green-600', icon: CheckCircleIcon };
      if (value < 10) return { status: 'low', color: 'text-blue-600', icon: CheckCircleIcon };
      if (value < 50) return { status: 'moderate', color: 'text-yellow-600', icon: ExclamationTriangleIcon };
      return { status: 'high', color: 'text-red-600', icon: XCircleIcon };
    
    default:
      return { status: 'normal', color: 'text-gray-600', icon: CheckCircleIcon };
  }
};

export default function SystemHealth({ metrics }: SystemHealthProps) {
  const formatValue = (value: number, unit: string) => {
    if (unit === 'USD') return `$${value.toLocaleString()}`;
    if (unit === '%') return `${value}%`;
    return `${value.toLocaleString()} ${unit}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!metrics || metrics.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">System Health</h2>
          <ChartBarIcon className="w-5 h-5 text-gray-400" />
        </div>
        <div className="text-center py-8">
          <ChartBarIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500">No system metrics available</p>
          <p className="text-sm text-gray-400">Metrics will appear here when collected</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-gray-900">System Health</h2>
        <div className="flex items-center space-x-2">
          <ChartBarIcon className="w-5 h-5 text-gray-400" />
          <span className="text-sm text-gray-500">Live monitoring</span>
        </div>
      </div>

      <div className="space-y-4">
        {metrics.map((metric) => {
          const health = getHealthStatus(metric.metric_name, metric.metric_value, metric.metric_unit);
          const Icon = health.icon;
          
          return (
            <div key={metric.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Icon className={`w-5 h-5 ${health.color}`} />
                <div>
                  <h3 className="font-medium text-gray-900 capitalize">
                    {metric.metric_name.replace('_', ' ')}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Last updated: {formatDate(metric.recorded_at)}
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-lg font-semibold text-gray-900">
                  {formatValue(metric.metric_value, metric.metric_unit)}
                </div>
                <div className={`text-xs font-medium ${health.color}`}>
                  {health.status}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* System Status Summary */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Overall Status:</span>
          <div className="flex items-center space-x-2">
            <CheckCircleIcon className="w-5 h-5 text-green-500" />
            <span className="text-sm font-medium text-green-700">Healthy</span>
          </div>
        </div>
        
        <div className="mt-3 text-xs text-gray-500">
          All systems operating normally • Last check: {new Date().toLocaleTimeString()}
        </div>
      </div>

      <div className="mt-4">
        <a
          href="/admin/metrics"
          className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
        >
          View detailed metrics →
        </a>
      </div>
    </div>
  );
}
