import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Users, DollarSign, Activity, Settings, LogOut, Trash2, Edit, Save, X } from 'lucide-react';
import { CustomerDue } from '../../types';

const AdminPanel: React.FC = () => {
  const { dues, updateDue, deleteDue } = useData();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<CustomerDue>>({});

  const handleLogout = () => {
    sessionStorage.removeItem('admin_token');
    window.location.href = '/';
  };

  const startEdit = (due: CustomerDue) => {
    setEditingId(due.id);
    setEditForm(due);
  };

  const saveEdit = () => {
    if (editingId && editForm) {
      updateDue(editForm as CustomerDue);
      setEditingId(null);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans">
      {/* Admin Header */}
      <header className="bg-slate-900 border-b border-slate-800 p-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Settings size={20} className="text-white" />
          </div>
          <h1 className="text-xl font-bold text-white">System Administration</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-slate-400 text-sm">Logged in as Admin</span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </header>

      <main className="p-4 max-w-7xl mx-auto space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
            <div className="flex justify-between items-start mb-2">
              <span className="text-slate-400 text-sm font-medium">Total Users</span>
              <Users size={18} className="text-blue-500" />
            </div>
            <div className="text-2xl font-bold text-white">1,245</div>
            <div className="text-xs text-green-500 mt-1">+12% from last month</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
            <div className="flex justify-between items-start mb-2">
              <span className="text-slate-400 text-sm font-medium">Active Sessions</span>
              <Activity size={18} className="text-green-500" />
            </div>
            <div className="text-2xl font-bold text-white">84</div>
            <div className="text-xs text-slate-500 mt-1">Currently online</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
            <div className="flex justify-between items-start mb-2">
              <span className="text-slate-400 text-sm font-medium">Total Revenue (Tracked)</span>
              <DollarSign size={18} className="text-yellow-500" />
            </div>
            <div className="text-2xl font-bold text-white">
              {dues.reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()} BDT
            </div>
            <div className="text-xs text-slate-500 mt-1">From {dues.length} due records</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
            <div className="flex justify-between items-start mb-2">
              <span className="text-slate-400 text-sm font-medium">System Status</span>
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            </div>
            <div className="text-2xl font-bold text-white">Operational</div>
            <div className="text-xs text-slate-500 mt-1">Uptime: 99.9%</div>
          </div>
        </div>

        {/* Data Management Section */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="p-6 border-b border-slate-800 flex justify-between items-center">
            <h2 className="text-lg font-bold text-white">Application Data: Customer Dues</h2>
            <div className="flex gap-2">
              <button className="text-xs bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-lg transition">
                Export CSV
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-400">
              <thead className="bg-slate-950 text-xs uppercase font-medium">
                <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Customer Name</th>
                  <th className="px-6 py-4">Mobile</th>
                  <th className="px-6 py-4">Amount (BDT)</th>
                  <th className="px-6 py-4">Days Pending</th>
                  <th className="px-6 py-4">Risk Level</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {dues.map((due) => (
                  <tr key={due.id} className="hover:bg-slate-800/50 transition group">
                    <td className="px-6 py-4 font-mono text-xs">{due.id}</td>

                    {editingId === due.id ? (
                      <>
                        <td className="px-6 py-4">
                          <input
                            value={editForm.name}
                            onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                            className="bg-slate-950 border border-slate-700 rounded p-1 text-white w-full"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input
                            value={editForm.mobile}
                            onChange={e => setEditForm({ ...editForm, mobile: e.target.value })}
                            className="bg-slate-950 border border-slate-700 rounded p-1 text-white w-full"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="number"
                            value={editForm.amount}
                            onChange={e => setEditForm({ ...editForm, amount: Number(e.target.value) })}
                            className="bg-slate-950 border border-slate-700 rounded p-1 text-white w-24"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="number"
                            value={editForm.daysPending}
                            onChange={e => setEditForm({ ...editForm, daysPending: Number(e.target.value) })}
                            className="bg-slate-950 border border-slate-700 rounded p-1 text-white w-16"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={editForm.risk}
                            onChange={e => setEditForm({ ...editForm, risk: e.target.value as any })}
                            className="bg-slate-950 border border-slate-700 rounded p-1 text-white w-full"
                          >
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button onClick={saveEdit} className="text-green-500 hover:bg-green-500/10 p-1 rounded">
                              <Save size={16} />
                            </button>
                            <button onClick={cancelEdit} className="text-red-500 hover:bg-red-500/10 p-1 rounded">
                              <X size={16} />
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-4 font-medium text-white">{due.name}</td>
                        <td className="px-6 py-4">{due.mobile}</td>
                        <td className="px-6 py-4 font-mono">{due.amount.toLocaleString()}</td>
                        <td className="px-6 py-4">{due.daysPending}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded text-xs border ${due.risk === 'High' ? 'border-red-500 text-red-500 bg-red-500/10' :
                              due.risk === 'Medium' ? 'border-yellow-500 text-yellow-500 bg-yellow-500/10' :
                                'border-green-500 text-green-500 bg-green-500/10'
                            }`}>
                            {due.risk}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition">
                            <button onClick={() => startEdit(due)} className="text-blue-400 hover:bg-blue-500/10 p-1 rounded">
                              <Edit size={16} />
                            </button>
                            <button onClick={() => deleteDue(due.id)} className="text-red-400 hover:bg-red-500/10 p-1 rounded">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Feature Toggles (Mock) */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">Feature Management</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-950 rounded-lg border border-slate-800">
              <div>
                <h3 className="font-medium text-white">AI Invoice Suggestions</h3>
                <p className="text-sm text-slate-500">Enable Gemini-powered product suggestions in Invoice module.</p>
              </div>
              <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full cursor-pointer bg-green-500">
                <span className="absolute left-6 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 ease-in-out"></span>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-950 rounded-lg border border-slate-800">
              <div>
                <h3 className="font-medium text-white">Voice Entry (Beta)</h3>
                <p className="text-sm text-slate-500">Allow users to input transactions via voice commands.</p>
              </div>
              <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full cursor-pointer bg-green-500">
                <span className="absolute left-6 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 ease-in-out"></span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminPanel;
