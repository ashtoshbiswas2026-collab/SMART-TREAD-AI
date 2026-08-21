import React, { useMemo, useState } from 'react';
import { useData } from '../context/DataContext';
import { useTheme } from '../context/ThemeContext';
import { parseISO, format, isSameYear, getYear } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calendar, DollarSign, TrendingUp } from 'lucide-react';

const DailyProfit: React.FC = () => {
  const { transactions } = useData();
  const { theme } = useTheme();

  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);

  // Get unique years from transactions
  const availableYears = useMemo(() => {
    const years = new Set(transactions.map(t => getYear(parseISO(t.date))));
    years.add(currentYear);
    return Array.from(years).sort((a, b) => b - a);
  }, [transactions, currentYear]);

  // Calculate daily profit for the selected year
  const dailyData = useMemo(() => {
    const dataMap = new Map<string, { income: number; expense: number; profit: number }>();

    transactions.forEach(t => {
      const date = parseISO(t.date);
      if (getYear(date) === selectedYear) {
        const dateStr = format(date, 'yyyy-MM-dd');
        const existing = dataMap.get(dateStr) || { income: 0, expense: 0, profit: 0 };

        if (t.type === 'Income') {
          existing.income += t.amount;
          existing.profit += (t.profit !== undefined ? t.profit : 0);
        } else if (t.type === 'Expense') {
          existing.expense += t.amount;
          existing.profit -= t.amount;
        }

        dataMap.set(dateStr, existing);
      }
    });

    return Array.from(dataMap.entries())
      .map(([date, data]) => ({
        date,
        displayDate: format(parseISO(date), 'dd MMM yyyy'),
        income: data.income,
        expense: data.expense,
        profit: data.profit
      }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, selectedYear]);

  const totalYearlyProfit = dailyData.reduce((sum, day) => sum + day.profit, 0);
  const totalYearlyIncome = dailyData.reduce((sum, day) => sum + day.income, 0);
  const totalYearlyExpense = dailyData.reduce((sum, day) => sum + day.expense, 0);

  // Prepare chart data (reverse to show chronological order)
  const chartData = [...dailyData].reverse().slice(-30); // Show last 30 days of data in chart

  return (
    <div className={`p-4 max-w-6xl mx-auto space-y-5 pb-10 animate-fade-in ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold mb-2">প্রতিদিনের লাভ</h2>
          <p className={`${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
            সারা বছরের প্রতিদিনের আয় এবং লাভের বিস্তারিত হিসাব
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Calendar className="text-blue-500" size={20} />
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className={`${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'} border rounded-lg px-4 py-2 outline-none focus:border-blue-500`}
          >
            {availableYears.map(year => (
              <option key={year} value={year}>{year} সাল</option>
            ))}
          </select>
        </div>
      </header>

      {/* Yearly Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className={`${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} border p-6 rounded-2xl flex items-center justify-between shadow-sm`}>
          <div>
            <p className={`${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'} text-sm mb-1`}>মোট আয় ({selectedYear})</p>
            <h3 className="text-2xl font-bold text-green-500">৳ {totalYearlyIncome.toLocaleString()}</h3>
          </div>
          <div className="bg-green-500/10 p-3 rounded-xl">
            <TrendingUp className="text-green-500" size={24} />
          </div>
        </div>

        <div className={`${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} border p-6 rounded-2xl flex items-center justify-between shadow-sm`}>
          <div>
            <p className={`${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'} text-sm mb-1`}>মোট লাভ ({selectedYear})</p>
            <h3 className="text-2xl font-bold text-blue-500">৳ {totalYearlyProfit.toLocaleString()}</h3>
          </div>
          <div className="bg-blue-500/10 p-3 rounded-xl">
            <DollarSign className="text-blue-500" size={24} />
          </div>
        </div>
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <div className={`${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} border rounded-2xl p-6 shadow-sm`}>
          <h3 className="text-lg font-bold mb-6">সাম্প্রতিক ৩০ দিনের লাভ/ক্ষতি গ্রাফ</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#334155' : '#e2e8f0'} vertical={false} />
                <XAxis
                  dataKey="displayDate"
                  stroke={theme === 'dark' ? '#94a3b8' : '#64748b'}
                  fontSize={12}
                  tickFormatter={(val) => val.split(' ')[0] + ' ' + val.split(' ')[1]}
                />
                <YAxis
                  stroke={theme === 'dark' ? '#94a3b8' : '#64748b'}
                  fontSize={12}
                  tickFormatter={(val) => `৳${val}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff',
                    borderColor: theme === 'dark' ? '#334155' : '#e2e8f0',
                    color: theme === 'dark' ? '#f8fafc' : '#0f172a',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Bar dataKey="profit" name="লাভ (Profit)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Daily List */}
      <div className={`${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} border rounded-2xl shadow-sm overflow-hidden`}>
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-lg font-bold">প্রতিদিনের বিস্তারিত হিসাব</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`${theme === 'dark' ? 'bg-slate-800/50 text-slate-400' : 'bg-slate-50 text-slate-500'} text-sm`}>
                <th className="p-4 font-medium">তারিখ</th>
                <th className="p-4 font-medium text-right">আয়</th>
                <th className="p-4 font-medium text-right">লাভ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {dailyData.length > 0 ? (
                dailyData.map((day, idx) => (
                  <tr key={idx} className={`${theme === 'dark' ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'} transition-colors`}>
                    <td className="p-4 font-medium">{day.displayDate}</td>
                    <td className="p-4 text-right text-green-500">৳ {day.income.toLocaleString()}</td>
                    <td className={`p-4 text-right font-bold ${day.profit >= 0 ? 'text-blue-500' : 'text-red-500'}`}>
                      ৳ {day.profit.toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-slate-500">
                    এই বছরে কোনো লেনদেন পাওয়া যায়নি।
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DailyProfit;
