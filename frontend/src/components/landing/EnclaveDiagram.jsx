import React, { useState, useEffect } from 'react';
import { Server, ArrowRight } from 'lucide-react';

const EnclaveDiagram = () => {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      id: 'encode',
      label: 'Data Preparation',
      sub: 'Client-side packing',
      tag: 'Client',
      metric: 'Batch size: 4,096',
      detail: 'Raw numeric data is grouped and formatted into structured vectors before cryptographic processing.'
    },
    {
      id: 'encrypt',
      label: 'Local Encryption',
      sub: 'Key isolation',
      tag: 'Client',
      metric: 'Zero key exposure',
      detail: 'Data is encrypted locally using client-generated keys. Secret keys never leave your device.'
    },
    {
      id: 'compute',
      label: 'Secure Processing',
      sub: 'Isolated compute',
      tag: 'Enclave',
      metric: 'Zero plaintext in RAM',
      detail: 'Analytical operations execute directly on the encrypted structures without decryption.'
    },
    {
      id: 'result',
      label: 'Verified Result',
      sub: 'Client decryption',
      tag: 'Client',
      metric: 'Exact precision',
      detail: 'The encrypted calculation is returned to the authorized requester for private, local decryption.'
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [steps.length]);

  return (
    <div className="w-full bg-white border border-slate-200/90 rounded-xl p-5 shadow-sm font-sans">
      {/* Top Diagram Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 rounded bg-slate-900 flex items-center justify-center text-[8px] text-white font-bold">
            C
          </div>
          <span className="text-xs font-semibold text-slate-900 tracking-tight">Computation Workflow</span>
        </div>
        <div className="flex items-center space-x-2 text-xs text-slate-500">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
          <span>End-to-End Encrypted</span>
        </div>
      </div>

      {/* Step Selector Tabs */}
      <div className="my-5">
        <div className="grid grid-cols-4 gap-2">
          {steps.map((st, idx) => {
            const isActive = activeStep === idx;
            return (
              <button
                key={st.id}
                onClick={() => setActiveStep(idx)}
                className={`text-left p-2.5 rounded-lg border transition-all ${
                  isActive 
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs' 
                    : 'bg-slate-50 text-slate-700 border-slate-200/80 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[10px] font-semibold ${isActive ? 'text-slate-400' : 'text-slate-500'}`}>
                    0{idx + 1}
                  </span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded ${
                    isActive ? 'bg-slate-800 text-slate-200' : 'bg-white border border-slate-200 text-slate-600'
                  }`}>
                    {st.tag}
                  </span>
                </div>
                <div className="text-xs font-semibold tracking-tight truncate">{st.label}</div>
                <div className={`text-[10px] mt-1 truncate ${isActive ? 'text-slate-300' : 'text-slate-500'}`}>
                  {st.metric}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Stage Inspection Panel */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-medium text-slate-500">
              Stage 0{activeStep + 1}:
            </span>
            <span className="text-xs font-semibold text-slate-900">
              {steps[activeStep].label}
            </span>
          </div>
          <span className="text-xs text-slate-500">
            {steps[activeStep].sub}
          </span>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed font-normal">
          {steps[activeStep].detail}
        </p>

        {/* Clean Status Registers */}
        <div className="pt-2 border-t border-slate-200/80 grid grid-cols-2 gap-2 text-xs">
          <div className="p-2 rounded bg-white border border-slate-200/80 text-slate-600">
            <span className="text-slate-400 block text-[10px]">Key Custody</span>
            <span className="text-slate-900 font-medium">100% Client-Managed</span>
          </div>
          <div className="p-2 rounded bg-white border border-slate-200/80 text-slate-600">
            <span className="text-slate-400 block text-[10px]">Server Memory</span>
            <span className="text-emerald-700 font-medium">Zero Plaintext Stored</span>
          </div>
        </div>
      </div>

      {/* Clean Telemetry Bar */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center space-x-2">
          <Server className="w-3.5 h-3.5 text-slate-400" />
          <span>Distributed Worker Pipeline</span>
        </div>
        <div className="flex items-center space-x-2">
          <span>High-Precision Processing</span>
        </div>
      </div>
    </div>
  );
};

export default EnclaveDiagram;
