import React, { useEffect, useState } from 'react';
import { ActivityLog } from '../../types';
import { getActivityLogs } from '../../services/api';
import { History } from 'lucide-react';

export const ActivityLogList: React.FC = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLogs(await getActivityLogs());
      } catch (err) {
        console.error('Failed to fetch activity logs:', err);
      }
    };
    fetchLogs();
  }, []);

  return (
    <div className="space-y-8 pb-10">

      <div className="border-b border-nike-hairline dark:border-nike-dark-card pb-4">
        <h1 className="text-[28px] font-bold text-nike-ink dark:text-white flex items-center gap-2">
          <History className="w-6 h-6 text-blue-600" /> System Activity Log
        </h1>
        <p className="text-[14px] text-nike-mute dark:text-nike-stone mt-0.5">
          Audit trail of administrative actions, lease creations, bill generation, and unit status updates
        </p>
      </div>

      <div className="bg-nike-canvas dark:bg-nike-dark-elevated border border-nike-hairline dark:border-nike-dark-card rounded-2xl overflow-x-auto shadow-xs">
        <table className="w-full text-left border-collapse text-[14px]">
          <thead>
            <tr className="border-b border-nike-hairline-soft dark:border-nike-dark-card text-nike-mute dark:text-nike-stone font-medium text-[13px]">
              <th className="p-4">Timestamp</th>
              <th className="p-4">User</th>
              <th className="p-4">Action</th>
              <th className="p-4">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-nike-hairline-soft dark:divide-nike-dark-card">
            {logs.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-nike-mute">No activity logs recorded yet</td>
              </tr>
            ) : (
              logs.map(log => (
                <tr key={log.id} className="hover:bg-nike-soft-cloud dark:hover:bg-nike-dark-card/50 transition-colors text-xs">
                  <td className="p-4 text-nike-stone text-[12px] whitespace-nowrap">
                    {log.createdAt ? new Date(log.createdAt).toLocaleString() : ''}
                  </td>
                  <td className="p-4 font-semibold text-nike-ink dark:text-white">{log.userName || 'Admin'}</td>
                  <td className="p-4 font-semibold text-blue-600 dark:text-blue-400">{log.action}</td>
                  <td className="p-4 text-nike-mute dark:text-nike-stone">{log.details}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};
