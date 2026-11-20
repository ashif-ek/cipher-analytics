import React, { useState, useEffect } from 'react';
import { ShieldCheck, Cpu, Database, Key, Server, Lock, ArrowRight, Activity } from 'lucide-react';

const EnclaveDiagram = () => {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      id: 'encode',
      label: 'SIMD Packing',
      sub: '4096-slot real-valued vector',
      tag: 'CLIENT',
      metric: 'm ∈ ℝ⁴⁰⁹⁶',
      detail: 'Floating-point values mapped to canonical polynomial ring via fixed-point scale Δ=2⁴⁰.'
    },
    {
      id: 'encrypt',
      label: 'RLWE Encryption',
      sub: 'Polynomial mask (c₀, c₁)',
      tag: 'CLIENT',
      metric: 'c ∈ R_q × R_q',
      detail: 'Secret key s kept client-side. Public evaluation context & Galois keys dispatched.'
    },
    {
      id: 'compute',
      label: 'Enclave Execution',
      sub: 'queue_fhe • Celery worker',
      tag: 'ENCLAVE',
      metric: 'E(∑ xᵢ) • Δ²→Δ',
      detail: 'Cyclic Galois rotations & homomorphic additions executed in isolated worker memory.'
    },
    {
      id: 'result',
      label: 'Client Decryption',
      sub: 'Bound: ||e|| < 2⁻³²',
      tag: 'CLIENT',
      metric: 'μ = 18,492.38',
      detail: 'Encrypted result returned to caller. Decryption key extracts true analytical scalar.'
    }
  ];

  // Gentle, high-performance interval for pedagogical step cycling without thrashing
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [steps.length]);

  return (
    <div className="w-full bg-white border border-slate-200 rounded-lg p-5 shadow-sm font-sans">
      {/* Top Diagram Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 rounded bg-slate-900 flex items-center justify-center text-[8px] font-mono text-white font-bold">
            E
          </div>
          <span className="text-xs font-mono font-bold text-slate-900 tracking-tight">ENCLAVE PIPELINE ARCHITECTURE</span>
        </div>
        <div className="flex items-center space-x-2 text-[10px] font-mono text-slate-500">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
          <span>TENALGORITHM: CKKS</span>
        </div>
      </div>

      {/* SVG Circuit / Vector Flow Line (Hardware Accelerated Pure Vector) */}
      <div className="my-5 relative">
        <div className="grid grid-cols-4 gap-2 relative z-10">
          {steps.map((st, idx) => {
            const isActive = activeStep === idx;
            return (
              <button
                key={st.id}
                onClick={() => setActiveStep(idx)}
                className={`text-left p-2.5 rounded border transition-all ${
                  isActive 
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm' 
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[9px] font-mono font-bold ${isActive ? 'text-slate-400' : 'text-slate-500'}`}>
                    0{idx + 1}
                  </span>
                  <span className={`text-[8px] font-mono px-1 py-0.2 rounded ${
                    isActive ? 'bg-slate-800 text-sky-300' : 'bg-white border border-slate-200 text-slate-600'
                  }`}>
                    {st.tag}
                  </span>
                </div>
                <div className="text-xs font-bold tracking-tight truncate">{st.label}</div>
                <div className={`text-[10px] font-mono mt-1 truncate ${isActive ? 'text-slate-300' : 'text-slate-500'}`}>
                  {st.metric}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Stage Inspection Panel */}
      <div className="bg-slate-50 border border-slate-200 rounded p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono uppercase font-semibold text-slate-500">
              Stage 0{activeStep + 1} Inspection:
            </span>
            <span className="text-xs font-bold text-slate-900 font-mono">
              {steps[activeStep].label}
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-600">
            {steps[activeStep].sub}
          </span>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed font-normal">
          {steps[activeStep].detail}
        </p>

        {/* Technical Data Registers (Static Monospace Precision) */}
        <div className="pt-2 border-t border-slate-200 grid grid-cols-2 gap-2 text-[10px] font-mono">
          <div className="p-2 rounded bg-white border border-slate-200 text-slate-600">
            <span className="text-slate-400 block text-[9px] uppercase">Ring Parameter</span>
            <span className="text-slate-900 font-medium">N = 8,192 • Log q = 240</span>
          </div>
          <div className="p-2 rounded bg-white border border-slate-200 text-slate-600">
            <span className="text-slate-400 block text-[9px] uppercase">Memory State</span>
            <span className="text-emerald-700 font-medium">Zero Plaintext Materialization</span>
          </div>
        </div>
      </div>

      {/* Hardware Telemetry Bar */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono text-slate-500">
        <div className="flex items-center space-x-2">
          <Server className="w-3 h-3 text-slate-400" />
          <span>WORKER POOL: queue_fhe</span>
        </div>
        <div className="flex items-center space-x-2">
          <span>PRECISION: FIXED-POINT 40-BIT</span>
        </div>
      </div>
    </div>
  );
};

export default EnclaveDiagram;
