import React, { useMemo, useState } from 'react';
import { View } from '../types';
import { Calendar, TrendingUp, DollarSign, ArrowUpRight, ArrowDownRight, Plus, X } from 'lucide-react';
import { useData } from '../context/DataContext';
import { format, subDays, isSameDay, parseISO, getDay } from 'date-fns';
import { bn } from 'date-fns/locale';

interface ReportsProps {
  setView: (view: View) => void;
}

const Reports: React.FC<ReportsProps> = ({ setView }) => {
  const { transactions, addTransaction } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [itemName, setItemName] = useState('');

  const weeklyData = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i);
      days.push(date);
    }

    return days.map(day => {
      const dayTransactions = transactions.filter(t => isSameDay(parseISO(t.date), day));
      
      const sales = dayTransactions
        .filter(t => t.type === 'Income')
        .reduce((sum, t) => sum + t.amount, 0);
        
      const expense = dayTransactions
        .filter(t => t.type === 'Expense')
        .reduce((sum, t) => sum + t.amount, 0);

      const profit = dayTransactions
        .reduce((sum, t) => {
          if (t.type === 'Income') {
            return sum + (t.profit !== undefined ? t.profit : 0);
          } else {
            return sum - t.amount;
          }
        }, 0);

      // Bengali day name
      const dayName = format(day, 'EEEE', { locale: bn });
      
      return {
        day: dayName,
        sales,
        expense,
        profit
      };
    });
  }, [transactions]);

  const totalSales = weeklyData.reduce((acc, curr) => acc + curr.sales, 0);
  const totalExpense = weeklyData.reduce((acc, curr) => acc + curr.expense, 0);
  const netProfit = weeklyData.reduce((acc, curr) => acc + curr.profit, 0);

  const bestSellingDay = useMemo(() => {
    if (totalSales === 0) return null;
    return weeklyData.reduce((prev, current) => (prev.sales > current.sales) ? prev : current);
  }, [weeklyData, totalSales]);

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !itemName) return;

    const newTransaction = {
      date: new Date().toISOString(),
      amount: parseFloat(amount),
      type: 'Income' as const,
      category: itemName,
      description: name || 'Unknown',
    };

    await addTransaction(newTransaction);
    
    setIsModalOpen(false);
    setName('');
    setAmount('');
    setItemName('');
  };

  return (
    <div className="p-4 max-w-4xl mx-auto space-y-6 relative">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">সাপ্তাহিক রিপোর্ট</h2>
          <p className="text-slate-400">আপনার গত সাত দিনের ব্যবসার একটি সামগ্রিক চিত্র।</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-semibold flex items-center gap-2 transition shadow-lg shadow-blue-900/20"
        >
          <Plus size={18} />
          আজকের বিক্রি
        </button>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <div className="flex justify-between mb-4">
            <span className="text-slate-400">মোট বিক্রি</span>
            <DollarSign className="text-slate-500" size={20} />
          </div>
          <div className="text-3xl font-bold text-blue-400">{totalSales.toLocaleString()} টাকা</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl relative overflow-hidden">
          <div className="absolute right-0 top-0 p-10 bg-blue-500/5 blur-2xl rounded-full"></div>
          <div className="flex justify-between mb-4 relative z-10">
            <span className="text-slate-400">নেট লাভ/ক্ষতি</span>
            <TrendingUp className="text-blue-500" size={20} />
          </div>
          <div className={`text-3xl font-bold relative z-10 ${netProfit >= 0 ? 'text-blue-500' : 'text-red-500'}`}>
            {netProfit.toLocaleString()} টাকা
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center justify-between">
        <div>
          <p className="text-slate-400 mb-1">সবচেয়ে বেশি বিক্রির দিন</p>
          <p className="text-2xl font-bold text-white">
            {bestSellingDay ? bestSellingDay.day : 'N/A'}
          </p>
          <p className="text-sm text-slate-500">
            {bestSellingDay ? `${bestSellingDay.sales.toLocaleString()} টাকা` : '0 টাকা'}
          </p>
        </div>
        <div className="bg-slate-800 p-3 rounded-xl">
            <Calendar className="text-white" />
        </div>
      </div>

      {/* Detailed Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-800">
          <h3 className="text-xl font-bold text-white">দৈনিক রিপোর্ট</h3>
          <p className="text-slate-400 text-sm">গত সাত দিনের দৈনিক আয় এবং ব্যয়ের হিসাব।</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-slate-950 text-slate-400 text-sm">
              <tr>
                <th className="px-6 py-4 text-left">দিন</th>
                <th className="px-6 py-4">বিক্রি (টাকা)</th>
                <th className="px-6 py-4">লাভ (টাকা)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-sm font-medium">
              {weeklyData.map((data, index) => (
                <tr key={index} className="hover:bg-slate-800/50 transition">
                  <td className="px-6 py-4 text-left text-white capitalize">{data.day}</td>
                  <td className="px-6 py-4 text-slate-300">{data.sales.toLocaleString()}</td>
                  <td className={`px-6 py-4 ${data.profit >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
                    {data.profit.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="flex justify-center pt-4">
        <button className="flex items-center gap-2 text-blue-400 font-semibold hover:text-blue-300 transition">
          <span className="text-xl">⚡</span> AI বিশ্লেষণ
        </button>
      </div>

      {/* Add Sale Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">নতুন বিক্রি যোগ করুন</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white transition"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleAddTransaction} className="space-y-4">
              <div>
                <label className="block text-slate-400 mb-1 text-sm">নাম (ঐচ্ছিক)</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="কাস্টমারের নাম"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-blue-500 outline-none"
                />
              </div>
              
              <div>
                <label className="block text-slate-400 mb-1 text-sm">টাকা</label>
                <input 
                  type="number" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-blue-500 outline-none font-mono text-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 text-sm">মালের নাম</label>
                <input 
                  type="text" 
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder="পণ্যের নাম"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-blue-500 outline-none"
                  required
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition mt-2"
              >
                বিক্রি যোগ করুন
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
