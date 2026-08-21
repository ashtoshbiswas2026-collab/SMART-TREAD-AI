import React, { useState } from 'react';
import { View } from '../types';
import { generateAIResponse } from '../geminiService';
import { ChevronRight, ChevronDown, CheckCircle, AlertTriangle, Lightbulb } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Props {
  view: View;
}

const salesTipsList = [
  {
    title: 'ফেসবুক ও হোয়াটসঅ্যাপ ব্যবহার করুন',
    details: 'আপনার ব্যবসার নামে একটি ফেসবুক পেজ খুলুন। নতুন পণ্যের ছবি ও দাম পোস্ট করুন। নিয়মিত কাস্টমারদের হোয়াটসঅ্যাপ গ্রুপে অফার জানান।'
  },
  {
    title: 'ছোট ছাড় বা অফার দিন',
    details: 'নির্দিষ্ট টাকার বেশি কিনলে ছোট কোনো উপহার দিন। যেমন: ৫০০ টাকার বাজার করলে ১ প্যাকেট লবন ফ্রি। এতে মানুষ বেশি কিনতে উৎসাহিত হয়।'
  },
  {
    title: 'কম্বো প্যাক তৈরি করুন',
    details: 'জনপ্রিয় পণ্যগুলো (যেমন: চাল, ডাল, তেল) একসাথে মিলিয়ে প্যাকেজ তৈরি করুন। আলাদা কেনার চেয়ে প্যাকেজে কিছুটা দাম কমিয়ে দিন।'
  },
  {
    title: 'কাস্টমারদের সাথে ভালো সম্পর্ক রাখুন',
    details: 'হাসিমুখে কথা বলুন। নিয়মিত কাস্টমারদের নাম মনে রাখুন এবং তাদের কুশল বিনিময় করুন। সততাই ব্যবসার মূলধন।'
  },
  {
    title: 'স্থানীয়ভাবে প্রচার করুন',
    details: 'দোকানের সামনে আকর্ষণীয় ব্যানার লাগান। বিশেষ দিবস বা উৎসবে বিশেষ ছাড়ের ব্যবস্থা করুন এবং তা মাইকিং বা লিফলেটের মাধ্যমে জানান।'
  },
  {
    title: 'পণ্য সুন্দরভাবে সাজিয়ে রাখুন',
    details: 'দোকান পরিষ্কার রাখুন। বেশি বিক্রিত পণ্যগুলো এবং নতুন পণ্যগুলো চোখের সামনে বা কাউন্টারের কাছে রাখুন।'
  }
];

const BusinessTools: React.FC<Props> = ({ view }) => {
  const [formData, setFormData] = useState<any>({});
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedTip, setExpandedTip] = useState<number | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (promptTemplate: string) => {
    setIsLoading(true);
    const prompt = promptTemplate.replace(/\${(\w+)}/g, (_, key) => formData[key] || '');
    const response = await generateAIResponse(prompt);
    setResult(response);
    setIsLoading(false);
  };

  const toggleTip = (idx: number) => {
    setExpandedTip(expandedTip === idx ? null : idx);
  };

  const renderContent = () => {
    switch (view) {
      case View.PRICING_TOOL:
        return (
          <>
            <header className="mb-6">
              <h2 className="text-3xl font-bold text-white mb-2">পণ্যের মূল্য নির্ধারণ</h2>
              <p className="text-slate-400">আপনার পণ্যের তথ্য দিয়ে লাভজনক ও আকর্ষণীয় বিক্রয়মূল্য জানুন।</p>
            </header>
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
              <h3 className="text-xl font-bold text-white mb-4">পণ্যের তথ্য দিন</h3>
              <div>
                <label className="block text-slate-400 mb-2">পণ্যের নাম</label>
                <input name="productName" onChange={handleInputChange} placeholder="যেমন: প্রিমিয়াম কোয়ালিটি টি-শার্ট" className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white" />
              </div>
              <div>
                <label className="block text-slate-400 mb-2">ক্রয়মূল্য বা উৎপাদন খরচ (টাকা)</label>
                <input name="cost" type="number" onChange={handleInputChange} placeholder="যেমন: ২০০" className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white" />
              </div>
              <div>
                <label className="block text-slate-400 mb-2">পণ্যের চাহিদা কেমন?</label>
                <select name="demand" onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white">
                  <option value="">চাহিদার স্তর নির্বাচন করুন</option>
                  <option value="High">উচ্চ</option>
                  <option value="Medium">মধ্যম</option>
                  <option value="Low">নিম্ন</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-400 mb-2">আপনার কাস্টমার কারা?</label>
                <input name="customerType" onChange={handleInputChange} placeholder="যেমন: ছাত্রছাত্রী, চাকরিজীবী" className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white" />
              </div>
              <div>
                <label className="block text-slate-400 mb-2">বর্তমান বাজারের অবস্থা</label>
                <input name="marketCondition" onChange={handleInputChange} placeholder="যেমন: ঈদের বাজার, প্রতিযোগিতা বেশি" className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white" />
              </div>
              <button
                onClick={() => handleSubmit(`Suggest a pricing strategy in Bengali for Product: ${formData.productName}, Cost: ${formData.cost}, Demand: ${formData.demand}, Customers: ${formData.customerType}, Market: ${formData.marketCondition}`)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl mt-4"
                disabled={isLoading}
              >
                {isLoading ? 'বিশ্লেষণ চলছে...' : 'দাম বিশ্লেষণ করুন'}
              </button>
            </div>
          </>
        );

      case View.LOSS_PREVENTION:
        return (
          <>
            <header className="mb-6">
              <h2 className="text-3xl font-bold text-white mb-2">ক্ষতি প্রতিরোধ</h2>
              <p className="text-slate-400">আপনার ব্যবসার বর্তমান পরিস্থিতি বর্ণনা করে সম্ভাব্য ঝুঁকি এবং তা থেকে উত্তরণের উপায় জানুন।</p>
            </header>
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
              <h3 className="text-xl font-bold text-white mb-4">পরিস্থিতি বর্ণনা করুন</h3>
              <div>
                <label className="block text-slate-400 mb-2">আপনার ব্যবসার বর্তমান অবস্থা বিস্তারিত লিখুন</label>
                <textarea
                  name="situation"
                  rows={4}
                  onChange={handleInputChange}
                  placeholder="যেমন: গত এক মাস ধরে বিক্রি কমে গেছে, কিন্তু দোকানের খরচ একই আছে। মনে হচ্ছে নতুন প্রতিযোগী আসার কারণে এমন হচ্ছে..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white"
                />
              </div>
              <button
                onClick={() => handleSubmit(`Provide loss prevention advice in Bengali for this situation: ${formData.situation}`)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl mt-4"
                disabled={isLoading}
              >
                {isLoading ? 'বিশ্লেষণ চলছে...' : 'বিশ্লেষণ করুন'}
              </button>
            </div>
          </>
        );

      case View.SALES_TIPS:
        return (
          <>
            <header className="mb-6">
              <h2 className="text-3xl font-bold text-white mb-2">বিক্রি বাড়ানোর উপায়</h2>
              <p className="text-slate-400">আপনার ব্যবসার বিক্রি বাড়ানোর জন্য কিছু সহজ ও কম খরচের আইডিয়া।</p>
            </header>
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-blue-400 mb-4">
                <Lightbulb />
                <h3 className="text-xl font-bold">সহজ কৌশল</h3>
              </div>

              {salesTipsList.map((tip, idx) => (
                <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden transition-all duration-300">
                  <button
                    onClick={() => toggleTip(idx)}
                    className="w-full p-4 flex justify-between items-center cursor-pointer hover:bg-slate-800 transition text-left focus:outline-none"
                  >
                    <span className="text-white font-medium">{tip.title}</span>
                    <ChevronDown className={`text-slate-500 transition-transform duration-300 ${expandedTip === idx ? 'rotate-180 text-blue-500' : ''}`} size={20} />
                  </button>
                  <div className={`transition-all duration-300 ease-in-out overflow-hidden ${expandedTip === idx ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="p-4 pt-0 text-slate-400 text-sm leading-relaxed border-t border-slate-800/50">
                      <div className="pt-3">{tip.details}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl mt-8">
              <h3 className="text-xl font-bold text-white mb-4">কাস্টম টিপস পান</h3>
              <textarea
                name="businessType"
                rows={2}
                onChange={handleInputChange}
                placeholder="আপনার ব্যবসার ধরন লিখুন (যেমন: মুদির দোকান, কাপড়ের দোকান)..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white mb-4"
              />
              <button
                onClick={() => handleSubmit(`Give me 5 practical and actionable sales tips in Bengali for a ${formData.businessType} business. Make it specific to this business type.`)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl"
                disabled={isLoading}
              >
                {isLoading ? 'লোড হচ্ছে...' : 'কাস্টম আইডিয়া দেখুন'}
              </button>
            </div>
          </>
        );

      case View.GUIDELINES:
        return (
          <>
            <header className="mb-6">
              <h2 className="text-3xl font-bold text-white mb-2">করণীয় নির্দেশনা</h2>
              <p className="text-slate-400">ব্যবসার পারফরম্যান্স উন্নত করতে দৈনিক তথ্য দিন এবং AI থেকে পরামর্শ নিন।</p>
            </header>
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
              <h3 className="text-xl font-bold text-white mb-4">তথ্য জমা দিন</h3>
              <div>
                <label className="block text-slate-400 mb-2">আজকের মোট বিক্রি (টাকা)</label>
                <input name="dailySales" onChange={handleInputChange} placeholder="যেমন: ১৫০০০" className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white" />
              </div>
              <div>
                <label className="block text-slate-400 mb-2">আজকের মোট খরচ (টাকা)</label>
                <input name="dailyExpense" onChange={handleInputChange} placeholder="যেমন: ৮০০০" className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white" />
              </div>
              <div>
                <label className="block text-slate-400 mb-2">স্টকের অবস্থা</label>
                <input name="stockStatus" onChange={handleInputChange} placeholder="যেমন: কিছু পণ্য প্রায় শেষ" className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white" />
              </div>
              <div>
                <label className="block text-slate-400 mb-2">কাস্টমারদের মতামত</label>
                <input name="customerFeedback" onChange={handleInputChange} placeholder="যেমন: কাস্টমাররা একটি নতুন পণ্যের খোঁজ করছে" className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white" />
              </div>
              <button
                onClick={() => handleSubmit(`Provide daily business guidelines in Bengali based on: Sales ${formData.dailySales}, Expense ${formData.dailyExpense}, Stock: ${formData.stockStatus}, Feedback: ${formData.customerFeedback}`)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl mt-4"
                disabled={isLoading}
              >
                {isLoading ? 'বিশ্লেষণ চলছে...' : 'পরামর্শ নিন'}
              </button>
            </div>
          </>
        );

      default:
        return <div>Tool not found</div>;
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto pb-10">
      {renderContent()}

      {result && (
        <div className="mt-8 bg-slate-900 border border-slate-700 p-6 rounded-2xl animate-fade-in">
          <h3 className="text-xl font-bold text-blue-400 mb-4 flex items-center gap-2">
            <Lightbulb size={24} />
            AI বিশ্লেষণ
          </h3>
          <div className="prose prose-invert prose-p:text-slate-300 max-w-none">
            <ReactMarkdown>{result}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessTools;