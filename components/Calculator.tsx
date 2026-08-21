import React, { useState } from 'react';
import { Delete } from 'lucide-react';

const Calculator: React.FC = () => {
  const [display, setDisplay] = useState('0');
  const [prevValue, setPrevValue] = useState<string | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [waitingForNewValue, setWaitingForNewValue] = useState(false);

  const handleNumber = (num: string) => {
    if (waitingForNewValue) {
      setDisplay(num);
      setWaitingForNewValue(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  };

  const handleOperator = (op: string) => {
    if (operator && !waitingForNewValue && prevValue) {
      const result = calculate(prevValue, display, operator);
      setDisplay(String(result));
      setPrevValue(String(result));
    } else {
      setPrevValue(display);
    }
    setOperator(op);
    setWaitingForNewValue(true);
  };

  const calculate = (a: string, b: string, op: string) => {
    const num1 = parseFloat(a);
    const num2 = parseFloat(b);
    switch (op) {
      case '+': return num1 + num2;
      case '-': return num1 - num2;
      case '×': return num1 * num2;
      case '÷': return num1 / num2;
      default: return num2;
    }
  };

  const handleEqual = () => {
    if (operator && prevValue) {
      const result = calculate(prevValue, display, operator);
      setDisplay(String(result));
      setPrevValue(null);
      setOperator(null);
      setWaitingForNewValue(true);
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setPrevValue(null);
    setOperator(null);
    setWaitingForNewValue(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-full p-4">
      <div className="w-full max-w-sm bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-800">
        <div className="mb-4 text-right p-4 bg-slate-950 rounded-2xl border border-slate-800 h-24 flex items-end justify-end overflow-hidden">
          <span className="text-4xl font-bold text-white tracking-wider">{display}</span>
        </div>

        <div className="grid grid-cols-4 gap-3">
          <button onClick={handleClear} className="col-span-2 bg-red-600/90 hover:bg-red-600 text-white font-bold py-4 rounded-xl text-xl shadow-lg shadow-red-900/20">C</button>
          <button onClick={() => handleOperator('÷')} className="bg-blue-600/90 hover:bg-blue-600 text-white font-bold py-4 rounded-xl text-xl">÷</button>
          <button onClick={() => handleOperator('×')} className="bg-blue-600/90 hover:bg-blue-600 text-white font-bold py-4 rounded-xl text-xl">×</button>

          {[7, 8, 9].map(n => (
            <button key={n} onClick={() => handleNumber(String(n))} className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 rounded-xl text-xl">{n}</button>
          ))}
          <button onClick={() => handleOperator('-')} className="bg-blue-600/90 hover:bg-blue-600 text-white font-bold py-4 rounded-xl text-xl">-</button>

          {[4, 5, 6].map(n => (
            <button key={n} onClick={() => handleNumber(String(n))} className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 rounded-xl text-xl">{n}</button>
          ))}
          <button onClick={() => handleOperator('+')} className="bg-blue-600/90 hover:bg-blue-600 text-white font-bold py-4 rounded-xl text-xl">+</button>

          {[1, 2, 3].map(n => (
            <button key={n} onClick={() => handleNumber(String(n))} className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 rounded-xl text-xl">{n}</button>
          ))}

          <button onClick={handleEqual} className="row-span-2 bg-blue-500 hover:bg-blue-400 text-white font-bold py-4 rounded-xl text-xl shadow-lg shadow-blue-900/20">=</button>

          <button onClick={() => handleNumber('0')} className="col-span-2 bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 rounded-xl text-xl">0</button>
          <button onClick={() => handleNumber('.')} className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 rounded-xl text-xl">.</button>
        </div>
      </div>
      <p className="mt-8 text-slate-500 text-center text-sm">সাধারণ হিসাব-নিকাশের জন্য ক্যালকুলেটর ব্যবহার করুন।</p>
    </div>
  );
};

export default Calculator;
