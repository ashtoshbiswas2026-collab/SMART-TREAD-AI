import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useData } from '../context/DataContext';
import { Download, QrCode, Camera, Printer, CheckCircle, X } from 'lucide-react';

interface ProductQrItem {
    id: string;
    name: string;
    price: number;
    qty: number;
}

const QRScanner: React.FC = () => {
    const { transactions, customers } = useData();
    const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
    const [scanOpen, setScanOpen] = useState(false);
    const [scanMessage, setScanMessage] = useState('নিচের বোতামে ক্লিক করে QR স্ক্যান শুরু করুন');
    const [cart, setCart] = useState<ProductQrItem[]>([]);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const scannerInterval = useRef<number | null>(null);

    const playBeep = () => {
        try {
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            if (!AudioContext) return;
            const ctx = new AudioContext();
            const oscillator = ctx.createOscillator();
            const gain = ctx.createGain();
            oscillator.type = 'sine';
            oscillator.frequency.value = 880;
            oscillator.connect(gain);
            gain.connect(ctx.destination);
            gain.gain.value = 0.08;
            oscillator.start();
            setTimeout(() => {
                oscillator.stop();
                ctx.close();
            }, 120);
        } catch {
            // ignore unsupported browsers
        }
    };

    const products = useMemo(() => {
        const map: Record<string, ProductQrItem> = {};
        transactions
            .filter(t => t.type === 'Income')
            .forEach(t => {
                const key = t.category || 'Unknown';
                if (!map[key]) {
                    map[key] = { id: key, name: key, price: t.amount, qty: 1 };
                } else {
                    map[key].price = Math.max(map[key].price, t.amount);
                }
            });
        return Object.values(map).slice(0, 20);
    }, [transactions]);

    const qrUrl = (data: string) => `https://chart.googleapis.com/chart?cht=qr&chs=220x220&chl=${encodeURIComponent(data)}&choe=UTF-8`;

    const toggleSelect = (id: string) => {
        setSelectedProducts(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
    };

    const selectedItems = products.filter(item => selectedProducts.includes(item.id));

    const handleDownloadQr = (item: ProductQrItem) => {
        const link = document.createElement('a');
        link.href = qrUrl(JSON.stringify({ id: item.id, name: item.name, price: item.price }));
        link.download = `${item.name}-qr.png`;
        link.click();
    };

    const handlePrintSheet = () => {
        const html = `
      <html>
        <head>
          <style>
            body { font-family: sans-serif; padding: 16px; background: #fff; }
            .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
            .card { border: 1px solid #ccc; padding: 12px; text-align: center; }
            img { width: 100%; height: auto; }
            .label { margin-top: 8px; font-size: 14px; font-weight: bold; }
            .sub { font-size: 12px; color: #555; }
          </style>
        </head>
        <body>
          <div class="grid">
            ${selectedItems.map(item => `
              <div class="card">
                <img src="${qrUrl(JSON.stringify({ id: item.id, name: item.name, price: item.price }))}" alt="QR" />
                <div class="label">${item.name}</div>
                <div class="sub">৳${item.price}</div>
              </div>
            `).join('')}
          </div>
        </body>
      </html>
    `;
        const win = window.open('', '_blank');
        if (win) {
            win.document.write(html);
            win.document.close();
            win.focus();
            win.print();
        }
    };

    useEffect(() => {
        if (!scanOpen) return;
        let stream: MediaStream | null = null;
        const startCamera = async () => {
            if (!navigator.mediaDevices?.getUserMedia) {
                setScanMessage('ক্যামেরা স্ক্যানার সমর্থিত নয়');
                return;
            }
            try {
                stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    await videoRef.current.play();
                }
                if ('BarcodeDetector' in window) {
                    const detector = new (window as any).BarcodeDetector({ formats: ['qr_code'] });
                    const scanFrame = async () => {
                        if (!videoRef.current) return;
                        try {
                            const detections = await detector.detect(videoRef.current);
                            if (detections?.length > 0) {
                                const rawValue = detections[0].rawValue;
                                setScanMessage(`✅ পণ্য সক্রিয় হয়েছে`);
                                const parsed = JSON.parse(rawValue || '{}');
                                if (parsed.name) {
                                    playBeep();
                                    setScanMessage(`✅ ${parsed.name} যোগ হয়েছে`);
                                    setCart(prev => {
                                        const existing = prev.find(item => item.id === parsed.id);
                                        if (existing) {
                                            return prev.map(item => item.id === parsed.id ? { ...item, qty: item.qty + 1 } : item);
                                        }
                                        return [...prev, { id: parsed.id, name: parsed.name, price: parsed.price || 0, qty: 1 }];
                                    });
                                } else if (parsed.customerId) {
                                    const customer = customers.find(c => c.id === parsed.customerId);
                                    setScanMessage(customer ? `✅ ${customer.name} প্রোফাইল লোড হয়েছে` : '✅ কাস্টমার স্ক্যান হয়েছে');
                                }
                            }
                        } catch {
                            // ignore
                        }
                        scannerInterval.current = window.setTimeout(scanFrame, 800);
                    };
                    scanFrame();
                } else {
                    setScanMessage('এই ব্রাউজারে QR স্ক্যানার নেই, স্ট্যান্ডার্ড মোড চালু করুন।');
                }
            } catch (err) {
                setScanMessage('ক্যামেরা অ্যাক্সেস দেওয়া হয়নি');
            }
        };
        startCamera();
        return () => {
            if (scannerInterval.current) window.clearTimeout(scannerInterval.current);
            if (stream) stream.getTracks().forEach(track => track.stop());
        };
    }, [scanOpen]);

    const totalAmount = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

    return (
        <div className="p-4 md:p-4 max-w-6xl mx-auto animate-fade-in pb-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-white">QR স্ক্যানার ও পণ্য QR</h2>
                    <p className="text-slate-400 mt-2 max-w-2xl">পণ্য QR তৈরি করুন, ডাউনলোড করুন এবং বিক্রয় স্ক্যান করুন।</p>
                </div>
                <button
                    onClick={() => setScanOpen(true)}
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-2xl font-semibold"
                >
                    <Camera size={18} /> QR স্ক্যান করুন
                </button>
            </div>

            <div className="grid lg:grid-cols-[1.4fr_0.6fr] gap-6">
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
                    <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h3 className="text-xl font-semibold text-white">পণ্যের QR কোড</h3>
                            <p className="text-slate-400 text-sm">পণ্যের জন্য একটি ইউনিক QR তৈরি করুন।</p>
                        </div>
                        <button
                            disabled={selectedItems.length === 0}
                            onClick={handlePrintSheet}
                            className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-3 rounded-2xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Printer size={16} /> QR প্রিন্ট করুন
                        </button>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                        {products.length === 0 ? (
                            <div className="col-span-2 text-slate-500">কোন পণ্য পাওয়া যায়নি। প্রথমে বিক্রয় যোগ করুন।</div>
                        ) : products.map(item => (
                            <div key={item.id} className="bg-slate-950 border border-slate-800 rounded-3xl p-4">
                                <div className="flex items-center justify-between gap-3 mb-4">
                                    <div>
                                        <h4 className="text-white font-semibold">{item.name}</h4>
                                        <p className="text-slate-500 text-sm">৳{item.price.toLocaleString()}</p>
                                    </div>
                                    <label className="inline-flex items-center gap-2 text-slate-300 text-sm">
                                        <input
                                            type="checkbox"
                                            checked={selectedProducts.includes(item.id)}
                                            onChange={() => toggleSelect(item.id)}
                                            className="h-4 w-4 accent-blue-500"
                                        />
                                        সিলেক্ট
                                    </label>
                                </div>
                                <img src={qrUrl(JSON.stringify({ id: item.id, name: item.name, price: item.price }))} alt="QR" className="mx-auto mb-4" />
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleDownloadQr(item)}
                                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-2xl text-sm flex items-center justify-center gap-2"
                                    >
                                        <Download size={14} /> ডাউনলোড
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    {customers.length > 0 && (
                        <div className="mt-6 bg-slate-950 border border-slate-800 rounded-3xl p-4">
                            <div className="mb-4 flex items-center justify-between gap-3">
                                <div>
                                    <h4 className="text-lg font-semibold text-white">কাস্টমার QR কোড</h4>
                                    <p className="text-slate-400 text-sm">গ্রাহকদের দ্রুত শনাক্ত করতে একটি QR তৈরি করুন।</p>
                                </div>
                            </div>
                            <div className="grid sm:grid-cols-2 gap-4">
                                {customers.slice(0, 6).map(customer => (
                                    <div key={customer.id} className="bg-slate-800 border border-slate-700 rounded-3xl p-4 text-center">
                                        <div className="mb-3">
                                            <img src={qrUrl(JSON.stringify({ id: customer.id, name: customer.name, phone: customer.phone }))} alt="Customer QR" className="mx-auto mb-3 w-32 h-32" />
                                            <p className="text-white font-semibold">{customer.name}</p>
                                            <p className="text-slate-500 text-xs">{customer.phone}</p>
                                        </div>
                                        <button
                                            onClick={() => {
                                                const link = document.createElement('a');
                                                link.href = qrUrl(JSON.stringify({ id: customer.id, name: customer.name, phone: customer.phone }));
                                                link.download = `${customer.name}-customer-qr.png`;
                                                link.click();
                                            }}
                                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-2xl text-sm transition"
                                        >
                                            ডাউনলোড
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
                    <div className="bg-slate-950 border border-slate-800 rounded-3xl p-4">
                        <h4 className="text-lg font-semibold text-white mb-3">স্ক্যানার স্ট্যাটাস</h4>
                        <p className="text-slate-400 text-sm">{scanMessage}</p>
                    </div>
                    <div className="bg-slate-950 border border-slate-800 rounded-3xl p-4">
                        <h4 className="text-lg font-semibold text-white mb-3">সেলস কার্ট</h4>
                        <div className="space-y-3">
                            {cart.length > 0 ? cart.map(item => (
                                <div key={item.id} className="flex items-center justify-between gap-3 text-slate-300">
                                    <div>
                                        <p>{item.name}</p>
                                        <p className="text-slate-500 text-sm">Qty: {item.qty}</p>
                                    </div>
                                    <span>{(item.price * item.qty).toLocaleString()} ৳</span>
                                </div>
                            )) : (
                                <p className="text-slate-500 text-sm">কোন পণ্য যোগ করা হয়নি।</p>
                            )}
                        </div>
                    </div>
                    <div className="bg-slate-950 border border-slate-800 rounded-3xl p-4">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-slate-400">মোট</span>
                            <span className="font-bold">৳{totalAmount.toLocaleString()}</span>
                        </div>
                        <button
                            onClick={() => setCart([])}
                            className="w-full bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-2xl transition"
                        >
                            বিক্রি সম্পন্ন করুন
                        </button>
                    </div>
                </div>
            </div>

            {scanOpen && (
                <div className="fixed inset-0 z-50 bg-black/80 p-4 flex items-center justify-center">
                    <div className="relative bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-3xl overflow-hidden">
                        <button onClick={() => setScanOpen(false)} className="absolute top-4 right-4 text-slate-300 hover:text-white z-10"><X size={24} /></button>
                        <div className="grid md:grid-cols-[1.4fr_0.6fr] gap-4 p-6">
                            <div className="bg-black rounded-3xl overflow-hidden">
                                <video ref={videoRef} className="w-full h-full object-cover min-h-[320px]" muted playsInline />
                            </div>
                            <div className="space-y-4">
                                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4">
                                    <h4 className="text-lg font-semibold text-white mb-3">QR ভিউফাইন্ডার</h4>
                                    <p className="text-slate-400 text-sm">ক্যামেরা খুলুন এবং পণ্যের QR কোড স্ক্যান করুন।</p>
                                </div>
                                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4">
                                    <h4 className="text-lg font-semibold text-white mb-3">পথনির্দেশ</h4>
                                    <ul className="text-slate-400 text-sm space-y-2 list-disc list-inside">
                                        <li>ক্যামেরার অনুমতি দিন।</li>
                                        <li>QR কোড স্ক্যান করুন।</li>
                                        <li>পণ্য স্বয়ংক্রিয়ভাবে কার্টে যোগ হবে।</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QRScanner;
