import React, { useState, createContext, useContext } from 'react';
import { Link } from 'react-router-dom';
import Modal from '../ui/Modal';
import { LegalContent } from './LegalContent';
import { ShieldCheck, Cpu, Lock, Network, KeyRound, Database, FileSpreadsheet, Activity } from 'lucide-react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [modal, setModal] = useState({ isOpen: false, title: '', type: 'terms' });

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

/**
 * Enterprise Split-Screen Auth Layout
 * 
 * - Laptop / Desktop (`lg`): Left side technical rail + Right side clean white-first form.
 *   Uses `lg:h-screen lg:overflow-hidden` so laptop viewports fit cleanly without scrolling.
 * - Mobile / Smartphone: Responsive stacking with the form at the top (`order-1 lg:order-2`),
 *   followed smoothly by the technical details rail below (`order-2 lg:order-1`) so users
 *   interact with the form immediately and can scroll down to read architecture details.
 * 
 * @param {string} mode - "login" | "register" for mode-tailored telemetry narratives
 */
const AuthLayout = ({ 
  children, 
  title, 
  subtitle, 
  badge = "WORKSPACE ACCESS", 
  mode = "login",
  maxWidth = "max-w-[440px]" 
}) => {
  const isRegister = mode === 'register';

  return (
    <div className="min-h-[100vh] min-h-[100svh] w-full flex flex-col lg:flex-row lg:h-screen lg:overflow-hidden bg-[#0b0f19] text-slate-900 font-sans selection:bg-slate-900 selection:text-white">
      
      {/* =========================================================================
          LEFT PANEL: Technical Architecture & Enclave Telemetry (Desktop Left / Mobile Below)
          On mobile: order-2 (rendered below the form so the user can scroll to details)
          On desktop: order-1 (lg:w-[50%] xl:w-[52%]), full-height flex column, non-scrolling
         ========================================================================= */}
      <aside 
        aria-label="Enclave Architecture Overview"
        className="order-2 lg:order-1 lg:w-[50%] xl:w-[52%] bg-slate-950 text-slate-100 border-t lg:border-t-0 lg:border-r border-slate-800/80 p-6 sm:p-10 lg:p-12 flex flex-col justify-between relative overflow-hidden"
      >
        {/* Subtle Architectural Grid Pattern */}
        <div 
          className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b18_1px,transparent_1px),linear-gradient(to_bottom,#1e293b18_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none"
          aria-hidden="true"
        />

        {/* 1. Header Branding */}
        <div className="relative z-10 flex items-center justify-between pb-4 sm:pb-6">
          <Link to="/" className="flex items-center space-x-3 group focus:outline-none focus-visible:ring-1 focus-visible:ring-sky-500 rounded">
            <div className="w-7 h-7 rounded bg-slate-900 border border-slate-700/80 text-white flex items-center justify-center font-mono font-bold text-xs shadow-sm transition-transform group-hover:scale-95">
              C
            </div>
            <div className="flex flex-col">
              <span className="font-mono text-xs sm:text-sm font-bold tracking-tight text-white">
                CIPHER ANALYTICS
              </span>
              <span className="text-[9px] font-mono tracking-wider text-slate-400 uppercase -mt-0.5">
                Privacy-Preserving Platform
              </span>
            </div>
          </Link>

          <div className="flex items-center space-x-2 text-[10px] font-mono px-2.5 py-1 rounded bg-slate-900/90 border border-slate-800 text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>{isRegister ? 'IDENTITY ONBOARDING' : 'TLS 1.3 SECURE LINK'}</span>
          </div>
        </div>

        {/* 2. Middle Content Narrative (Tailored for Login vs Register) */}
        <div className="relative z-10 my-auto py-4 sm:py-6 space-y-5 sm:space-y-6 max-w-xl">
          
          {/* Badge & Headline */}
          <div className="space-y-2.5">
            <div className="inline-flex items-center space-x-2 px-2 py-0.5 rounded bg-sky-500/10 border border-sky-500/20 text-sky-400 font-mono text-[10px]">
              <span>{isRegister ? 'ZERO-TRUST ENCLAVE ONBOARDING' : 'HOMOMORPHIC ENCLAVE GATEWAY'}</span>
            </div>
            
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-white leading-tight">
              {isRegister 
                ? 'Cryptographic isolation with mathematically provable privacy.'
                : 'Execute analytics across encrypted tensors. Zero plaintexts.'
              }
            </h2>
            
            <p className="text-xs sm:text-[13px] text-slate-400 leading-relaxed font-normal">
              {isRegister
                ? 'Join an institutional federated analytics network. Data Owners retain exclusive key ownership via TenSEAL, while Certified Researchers compute statistics without seeing raw numbers.'
                : 'Authenticate your corporate identity to access zero-trust analytics. All computations evaluate directly inside the Cheon-Kim-Kim-Song (CKKS) scheme over encrypted polynomial rings.'
              }
            </p>
          </div>

          {/* Cryptographic Execution Architecture Matrix */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {isRegister ? (
              <>
                <div className="p-3 rounded bg-slate-900/80 border border-slate-800/90 space-y-1">
                  <div className="flex items-center space-x-2 text-sky-400">
                    <Database className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-mono uppercase font-semibold">Data Owner Role</span>
                  </div>
                  <div className="text-xs font-mono font-bold text-white">Client Keygen • Zero Custody</div>
                  <div className="text-[10px] text-slate-400 leading-normal">Secret keys never leave your workstation. Encrypt schemas with RLWE before ingest.</div>
                </div>

                <div className="p-3 rounded bg-slate-900/80 border border-slate-800/90 space-y-1">
                  <div className="flex items-center space-x-2 text-emerald-400">
                    <Activity className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-mono uppercase font-semibold">Researcher Role</span>
                  </div>
                  <div className="text-xs font-mono font-bold text-white">Homomorphic Evaluation</div>
                  <div className="text-[10px] text-slate-400 leading-normal">Submit statistical requests across cohorts with enforced k-anonymity defense (n ≥ 5).</div>
                </div>

                <div className="p-3 rounded bg-slate-900/80 border border-slate-800/90 space-y-1">
                  <div className="flex items-center space-x-2 text-purple-400">
                    <Lock className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-mono uppercase font-semibold">Dual Governance</span>
                  </div>
                  <div className="text-xs font-mono font-bold text-white">Cryptographic Consent</div>
                  <div className="text-[10px] text-slate-400 leading-normal">Granular access approvals require digital handshake between owner and researcher.</div>
                </div>

                <div className="p-3 rounded bg-slate-900/80 border border-slate-800/90 space-y-1">
                  <div className="flex items-center space-x-2 text-amber-400">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-mono uppercase font-semibold">Compliance</span>
                  </div>
                  <div className="text-xs font-mono font-bold text-white">HIPAA & GDPR Compliant</div>
                  <div className="text-[10px] text-slate-400 leading-normal">Exempt from breach notification laws since data is non-decryptable at rest and in use.</div>
                </div>
              </>
            ) : (
              <>
                <div className="p-3 rounded bg-slate-900/80 border border-slate-800/90 space-y-1">
                  <div className="flex items-center space-x-2 text-sky-400">
                    <Cpu className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-mono uppercase font-semibold">SIMD Vector Packing</span>
                  </div>
                  <div className="text-xs font-mono font-bold text-white">4,096 Slots / Ciphertext</div>
                  <div className="text-[10px] text-slate-400 leading-normal">Polynomial degree N=8192 enables parallel floating-point arithmetic.</div>
                </div>

                <div className="p-3 rounded bg-slate-900/80 border border-slate-800/90 space-y-1">
                  <div className="flex items-center space-x-2 text-emerald-400">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-mono uppercase font-semibold">Inference Defense</span>
                  </div>
                  <div className="text-xs font-mono font-bold text-white">k-Anonymity Guard (n ≥ 5)</div>
                  <div className="text-[10px] text-slate-400 leading-normal">Prevents individual reconstruction and query-timing side channels.</div>
                </div>

                <div className="p-3 rounded bg-slate-900/80 border border-slate-800/90 space-y-1">
                  <div className="flex items-center space-x-2 text-purple-400">
                    <Network className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-mono uppercase font-semibold">Task Topology</span>
                  </div>
                  <div className="text-xs font-mono font-bold text-white">queue_fhe • queue_ml</div>
                  <div className="text-[10px] text-slate-400 leading-normal">Dedicated Celery worker partitions for heavy polynomial multiplications.</div>
                </div>

                <div className="p-3 rounded bg-slate-900/80 border border-slate-800/90 space-y-1">
                  <div className="flex items-center space-x-2 text-amber-400">
                    <Activity className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-mono uppercase font-semibold">State Synchronization</span>
                  </div>
                  <div className="text-xs font-mono font-bold text-white">Daphne ASGI WebSockets</div>
                  <div className="text-[10px] text-slate-400 leading-normal">Real-time task state updates without polling overhead.</div>
                </div>
              </>
            )}
          </div>

          {/* Mathematical / Technical Formula Proof */}
          <div className="p-3 rounded bg-black/60 border border-slate-800 font-mono text-[11px] text-slate-400 space-y-1">
            <div className="text-slate-500 text-[9px] uppercase tracking-wider">// CKKS Ring Learning With Errors (RLWE) Foundation</div>
            <div className="text-sky-300">R_q = Z_q[X] / (X^N + 1),  N = 2^13,  q ∈ 240-bit modulus chain</div>
            <div className="text-slate-500 text-[10px]">Enc(m_1) ⊗ Enc(m_2) → Rescale(Δ² → Δ) → Relinearize(GaloisKey)</div>
          </div>
        </div>

        {/* 3. Footer Telemetry */}
        <div className="relative z-10 pt-4 border-t border-slate-800/80 flex items-center justify-between text-[10px] sm:text-[11px] font-mono text-slate-400">
          <div>SOC2 TYPE II • ZERO KEY CUSTODY</div>
          <Link to="/" className="text-slate-400 hover:text-white transition-colors">
            ← Overview
          </Link>
        </div>
      </aside>

      {/* =========================================================================
          RIGHT PANEL: Clean, Mature White-First Form Container
          On mobile: order-1 (displayed immediately at top of page)
          On desktop: order-2 (lg:w-[50%] xl:w-[48%]), clean white canvas, compact layout
         ========================================================================= */}
      <main 
        role="main"
        className="order-1 lg:order-2 lg:w-[50%] xl:w-[48%] bg-[#fbfcfd] border-b lg:border-b-0 border-slate-200 flex flex-col justify-center px-4 sm:px-8 lg:px-12 py-6 sm:py-8 lg:py-10 lg:overflow-y-auto"
      >
        <div className={`w-full ${maxWidth} mx-auto transition-all`}>
          
          {/* Mobile-Only Top Navigation Bar */}
          <div className="lg:hidden flex items-center justify-between pb-5 mb-4 border-b border-slate-200/80">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded bg-slate-900 text-white flex items-center justify-center font-mono font-bold text-xs">
                C
              </div>
              <span className="font-mono text-xs font-bold tracking-tight text-slate-900">
                CIPHER ANALYTICS
              </span>
            </Link>
            <div className="flex items-center space-x-2 text-[10px] font-mono text-slate-500">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
              <span>TLS 1.3 SECURE</span>
            </div>
          </div>

          {/* Clean White Card Envelope with Crisp 1px Border */}
          <div className="bg-white border border-slate-200/90 rounded-lg p-5 sm:p-7 shadow-[0_1px_3px_0_rgba(15,23,42,0.03)]">
            
            {/* Header Text & Badge */}
            <div className="space-y-1.5 mb-5">
              <div className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-600 font-mono text-[10px]">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-900"></span>
                <span>{badge}</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-950">
                {title}
              </h1>
              {subtitle && (
                <p className="text-xs text-slate-500 font-normal leading-relaxed">
                  {subtitle}
                </p>
              )}
            </div>

            {/* Form Slot */}
            <div>
              {children}
            </div>
          </div>

          {/* Under-Card Technical Assurance */}
          <div className="mt-3 px-1 flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>FHE ENCLAVE ISOLATION</span>
            <span>TOKEN EXPIRATION: 24H</span>
          </div>
        </div>
      </main>

    </div>
  );
};

export default AuthLayout;