import React, { useEffect, useState } from 'react';
import { Printer, CheckCircle, Zap } from 'lucide-react';

const defaultSettings = {
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

const PrinterSettings: React.FC = () => {
    const [settings, setSettings] = useState(defaultSettings);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        const raw = window.localStorage.getItem('printerSettings');
        if (raw) {
            setSettings({ ...defaultSettings, ...JSON.parse(raw) });
        }
    }, []);

    const handleSave = () => {
        window.localStorage.setItem('printerSettings', JSON.stringify(settings));
        setSaved(true);
        setTimeout(() => setSaved(false), 1800);
    };

    const handleTestPrint = () => {
        const receiptHtml = `
      <html>
        <head>
          <style>
            body { font-family: monospace; padding: 16px; color: #111; background: #fff; }
            .receipt { width: ${settings.paperWidth}; margin: auto; }
            .divider { border-bottom: 1px dashed #444; margin: 8px 0; }
            .center { text-align: center; }
            .row { display: flex; justify-content: space-between; }
            .small { font-size: 12px; }
            .bold { font-weight: 700; }
          </style>
        </head>
        <body>
          <div class="receipt">
            <div class="center bold">BIZNURO AI</div>
            <div class="center small">Dhaka | 017XXXXXXXX | info@biznuro.ai</div>
            <div class="divider"></div>
            <div class="row"><span>তারিখ:</span><span>${new Date().toLocaleDateString('bn-BD')}</span></div>
            <div class="row"><span>সময়:</span><span>${new Date().toLocaleTimeString('bn-BD')}</span></div>
            <div class="row"><span>রসিদ নং:</span><span>INV-123456</span></div>
            <div class="divider"></div>
            <div class="row"><span>পণ্য</span><span>মোট</span></div>
            <div class="row"><span>মোবাইল</span><span>১২০০</span></div>
            <div class="row"><span>চিপস</span><span>৮০</span></div>
            <div class="divider"></div>
            <div class="row"><span>সাবটোটাল:</span><span>৳1280</span></div>
            <div class="row"><span>ডিসকাউন্ট:</span><span>-৳80</span></div>
            <div class="row bold"><span>সর্বমোট:</span><span>৳1200</span></div>
            <div class="divider"></div>
            <div class="center">${settings.thankYouMessage}</div>
          </div>
        </body>
      </html>
    `;
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(receiptHtml);
            printWindow.document.close();
            printWindow.focus();
            printWindow.print();
        }
    };

    return (
        <div className="p-4 md:p-4 max-w-5xl mx-auto animate-fade-in pb-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-white">প্রিন্টার সেটিংস</h2>
                    <p className="text-slate-400 mt-2 max-w-2xl">থার্মাল রসিদ এবং প্রিন্টার সংযোগের সকল বিকল্প এখানে সেট করুন।</p>
                </div>
                <div className="inline-flex items-center gap-2 bg-slate-900 border border-slate-800 px-4 py-3 rounded-2xl text-slate-300">
                    <Printer size={18} /> থার্মাল প্রিন্টার পরিচালনা
                </div>
            </div>

            <div className="grid lg:grid-cols-[1.25fr_0.75fr] gap-6">
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
                    <div className="grid gap-4">
                        <div>
                            <label className="block text-slate-400 mb-2">কাগজের প্রস্থ</label>
                            <select
                                value={settings.paperWidth}
                                onChange={(e) => setSettings({ ...settings, paperWidth: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 px-4 text-white"
                            >
                                <option value="58mm">58mm</option>
                                <option value="80mm">80mm</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-slate-400 mb-2">প্রিন্টার সংযোগ</label>
                            <select
                                value={settings.connectionType}
                                onChange={(e) => setSettings({ ...settings, connectionType: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 px-4 text-white"
                            >
                                <option value="USB">USB Printer</option>
                                <option value="Bluetooth">Bluetooth Printer</option>
                                <option value="Network">Network Printer</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-slate-400 mb-2">নেটওয়ার্ক প্রিন্টার IP</label>
                            <input
                                value={settings.networkPrinterIP}
                                onChange={(e) => setSettings({ ...settings, networkPrinterIP: e.target.value })}
                                placeholder="192.168.1.100"
                                className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 px-4 text-white"
                            />
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                                <label className="flex items-center gap-3 text-slate-400 text-sm">
                                    <input
                                        type="checkbox"
                                        checked={settings.autoPrint}
                                        onChange={(e) => setSettings({ ...settings, autoPrint: e.target.checked })}
                                        className="h-4 w-4 rounded accent-blue-500"
                                    />
                                    অটো প্রিন্ট সক্রিয়
                                </label>
                            </div>
                            <div>
                                <label className="block text-slate-400 mb-2">কপির সংখ্যা</label>
                                <select
                                    value={settings.copies}
                                    onChange={(e) => setSettings({ ...settings, copies: Number(e.target.value) })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 px-4 text-white"
                                >
                                    <option value={1}>1</option>
                                    <option value={2}>2</option>
                                    <option value={3}>3</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="flex items-center gap-3 text-slate-400 text-sm">
                                <input
                                    type="checkbox"
                                    checked={settings.showLogo}
                                    onChange={(e) => setSettings({ ...settings, showLogo: e.target.checked })}
                                    className="h-4 w-4 rounded accent-blue-500"
                                />
                                দোকানের লোগো দেখান
                            </label>
                            <label className="flex items-center gap-3 text-slate-400 text-sm mt-3">
                                <input
                                    type="checkbox"
                                    checked={settings.showQRCode}
                                    onChange={(e) => setSettings({ ...settings, showQRCode: e.target.checked })}
                                    className="h-4 w-4 rounded accent-blue-500"
                                />
                                QR কোড দেখান
                            </label>
                            <label className="flex items-center gap-3 text-slate-400 text-sm mt-3">
                                <input
                                    type="checkbox"
                                    checked={settings.showTerms}
                                    onChange={(e) => setSettings({ ...settings, showTerms: e.target.checked })}
                                    className="h-4 w-4 rounded accent-blue-500"
                                />
                                শর্তাবলী দেখান
                            </label>
                        </div>

                        <div>
                            <label className="block text-slate-400 mb-2">ধন্যবাদ বার্তা</label>
                            <input
                                value={settings.thankYouMessage}
                                onChange={(e) => setSettings({ ...settings, thankYouMessage: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 px-4 text-white"
                            />
                        </div>

                        <div>
                            <label className="block text-slate-400 mb-2">ফন্ট সাইজ</label>
                            <select
                                value={settings.fontSize}
                                onChange={(e) => setSettings({ ...settings, fontSize: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 px-4 text-white"
                            >
                                <option value="small">ছোট</option>
                                <option value="medium">মাঝারি</option>
                                <option value="large">বড়</option>
                            </select>
                        </div>
                    </div>

                    <div className="mt-6 flex flex-col sm:flex-row gap-3">
                        <button onClick={handleSave} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl py-3 font-semibold transition">সেভ করুন</button>
                        <button onClick={handleTestPrint} className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl py-3 font-semibold transition">টেস্ট প্রিন্ট</button>
                    </div>
                    {saved && (
                        <div className="mt-4 flex items-center gap-2 text-emerald-400 font-semibold">
                            <CheckCircle size={18} /> প্রিন্টার সেটিংস সেভ করা হয়েছে
                        </div>
                    )}
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
                    <div className="space-y-4">
                        <div className="rounded-3xl border border-slate-800 p-4 bg-slate-950">
                            <h4 className="text-lg font-semibold text-white mb-3">থার্মাল রসিদ প্রিভিউ</h4>
                            <div className="text-slate-400 text-sm leading-7">
                                <p>উইন্ডো প্রিন্ট ব্যবহার করে থার্মাল স্টাইলিং সহ প্রিন্ট করুন।</p>
                                <p>পেপার প্রস্থ, লোগো, QR কোড, শর্তাবলী এবং কপি সংখ্যা কাস্টমাইজ করুন।</p>
                            </div>
                        </div>
                        <div className="rounded-3xl border border-slate-800 p-4 bg-slate-950">
                            <p className="text-slate-300 mb-3 font-semibold">প্রস্তাবিত ফরম্যাট</p>
                            <pre className="text-slate-400 text-xs leading-6 overflow-x-auto">{
                                `===============================
   [দোকানের নাম]
   [ঠিকানা] | [ফোন]
===============================
তারিখ: DD/MM/YYYY  সময়: HH:MM
রসিদ নং: INV-XXXXXX
--------------------------------
গ্রাহক: [নাম]
ফোন: [নম্বর]
--------------------------------
পণ্য       পরিমাণ  দর    মোট
--------------------------------
[item]      1      100   100
--------------------------------
সাবটোটাল:          ৳200
ডিসকাউন্ট:          -৳10
সর্বমোট:            ৳190
===============================
ধন্যবাদ! আবার আসবেন 🙏
===============================`}
                            </pre>
                        </div>
                        <div className="rounded-3xl border border-slate-800 p-4 bg-slate-950">
                            <h4 className="text-white font-semibold mb-3">ব্রাউজার প্রিন্ট ব্যাকআপ</h4>
                            <p className="text-slate-400 text-sm">যদি থার্মাল প্রিন্টার নেটওয়ার্কে না থাকে, তাহলে উইন্ডো প্রিন্ট দিয়ে থার্মাল স্টাইলিং সহ রসিদ প্রিন্ট করুন।</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrinterSettings;
