import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase/config';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ certCount: 0, verificationLogs: 0, universities: 0 });
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    // This page should be protected and only accessible to 'admin' users
    const fetchData = async () => {
      const { count: certCount } = await supabase.from('certificates').select('*', { count: 'exact', head: true });
      const { count: logCount } = await supabase.from('verification_logs').select('*', { count: 'exact', head: true });
      const { count: uniCount } = await supabase.from('universities').select('*', { count: 'exact', head: true });
      setStats({ certCount: certCount ?? 0, verificationLogs: logCount ?? 0, universities: uniCount ?? 0 });

      const { data: logData } = await supabase.from('verification_logs').select('*, certificates(roll_number, issued_to)').order('verified_at', { ascending: false }).limit(10);
      setLogs(logData ?? []);
    };

    fetchData();
  }, []);

  return (
    <div className="container mx-auto p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow"><h3 className="text-gray-500">Total Certificates</h3><p className="text-4xl font-bold">{stats.certCount}</p></div>
        <div className="bg-white p-6 rounded-lg shadow"><h3 className="text-gray-500">Total Verifications</h3><p className="text-4xl font-bold">{stats.verificationLogs}</p></div>
        <div className="bg-white p-6 rounded-lg shadow"><h3 className="text-gray-500">Registered Institutions</h3><p className="text-4xl font-bold">{stats.universities}</p></div>
      </div>
      
      <div className="mt-10">
          <h2 className="text-2xl font-semibold mb-4">Recent Verification Activity</h2>
          <div className="bg-white rounded-lg shadow overflow-x-auto">
              <table className="min-w-full">
                  <thead className="bg-gray-100">
                      <tr>
                          <th className="text-left py-3 px-4">Timestamp</th>
                          <th className="text-left py-3 px-4">Status</th>
                          <th className="text-left py-3 px-4">Matched Record</th>
                      </tr>
                  </thead>
                  <tbody>
                      {logs.map(log => (
                          <tr key={log.id} className="border-t">
                              <td className="py-3 px-4">{new Date(log.verified_at).toLocaleString()}</td>
                              <td className={`py-3 px-4 font-semibold ${
                                  log.status === 'Verified' ? 'text-green-600' : 'text-red-600'
                              }`}>{log.status}</td>
                              <td className="py-3 px-4 text-sm">{log.certificates ? `${log.certificates.issued_to} (${log.certificates.roll_number})` : 'N/A'}</td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
