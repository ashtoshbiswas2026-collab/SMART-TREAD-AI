import React, { useState } from 'react';
import { Plus, Trash2, Printer, FileText, ArrowLeft, Sparkles, Loader2, Download, User, ShoppingCart } from 'lucide-react';
import { suggestInvoiceItems } from '../geminiService';
import html2canvas from 'html2canvas';

interface InvoiceItem {
  id: number;
  name: string;
  price: number;
  qty: number;
}

const Invoice: React.FC = () => {
  const [items, setItems] = useState<InvoiceItem[]>([{ id: 1, name: '', price: 0, qty: 1 }]);
  const [customer, setCustomer] = useState({ name: '', phone: '' });
  const [shopName, setShopName] = useState(() => localStorage.getItem('shopName') || 'BIZNURO AI');
  const [discount, setDiscount] = useState(0);
  const [isGenerated, setIsGenerated] = useState(false);
  const [aiInput, setAiInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  const addItem = () => {
    setItems([...items, { id: Date.now(), name: '', price: 0, qty: 1 }]);
  };

  const updateItem = (id: number, field: keyof InvoiceItem, value: any) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const removeItem = (id: number) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const handleAiSuggest = async () => {
    if (!aiInput.trim()) return;

    setIsAiLoading(true);
    try {
      const result = await suggestInvoiceItems(aiInput);
      if (result) {
        const suggestedItems = JSON.parse(result);
        if (Array.isArray(suggestedItems)) {
          const newItems = suggestedItems.map((item: any) => ({
            id: Date.now() + Math.random(),
            name: item.name,
            price: Number(item.price) || 0,
            qty: Number(item.qty) || 1
          }));

          // If the current list only has one empty item, replace it. Otherwise append.
          if (items.length === 1 && !items[0].name && !items[0].price) {
            setItems(newItems);
          } else {
            setItems([...items, ...newItems]);
          }
          setAiInput('');
        }
      }
    } catch (error) {
      console.error("Failed to parse AI suggestion", error);
    } finally {
      setIsAiLoading(false);
    }
  };

  const subTotal = items.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const total = subTotal - discount;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    const element = document.getElementById('invoice-preview');
    if (element) {
      const canvas = await html2canvas(element, {
        scale: 2, // Higher resolution
        backgroundColor: '#ffffff',
      });
      const data = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = data;
      link.download = `invoice-${Date.now()}.png`;
      link.click();
    }
  };

  if (isGenerated) {
    return (
      <div className="p-4 max-w-3xl mx-auto space-y-6 pb-10">
        <button
          onClick={() => setIsGenerated(false)}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition"
        >
          <ArrowLeft size={20} /> ফিরে যান
        </button>

        <div id="invoice-preview" className="bg-white text-slate-900 rounded-3xl p-8 md:p-14 shadow-2xl animate-fade-in relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-slate-50 to-slate-100 rounded-bl-full -z-10 opacity-80"></div>

          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start pb-10 mb-10 gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter mb-3 uppercase">{shopName}</h1>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-bold tracking-widest uppercase">
                <FileText size={14} />
                রসিদ
              </div>
            </div>
            <div className="text-left md:text-right min-w-[200px]">
              <div className="mb-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] block mb-1">তারিখ</span>
                <p className="font-medium text-slate-800 text-lg">{new Date().toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] block mb-1">ইনভয়েস নম্বর</span>
                <p className="font-mono font-medium text-slate-800 text-lg">INV-{Date.now().toString().slice(-6)}</p>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="mb-12">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
              <User size={14} />
              গ্রাহকের তথ্য
            </h3>
            <div className="p-0">
              <input
                type="text"
                value={customer.name}
                onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                placeholder="গ্রাহকের নাম"
                className="font-black text-3xl text-slate-900 bg-transparent border-none outline-none w-full p-0 focus:ring-0 placeholder:text-slate-200 mb-2 uppercase tracking-tight"
              />
              <input
                type="text"
                value={customer.phone}
                onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                placeholder="ফোন নম্বর"
                className="text-slate-500 text-xl font-medium bg-transparent border-none outline-none w-full p-0 focus:ring-0 placeholder:text-slate-200"
              />
            </div>
          </div>

          {/* Table */}
          <div className="mb-12">
            <table className="w-full">
              <thead>
                <tr className="text-left text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] border-b-2 border-slate-900">
                  <th className="py-4 px-2">বিবরণ</th>
                  <th className="py-4 px-2 text-center w-32">পরিমাণ</th>
                  <th className="py-4 px-2 text-center w-32">দর</th>
                  <th className="py-4 px-2 text-right w-32">মোট</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item, index) => (
                  <tr key={item.id} className="group hover:bg-slate-50 transition-colors">
                    <td className="py-6 px-2 font-bold text-slate-900 uppercase tracking-tight">{item.name || 'পণ্য'}</td>
                    <td className="py-6 px-2 text-center font-medium text-slate-500">{item.qty}</td>
                    <td className="py-6 px-2 text-center font-medium text-slate-500">{item.price} ৳</td>
                    <td className="py-6 px-2 text-right font-black text-slate-900">{(item.price * item.qty)} ৳</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 border-t-2 border-slate-900 pt-8">
            <div className="text-sm text-slate-500 max-w-xs hidden md:block">
              <p className="font-bold text-slate-900 mb-2 uppercase tracking-wider text-[10px]">শর্তাবলী</p>
              <p className="leading-relaxed">বিক্রীত পণ্য ফেরত নেওয়া হয় না। যেকোনো প্রয়োজনে রসিদটি সংরক্ষণ করুন।</p>
            </div>

            <div className="w-full md:w-80 space-y-4">
              <div className="flex justify-between text-slate-500 font-medium text-lg px-2">
                <span>সাবটোটাল</span>
                <span>{subTotal} ৳</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-slate-500 font-medium text-lg px-2">
                  <span>ডিসকাউন্ট</span>
                  <span>- {discount} ৳</span>
                </div>
              )}
              <div className="flex justify-between font-black text-3xl pt-6 border-t border-slate-200 text-slate-900 px-2">
                <span>সর্বমোট</span>
                <span>{total} ৳</span>
              </div>
            </div>
          </div>

          <div className="mt-20 pt-10 border-t border-slate-100 text-center relative">
            <div className="inline-flex items-center justify-center gap-3 text-slate-900 font-bold uppercase tracking-widest text-xs">
              <Sparkles size={14} />
              ধন্যবাদ, আবার আসবেন
              <Sparkles size={14} />
            </div>
            <button
              onClick={handleDownload}
              className="absolute right-0 top-10 text-slate-300 hover:text-slate-900 print:hidden transition-colors p-2 rounded-full hover:bg-slate-100"
              title="ডাউনলোড"
              data-html2canvas-ignore
            >
              <Download size={20} />
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 print:hidden flex-wrap">
          <button
            onClick={() => setIsGenerated(false)}
            className="flex-1 bg-slate-800 text-white font-bold py-3 rounded-xl hover:bg-slate-700 transition min-w-[120px]"
          >
            এডিট করুন
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition flex items-center justify-center gap-2 min-w-[120px]"
          >
            <Printer size={20} /> প্রিন্ট করুন
          </button>
          <button
            onClick={handleDownload}
            className="flex-1 bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 transition flex items-center justify-center gap-2 min-w-[120px]"
          >
            <Download size={20} /> ডাউনলোড করুন
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-4xl mx-auto space-y-6 pb-10">
      <header className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-sm font-medium mb-4">
          <FileText size={16} />
          <span>ইনভয়েস জেনারেটর</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-3 tracking-tight">ডিজিটাল ইনভয়েস ও রসিদ</h2>
        <p className="text-slate-400 max-w-xl">গ্রাহকের জন্য পেশাদার ইনভয়েস তৈরি করুন, AI দিয়ে স্বয়ংক্রিয়ভাবে পণ্যের তালিকা পূরণ করুন এবং সহজে শেয়ার করুন।</p>
      </header>

      <div className="space-y-6">
        {/* Customer Info Section */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
              <User size={20} />
            </div>
            <h3 className="text-lg font-semibold text-white">গ্রাহকের তথ্য</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">গ্রাহকের নাম</label>
              <input
                value={customer.name}
                onChange={e => setCustomer({ ...customer, name: e.target.value })}
                placeholder="যেমন: মিঃ করিম"
                className="w-full bg-slate-950/50 border border-slate-800 rounded-xl p-3.5 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">গ্রাহকের ফোন নম্বর</label>
              <input
                value={customer.phone}
                onChange={e => setCustomer({ ...customer, phone: e.target.value })}
                placeholder="যেমন: 017..."
                className="w-full bg-slate-950/50 border border-slate-800 rounded-xl p-3.5 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* Items Section */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
                <ShoppingCart size={20} />
              </div>
              <h3 className="text-lg font-semibold text-white">পণ্যের তালিকা</h3>
            </div>
          </div>

          {/* AI Suggestion Input */}
          <div className="mb-6 relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
            <div className="relative flex flex-col sm:flex-row gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800">
              <input
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                placeholder="AI কে বলুন: ৫ কেজি চাল, ২ লিটার তেল..."
                className="flex-1 bg-transparent border-none p-2 text-white text-sm focus:ring-0 outline-none placeholder:text-slate-500"
                onKeyDown={(e) => e.key === 'Enter' && handleAiSuggest()}
              />
              <button
                onClick={handleAiSuggest}
                disabled={isAiLoading || !aiInput.trim()}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-800 disabled:text-slate-500 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-all font-medium"
              >
                {isAiLoading ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
                <span>ম্যাজিক পূরণ</span>
              </button>
            </div>
          </div>

          {/* Items Header (Desktop) */}
          <div className="hidden sm:flex gap-3 px-2 mb-2 text-xs font-medium text-slate-500 uppercase tracking-wider">
            <div className="flex-[2]">পণ্যের নাম</div>
            <div className="flex-1">মূল্য (৳)</div>
            <div className="w-20 text-center">পরিমাণ</div>
            <div className="w-10"></div>
          </div>

          <div className="space-y-3">
            {items.map((item, index) => (
              <div key={item.id} className="flex flex-col sm:flex-row gap-3 bg-slate-950/50 p-3 sm:p-2 rounded-xl border border-slate-800/50 group">
                <input
                  placeholder="পণ্যের নাম"
                  value={item.name}
                  onChange={e => updateItem(item.id, 'name', e.target.value)}
                  className="flex-[2] bg-transparent border border-slate-800 sm:border-transparent rounded-lg p-2.5 text-white text-sm focus:border-blue-500 focus:bg-slate-900 outline-none transition-all"
                />
                <div className="flex gap-3 sm:flex-1">
                  <input
                    type="number"
                    placeholder="মূল্য"
                    value={item.price || ''}
                    onChange={e => updateItem(item.id, 'price', Number(e.target.value))}
                    className="flex-1 bg-transparent border border-slate-800 sm:border-transparent rounded-lg p-2.5 text-white text-sm focus:border-blue-500 focus:bg-slate-900 outline-none transition-all"
                  />
                  <input
                    type="number"
                    placeholder="1"
                    value={item.qty}
                    onChange={e => updateItem(item.id, 'qty', Number(e.target.value))}
                    className="w-20 bg-transparent border border-slate-800 sm:border-transparent rounded-lg p-2.5 text-white text-sm text-center focus:border-blue-500 focus:bg-slate-900 outline-none transition-all"
                  />
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-2.5 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors sm:opacity-0 group-hover:opacity-100 focus:opacity-100"
                    title="মুছে ফেলুন"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button onClick={addItem} className="mt-4 text-blue-400 flex items-center gap-2 text-sm font-medium hover:text-blue-300 bg-blue-500/10 px-4 py-2 rounded-lg transition-colors w-full sm:w-auto justify-center">
            <Plus size={16} /> নতুন পণ্য যোগ করুন
          </button>
        </div>

        {/* Totals Section */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm flex flex-col md:flex-row gap-6 justify-between items-start">
          <div className="w-full md:w-1/3">
            <label className="block text-sm font-medium text-slate-400 mb-2">ডিসকাউন্ট (টাকা)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium">৳</span>
              <input
                type="number"
                value={discount || ''}
                onChange={e => setDiscount(Number(e.target.value))}
                placeholder="0"
                className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 pl-8 pr-4 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
          </div>

          <div className="w-full md:w-1/2 bg-slate-950 rounded-xl p-5 border border-slate-800 space-y-3">
            <div className="flex justify-between text-slate-400 text-sm">
              <span>সাবটোটাল</span>
              <span className="font-mono">{subTotal} ৳</span>
            </div>
            <div className="flex justify-between text-emerald-400 text-sm">
              <span>ডিসকাউন্ট</span>
              <span className="font-mono">- {discount} ৳</span>
            </div>
            <div className="flex justify-between text-white font-bold text-xl pt-3 border-t border-slate-800">
              <span>সর্বমোট</span>
              <span className="font-mono text-blue-400">{total} ৳</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <button
            onClick={handlePrint}
            className="flex-1 bg-slate-800 text-white font-bold py-4 rounded-xl hover:bg-slate-700 flex items-center justify-center gap-2 transition-all border border-slate-700 hover:border-slate-600"
          >
            <Printer size={20} /> প্রিন্ট করুন
          </button>
          <button
            onClick={() => setIsGenerated(true)}
            className="flex-[2] bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/20"
          >
            <FileText size={20} /> ইনভয়েস তৈরি করুন
          </button>
        </div>
      </div>
    </div>
  );
};

export default Invoice;