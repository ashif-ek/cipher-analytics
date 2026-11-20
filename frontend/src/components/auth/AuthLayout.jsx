import React, { useState, createContext, useContext } from 'react';
import { Link } from 'react-router-dom';
import Modal from '../ui/Modal';
import { LegalContent } from './LegalContent';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [modal, setModal] = useState({ isOpen: false, title: '', type: '' });

  const openLegal = (title, type) => {
    setModal({ isOpen: true, title, type });
  };

  return (
    <AuthContext.Provider value={{ openLegal }}>
      {children}
      <Modal 
        isOpen={modal.isOpen}
        onClose={() => setModal({ ...modal, isOpen: false })}
        onConfirm={() => setModal({ ...modal, isOpen: false })}
        title={modal.title}
        confirmText="Acknowledge"
        showIcon={false}
        size="lg"
        message={<LegalContent type={modal.type} />}
      />
    </AuthContext.Provider>
  );
};

const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#0b0f19] text-slate-100 font-sans selection:bg-sky-500/30 selection:text-white">
      {/* Editorial Tech Rail (Desktop Left / Brand Showcase) */}
      <div className="lg:w-[52%] xl:w-[56%] bg-slate-950 border-r border-slate-800/80 p-8 lg:p-14 flex flex-col justify-between relative overflow-hidden">
        {/* Subtle Architectural Grid Lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none"></div>

        {/* Top Header */}
        <div className="relative z-10 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-8 h-8 rounded bg-sky-600 text-white flex items-center justify-center font-mono font-bold text-sm shadow-sm">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight text-white font-mono">CIPHER ANALYTICS</span>
              <span className="text-[9px] font-mono tracking-widest text-slate-400 uppercase">HOMOMORPHIC ENCLAVE</span>
            </div>
          </Link>

          <div className="flex items-center space-x-2 text-[10px] font-mono px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>CKKS-RLWE-8192</span>
          </div>
        </div>

        {/* Technical Narrative Core */}
        <div className="relative z-10 my-12 lg:my-0 space-y-8 max-w-xl">
          <div className="space-y-3">
            <div className="inline-flex items-center space-x-2 px-2 py-0.5 rounded bg-sky-500/10 border border-sky-500/20 text-sky-400 font-mono text-[10px]">
              <span>ZERO-TRUST COMPUTATION SPECIFICATION</span>
            </div>
            <h2 className="text-2xl lg:text-3xl xl:text-4xl font-bold tracking-tight text-white leading-tight">
              Execute analytics across encrypted tensors. Never expose raw numeric memory.
            </h2>
            <p className="text-xs lg:text-sm text-slate-400 leading-relaxed font-normal">
              Cipher Analytics orchestrates the Cheon-Kim-Kim-Song (CKKS) scheme for Fully Homomorphic Encryption, allowing distributed workers to evaluate linear algebraic statistics and anomaly detectors directly over encrypted polynomial rings.
            </p>
          </div>

          {/* Cryptographic Execution Architecture Matrix */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 rounded bg-slate-900/90 border border-slate-800 space-y-1">
              <span className="text-[9px] font-mono uppercase text-sky-400 font-semibold block">SIMD Vector Packing</span>
              <div className="text-xs font-mono font-bold text-white">4,096 Slots / Ciphertext</div>
              <div className="text-[10px] text-slate-400">Polynomial degree N=8192 enables parallel floating-point arithmetic.</div>
            </div>

            <div className="p-3.5 rounded bg-slate-900/90 border border-slate-800 space-y-1">
              <span className="text-[9px] font-mono uppercase text-emerald-400 font-semibold block">Inference Defense</span>
              <div className="text-xs font-mono font-bold text-white">k-Anonymity Guard (n ≥ 5)</div>
              <div className="text-[10px] text-slate-400">High-cardinality traps and sliding-window query fingerprinting.</div>
            </div>

            <div className="p-3.5 rounded bg-slate-900/90 border border-slate-800 space-y-1">
              <span className="text-[9px] font-mono uppercase text-purple-400 font-semibold block">Task Topology</span>
              <div className="text-xs font-mono font-bold text-white">queue_fhe • queue_ml</div>
              <div className="text-[10px] text-slate-400">Hardware-partitioned Celery worker pools prevent CPU thrashing.</div>
            </div>

            <div className="p-3.5 rounded bg-slate-900/90 border border-slate-800 space-y-1">
              <span className="text-[9px] font-mono uppercase text-amber-400 font-semibold block">State Synchronization</span>
              <div className="text-xs font-mono font-bold text-white">Daphne ASGI WebSockets</div>
              <div className="text-[10px] text-slate-400">Transaction-committed Pub/Sub notifications eliminate polling.</div>
            </div>
          </div>

          {/* Mathematical Proof Snippet */}
          <div className="p-3 rounded bg-black/60 border border-slate-800 font-mono text-[11px] text-slate-400 space-y-1">
            <div className="text-slate-500 text-[9px] uppercase tracking-wider">// CKKS Ring Learning With Errors (RLWE) Foundation</div>
            <div className="text-sky-300">R_q = Z_q[X] / (X^N + 1),  N = 2^13,  q ∈ 240-bit modulus chain</div>
            <div className="text-slate-500 text-[10px]">Enc(m_1) ⊗ Enc(m_2) → Rescale(Δ^2 → Δ) → Relinearize(GaloisKey)</div>
          </div>
        </div>

        {/* Bottom Metadata */}
        <div className="relative z-10 pt-6 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
          <div>SOC2 & HIPAA Compliant Audit Model</div>
          <div>v2.0 • Build verified</div>
        </div>
      </div>

      {/* Interactive Form Panel (White-First High-Precision Canvas) */}
      <div className="lg:w-[48%] xl:w-[44%] bg-white text-slate-900 flex flex-col justify-center px-8 sm:px-14 py-12 relative">
        <div className="max-w-md w-full mx-auto space-y-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-600 font-mono text-[10px]">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-600"></span>
              <span>AUTHENTICATION GATEWAY</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
            <p className="text-xs text-slate-500 font-medium">{subtitle}</p>
          </div>

          <div className="pt-2">
            {children}
          </div>

          <div className="pt-6 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span>TLS 1.3 SECURE CHANNEL</span>
            <span>TOKEN EXPIRATION: 24H</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
