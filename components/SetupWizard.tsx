import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, CheckCircle, Store, Phone, MapPin, CreditCard, Settings } from 'lucide-react';

interface SetupData {
    shopName: string;
    shopCategory: string;
    ownerName: string;
    phone: string;
    address: string;
    city: string;
    currency: string;
    language: string;
}

interface Props {
    onComplete: (data: SetupData) => void;
    initialShopName?: string;
}

const SetupWizard: React.FC<Props> = ({ onComplete, initialShopName = '' }) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [data, setData] = useState<SetupData>({
        shopName: initialShopName,
        shopCategory: '',
        ownerName: '',
        phone: '',
        address: '',
        city: '',
        currency: 'BDT',
        language: 'Bengali',
    });

    const shopCategories = [
        'মুদির দোকান',
        'কাপড়ের দোকান',
        'ইলেকট্রনিক্স',
        'হার্ডওয়্যার',
        'ফার্মেসি',
        'রেস্তোরাঁ',
        'সেলুন/বিউটি',
        'অন্যান্য'
    ];

    const districts = [
        'ঢাকা',
        'গাজীপুর',
        'গোপালগঞ্জ',
        'কিশোরগঞ্জ',
        'মাদারীপুর',
        'মানিকগঞ্জ',
        'মুন্সিগঞ্জ',
        'নারায়ণগঞ্জ',
        'নরসিংদী',
        'রাজবাড়ী',
        'শরীয়তপুর',
        'টাঙ্গাইল',
        'ফরিদপুর',
        'চট্টগ্রাম',
        'কুমিল্লা',
        'ব্রাহ্মণবাড়িয়া',
        'ফেনী',
        'চাঁদপুর',
        'লক্ষ্মীপুর',
        'নোয়াখালী',
        'কক্সবাজার',
        'বান্দরবান',
        'রাঙামাটি',
        'খাগড়াছড়ি',
        'রাজশাহী',
        'নাটোর',
        'চাঁপাইনবাবগঞ্জ',
        'নওগাঁ',
        'সিরাজগঞ্জ',
        'পাবনা',
        'বগুড়া',
        'জয়পুরহাট',
        'রংপুর',
        'দিনাজপুর',
        'গাইবান্ধা',
        'কুড়িগ্রাম',
        'লালমনিরহাট',
        'নীলফামারী',
        'পঞ্চগড়',
        'ঠাকুরগাঁও',
        'বরিশাল',
        'ভোলা',
        'পটুয়াখালী',
        'পিরোজপুর',
        'ঝালকাঠি',
        'বরগুনা',
        'খুলনা',
        'বাগেরহাট',
        'যশোর',
        'সাতক্ষীরা',
        'ঝিনাইদহ',
        'কুষ্টিয়া',
        'মাগুরা',
        'নড়াইল',
        'চুয়াডাঙ্গা',
        'মেহেরপুর',
        'সিলেট',
        'মৌলভীবাজার',
        'হবিগঞ্জ',
        'সুনামগঞ্জ',
        'ময়মনসিংহ',
        'জামালপুর',
        'নেত্রকোণা',
        'শেরপুর'
    ];

    const handleNext = () => {
        if (currentStep < 5) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrev = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleComplete = () => {
        localStorage.setItem('setupWizardCompleted', 'true');
        localStorage.setItem('shopDetails', JSON.stringify(data));
        localStorage.setItem('shopName', data.shopName);
        localStorage.setItem('currency', data.currency);
        localStorage.setItem('language', data.language);
        onComplete(data);
    };

    const isStepComplete = (): boolean => {
        switch (currentStep) {
            case 1:
                return data.shopName.trim().length > 0;
            case 2:
                return data.shopCategory.length > 0;
            case 3:
                return data.ownerName.trim().length > 0 && data.phone.trim().length > 0;
            case 4:
                return data.address.trim().length > 0 && data.city.length > 0;
            case 5:
                return data.currency.length > 0 && data.language.length > 0;
            default:
                return false;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px]"></div>
            </div>

            {/* Main Card */}
            <div className="relative z-10 w-full max-w-2xl">
                <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl">
                    {/* Progress Indicator */}
                    <div className="mb-8">
                        <div className="flex justify-between items-center mb-4">
                            {[1, 2, 3, 4, 5].map((step) => (
                                <div key={step} className="flex items-center">
                                    <div
                                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${step < currentStep
                                            ? 'bg-green-500 text-white'
                                            : step === currentStep
                                                ? 'bg-blue-600 text-white scale-110'
                                                : 'bg-slate-800 text-slate-400'
                                            }`}
                                    >
                                        {step < currentStep ? <CheckCircle size={20} /> : step}
                                    </div>
                                    {step < 5 && (
                                        <div
                                            className={`h-1 flex-1 mx-2 rounded-full transition-all duration-300 ${step < currentStep ? 'bg-green-500' : 'bg-slate-800'
                                                }`}
                                        ></div>
                                    )}
                                </div>
                            ))}
                        </div>
                        <p className="text-center text-slate-400 text-sm">ধাপ {currentStep} / 5</p>
                    </div>

                    {/* Step Content */}
                    <div className="min-h-80">
                        {/* Step 1: Shop Name */}
                        {currentStep === 1 && (
                            <div className="animate-fade-in">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-3 bg-blue-600/20 rounded-xl text-blue-400">
                                        <Store size={28} />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-white">আপনার দোকানের নাম</h2>
                                        <p className="text-slate-400 text-sm">এটি আপনার ইনভয়েসে প্রদর্শিত হবে</p>
                                    </div>
                                </div>
                                <input
                                    type="text"
                                    value={data.shopName}
                                    onChange={(e) => setData({ ...data, shopName: e.target.value })}
                                    placeholder="যেমন: আহমেদের মুদি দোকান"
                                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                />
                            </div>
                        )}

                        {/* Step 2: Shop Category */}
                        {currentStep === 2 && (
                            <div className="animate-fade-in">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-3 bg-purple-600/20 rounded-xl text-purple-400">
                                        <Store size={28} />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-white">ব্যবসার ধরন</h2>
                                        <p className="text-slate-400 text-sm">আপনার ব্যবসার ক্যাটেগরি নির্বাচন করুন</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    {shopCategories.map((cat) => (
                                        <button
                                            key={cat}
                                            onClick={() => setData({ ...data, shopCategory: cat })}
                                            className={`p-3 rounded-lg border-2 transition-all text-sm font-medium ${data.shopCategory === cat
                                                ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                                                : 'border-slate-700 bg-slate-800/50 text-slate-300 hover:border-slate-600'
                                                }`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Step 3: Contact Information */}
                        {currentStep === 3 && (
                            <div className="animate-fade-in space-y-4">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-3 bg-green-600/20 rounded-xl text-green-400">
                                        <Phone size={28} />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-white">যোগাযোগ তথ্য</h2>
                                        <p className="text-slate-400 text-sm">আপনার ব্যক্তিগত তথ্য প্রবেশ করুন</p>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-slate-300 mb-2 font-medium">মালিকের নাম</label>
                                    <input
                                        type="text"
                                        value={data.ownerName}
                                        onChange={(e) => setData({ ...data, ownerName: e.target.value })}
                                        placeholder="যেমন: মোহাম্মদ আহমেদ"
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-300 mb-2 font-medium">ফোন নম্বর</label>
                                    <input
                                        type="tel"
                                        value={data.phone}
                                        onChange={(e) => setData({ ...data, phone: e.target.value })}
                                        placeholder="যেমন: 01912345678"
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Step 4: Address */}
                        {currentStep === 4 && (
                            <div className="animate-fade-in space-y-4">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-3 bg-orange-600/20 rounded-xl text-orange-400">
                                        <MapPin size={28} />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-white">দোকানের ঠিকানা</h2>
                                        <p className="text-slate-400 text-sm">আপনার ব্যবসার অবস্থান</p>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-slate-300 mb-2 font-medium">ঠিকানা</label>
                                    <textarea
                                        value={data.address}
                                        onChange={(e) => setData({ ...data, address: e.target.value })}
                                        placeholder="যেমন: ধানমন্ডি, রোড ৩২, বিল্ডিং ৫"
                                        rows={3}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all resize-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-300 mb-2 font-medium">জেলা</label>
                                    <select
                                        value={data.city}
                                        onChange={(e) => setData({ ...data, city: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                    >
                                        <option value="">জেলা নির্বাচন করুন</option>
                                        {districts.map((district) => (
                                            <option key={district} value={district}>
                                                {district}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        )}

                        {/* Step 5: Preferences */}
                        {currentStep === 5 && (
                            <div className="animate-fade-in space-y-4">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-3 bg-cyan-600/20 rounded-xl text-cyan-400">
                                        <Settings size={28} />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-white">পছন্দের সেটিংস</h2>
                                        <p className="text-slate-400 text-sm">আপনার পছন্দ অনুযায়ী কাস্টমাইজ করুন</p>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-slate-300 mb-2 font-medium">মুদ্রা</label>
                                    <select
                                        value={data.currency}
                                        onChange={(e) => setData({ ...data, currency: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                    >
                                        <option value="BDT">টাকা (BDT)</option>
                                        <option value="USD">ডলার (USD)</option>
                                        <option value="INR">টাকা (INR)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-slate-300 mb-2 font-medium">ভাষা</label>
                                    <select
                                        value={data.language}
                                        onChange={(e) => setData({ ...data, language: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                    >
                                        <option value="Bengali">বাংলা</option>
                                        <option value="English">English</option>
                                    </select>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex gap-4 mt-8">
                        <button
                            onClick={handlePrev}
                            disabled={currentStep === 1}
                            className="flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all"
                        >
                            <ChevronLeft size={20} />
                            পূর্ববর্তী
                        </button>

                        {currentStep < 5 ? (
                            <button
                                onClick={handleNext}
                                disabled={!isStepComplete()}
                                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all"
                            >
                                পরবর্তী
                                <ChevronRight size={20} />
                            </button>
                        ) : (
                            <button
                                onClick={handleComplete}
                                disabled={!isStepComplete()}
                                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all"
                            >
                                <CheckCircle size={20} />
                                সেটআপ সম্পূর্ণ করুন
                            </button>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-slate-500 text-sm mt-6">
                    যেকোনো সময় সেটিংস থেকে এই তথ্য পরিবর্তন করতে পারবেন
                </p>
            </div>

            <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
        </div>
    );
};

export default SetupWizard;
