import React, { useEffect, useMemo, useState } from 'react';
import { useData } from '../context/DataContext';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subDays } from 'date-fns';

interface HistoryDay {
    date: string;
    label: string;
    target: number;
    achieved: number;
    completed: boolean;
}

const TargetHistory: React.FC = () => {
    const { transactions } = useData();
    const [history, setHistory] = useState<HistoryDay[]>([]);

    useEffect(() => {
        const rawHistory = window.localStorage.getItem('dailyTargetHistory');
        const savedHistory = rawHistory ? JSON.parse(rawHistory) : [];
        const last30: HistoryDay[] = [];
        for (let i = 29; i >= 0; i -= 1) {
            const date = subDays(new Date(), i);
            const dateKey = date.toISOString().split('T')[0];
            const historyEntry = savedHistory.find((entry: any) => entry.date === dateKey);
            const target = historyEntry?.target || Number(window.localStorage.getItem('dailyTargetData') ? JSON.parse(window.localStorage.getItem('dailyTargetData') || '{}').dailyTarget : 0) || 0;
            const achieved = transactions
                .filter(t => t.type === 'Income' && t.date?.startsWith(dateKey))
                .reduce((sum, t) => sum + t.amount, 0);
            last30.push({
                date: dateKey,
                label: format(date, 'MM/dd'),
                target,
                achieved,
                completed: target > 0 ? achieved >= target : false,
            });
        }
        setHistory(last30);
    }, [transactions]);

    const completedDays = useMemo(() => history.filter(day => day.completed).length, [history]);

    return (
        <div className="p-4 md:p-4 max-w-6xl mx-auto animate-fade-in pb-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-white">লক্ষ্য ইতিহাস</h2>
                    <p className="text-slate-400 mt-2 max-w-2xl">গত ৩০ দিনের মধ্যে লক্ষ্য বনাম অর্জিত বিক্রয় দেখুন।</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 text-slate-200 text-sm">
                    <p className="text-slate-400 text-xs uppercase tracking-[0.2em] mb-2">সফলতার হার</p>
                    <p className="text-xl font-bold">{completedDays} / 30 দিন</p>
                </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
                <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h3 className="text-xl font-semibold text-white"> লক্ষ্য বনাম অর্জন</h3>
                        <p className="text-slate-400 text-sm">প্রতিদিনের লক্ষ্য ও আসল বিক্রয়ে তুলনা করা হচ্ছে।</p>
                    </div>
                    <div className="inline-flex items-center gap-3 text-sm text-slate-400">
                        <span className="inline-flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-blue-500" /> লক্ষ্য
                        </span>
                        <span className="inline-flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-emerald-500" /> অর্জিত
                        </span>
                    </div>
                </div>

                <div className="h-[420px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={history} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
                            <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
                            <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                            <Tooltip formatter={(value: number) => `৳ ${value.toLocaleString()}`} />
                            <Bar dataKey="target" name="লক্ষ্য" fill="#38bdf8" radius={[6, 6, 0, 0]} />
                            <Bar dataKey="achieved" name="অর্জিত" radius={[6, 6, 0, 0]}>
                                {history.map((entry, idx) => (
                                    <Cell key={`cell-${idx}`} fill={entry.completed ? '#22c55e' : '#ef4444'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default TargetHistory;
