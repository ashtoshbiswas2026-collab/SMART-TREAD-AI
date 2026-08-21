import React, { useState } from 'react';
import { Plus, X, Search, Package, User, Edit2, Trash2, Printer } from 'lucide-react';
import { useData } from '../context/DataContext';

const SalesList: React.FC = () => {
  const { transactions, addTransaction, deleteTransaction, updateTransaction } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [newSale, setNewSale] = useState({
    customerName: '',
    productName: '',
    amount: ''
  });
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const defaultPrinterSettings = {
    paperWidth: '80mm',
    connectionType: 'USB',
    networkPrinterIP: '',
    autoPrint: false,
    copies: 1,
    showLogo: true,
    showQRCode: true,
    showTerms: true,
    thankYouMessage: 'ধন্যবাদ! আবার আসবেন',
    fontSize: 'medium',
  };

  const loadPrinterSettings = () => {
    const raw = window.localStorage.getItem('printerSettings');
    if (!raw) return defaultPrinterSettings;
    try {
      return { ...defaultPrinterSettings, ...JSON.parse(raw) };
    } catch {
      return defaultPrinterSettings;
    }
  };

  const printSaleReceipt = (sale: any) => {
    const settings = loadPrinterSettings();
    const receiptHtml = `
      <html>
        <head>
          <style>
            body { font-family: monospace; margin: 0; padding: 16px; background: #fff; color: #111; }
            .receipt { width: ${settings.paperWidth}; max-width: 100%; margin: auto; }
            .divider { border-bottom: 1px dashed #444; margin: 8px 0; }
            .center { text-align: center; }
            .row { display: flex; justify-content: space-between; font-size: ${settings.fontSize === 'small' ? '11px' : settings.fontSize === 'large' ? '14px' : '12px'}; }
            .bold { font-weight: 700; }
            .item-row { display: flex; justify-content: space-between; margin: 4px 0; }
            .item-name { flex: 1 1 50%; }
            .item-meta { flex: 1 1 50%; text-align: right; }
          </style>
        </head>
        <body>
          <div class="receipt">
            ${settings.showLogo ? '<div class="center bold">BIZNURO AI</div>' : ''}
            <div class="center" style="font-size:12px; margin-top:4px;">Dhaka | 017XXXXXXXX | info@biznuro.ai</div>
            <div class="divider"></div>
            <div class="row"><span>তারিখ:</span><span>${new Date().toLocaleDateString('bn-BD')}</span></div>
            <div class="row"><span>সময়:</span><span>${new Date().toLocaleTimeString('bn-BD')}</span></div>
            <div class="row"><span>রসিদ নং:</span><span>INV-${sale.id?.slice(-6) || Date.now().toString().slice(-6)}</span></div>
            <div class="divider"></div>
            <div class="row bold"><span>গ্রাহক:</span><span>${sale.customerName || 'অজানা'}</span></div>
            <div class="row bold"><span>ফোন:</span><span>${sale.customerPhone || 'N/A'}</span></div>
            <div class="divider"></div>
            <div class="row bold"><span>পণ্য</span><span>মোট</span></div>
            <div class="item-row"><span class="item-name">${sale.productName}</span><span class="item-meta">৳${sale.amount}</span></div>
            <div class="divider"></div>
            <div class="row"><span>সাবটোটাল:</span><span>৳${sale.amount}</span></div>
            <div class="row"><span>ডিসকাউন্ট:</span><span>৳0</span></div>
            <div class="row bold"><span>সর্বমোট:</span><span>৳${sale.amount}</span></div>
            ${settings.showTerms ? '<div class="divider"></div><div style="font-size:10px;line-height:1.4;">বিক্রীত পণ্য ফেরত নেওয়া হয় না। রসিদটি সংরক্ষণ করুন।</div>' : ''}
            ${settings.showQRCode ? `<div class="divider"></div><div class="center"><img src="https://chart.googleapis.com/chart?cht=qr&chs=180x180&chl=${encodeURIComponent(JSON.stringify({ id: sale.id, name: sale.productName, amount: sale.amount }))}&choe=UTF-8" alt="QR" /></div>` : ''}
            <div class="divider"></div>
            <div class="center bold">${settings.thankYouMessage}</div>
          </div>
        </body>
      </html>
    `;

    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(receiptHtml);
    win.document.close();
    win.focus();
    win.print();
  };

  const handleAddOrUpdateSale = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSale.amount || !newSale.productName) return;

    const saleRecord = {
      type: 'Income' as const,
      amount: parseFloat(newSale.amount),
      category: newSale.productName,
      description: newSale.customerName || 'Unknown',
      date: new Date().toISOString()
    };

    if (editingId) {
      updateTransaction(editingId, {
        category: saleRecord.category,
        amount: saleRecord.amount,
        description: saleRecord.description,
      });
    } else {
      addTransaction(saleRecord);
      const settings = loadPrinterSettings();
      if (settings.autoPrint) {
        printSaleReceipt({
          id: Date.now().toString(),
          customerName: saleRecord.description,
          customerPhone: '',
          productName: saleRecord.category,
          amount: saleRecord.amount,
        });
      }
    }

    window.dispatchEvent(new Event('transactionUpdated'));
    setNewSale({ customerName: '', productName: '', amount: '' });
    setEditingId(null);
    setIsModalOpen(false);
  };

  const handleEdit = (sale: any) => {
    setNewSale({
      customerName: sale.description || '',
      productName: sale.category,
      amount: sale.amount.toString()
    });
    setEditingId(sale.id);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setItemToDelete(id);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      deleteTransaction(itemToDelete);
      setItemToDelete(null);
      window.dispatchEvent(new Event('transactionUpdated'));
    }
  };

  const openAddModal = () => {
    setNewSale({ customerName: '', productName: '', amount: '' });
    setEditingId(null);
    setIsModalOpen(true);
  };

  // Filter only Income transactions for sales list
  const sales = transactions.filter(t => t.type === 'Income');

  const filteredSales = sales.filter(sale =>
    (sale.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 md:p-4 max-w-6xl mx-auto animate-fade-in pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">বিক্রির তালিকা</h2>
          <p className="text-slate-400">আপনার সমস্ত বিক্রির হিসাব এখানে দেখুন</p>
        </div>

        <button
          onClick={openAddModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-900/20 transition-all active:scale-95"
        >
          <Plus size={20} />
          নতুন বিক্রি যোগ করুন
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl mb-6 flex items-center gap-3">
        <Search className="text-slate-500" size={20} />
        <input
          type="text"
          placeholder="নাম বা পণ্য দিয়ে খুঁজুন..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-transparent border-none outline-none text-white w-full placeholder-slate-500"
        />
      </div>

      {/* Sales Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-950 border-b border-slate-800">
                <th className="p-3 md:p-4 text-slate-400 font-medium text-xs md:text-sm">নাম</th>
                <th className="p-3 md:p-4 text-slate-400 font-medium text-xs md:text-sm text-right">টাকা</th>
                <th className="p-3 md:p-4 text-slate-400 font-medium text-xs md:text-sm text-right">পণ্যের নাম</th>
                <th className="p-3 md:p-4 text-slate-400 font-medium text-xs md:text-sm text-center">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredSales.length > 0 ? (
                filteredSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-slate-800/50 transition-colors group">
                    <td className="p-3 md:p-4">
                      <div className="flex items-center gap-2 md:gap-3 text-white font-medium text-sm md:text-base">
                        <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                          <User size={12} className="md:w-3.5 md:h-3.5" />
                        </div>
                        <span className="truncate max-w-[80px] md:max-w-none">{sale.description || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="p-3 md:p-4 text-right font-mono font-bold text-green-400 text-sm md:text-base">
                      ৳ {sale.amount.toLocaleString()}
                    </td>
                    <td className="p-3 md:p-4 text-slate-300 text-right text-sm md:text-base">
                      <div className="flex items-center justify-end gap-1 md:gap-2">
                        <Package size={14} className="text-slate-500 shrink-0 md:w-4 md:h-4" />
                        <span className="truncate max-w-[80px] md:max-w-none">{sale.category}</span>
                      </div>
                    </td>
                    <td className="p-3 md:p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(sale);
                          }}
                          className="p-2 bg-slate-800 hover:bg-blue-600/20 hover:text-blue-500 text-slate-400 rounded-lg transition-colors"
                          title="এডিট করুন"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            printSaleReceipt({
                              id: sale.id,
                              customerName: sale.description || 'Unknown',
                              customerPhone: '',
                              productName: sale.category,
                              amount: sale.amount,
                            });
                          }}
                          className="p-2 bg-slate-800 hover:bg-blue-600/20 hover:text-blue-500 text-slate-400 rounded-lg transition-colors"
                          title="প্রিন্ট করুন"
                        >
                          <Printer size={16} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(sale.id);
                          }}
                          className="p-2 bg-slate-800 hover:bg-red-600/20 hover:text-red-500 text-slate-400 rounded-lg transition-colors"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-500">
                    কোনো তথ্য পাওয়া যায়নি
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Sale Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>

            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              {editingId ? <Edit2 className="text-blue-500" /> : <Plus className="text-blue-500" />}
              {editingId ? 'বিক্রি এডিট করুন' : 'বিক্রি যোগ করুন'}
            </h3>

            <form onSubmit={handleAddOrUpdateSale} className="space-y-4">
              <div>
                <label className="block text-slate-400 mb-1.5 text-sm font-medium">ক্রেতার নাম</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input
                    type="text"
                    value={newSale.customerName}
                    onChange={(e) => setNewSale({ ...newSale, customerName: e.target.value })}
                    placeholder="নাম লিখুন (ঐচ্ছিক)"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-white focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1.5 text-sm font-medium">পণ্যের নাম</label>
                <div className="relative">
                  <Package className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input
                    type="text"
                    value={newSale.productName}
                    onChange={(e) => setNewSale({ ...newSale, productName: e.target.value })}
                    placeholder="কি বিক্রি করলেন?"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-white focus:border-blue-500 outline-none transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1.5 text-sm font-medium">দাম (টাকা)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold">৳</span>
                  <input
                    type="number"
                    value={newSale.amount}
                    onChange={(e) => setNewSale({ ...newSale, amount: e.target.value })}
                    placeholder="0.00"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-white focus:border-blue-500 outline-none transition-all font-mono"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all mt-4 shadow-lg shadow-blue-900/20 active:scale-95"
              >
                {editingId ? 'আপডেট করুন' : 'যুক্ত করুন'}
              </button>
            </form>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl animate-slide-up">
            <h3 className="text-xl font-bold text-white mb-4">নিশ্চিত করুন</h3>
            <p className="text-slate-300 mb-6">আপনি কি নিশ্চিত যে আপনি এই বিক্রিটি মুছে ফেলতে চান? এই কাজটি বাতিল করা যাবে না।</p>
            <div className="flex gap-3">
              <button
                onClick={() => setItemToDelete(null)}
                className="flex-1 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition-colors"
              >
                বাতিল
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors"
              >
                মুছে ফেলুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesList;
