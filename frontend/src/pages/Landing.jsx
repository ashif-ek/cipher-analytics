import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Cpu, 
  Lock, 
  Terminal, 
  Database, 
  ArrowRight, 
  ChevronRight, 
  CheckCircle2, 
  Layers, 
  Activity, 
  Server, 
  FileCode, 
  Workflow, 
  BarChart3,
  ExternalLink
} from 'lucide-react';

const Landing = () => {
  const [activeTab, setActiveTab] = useState('ckks');
  const [interactiveStep, setInteractiveStep] = useState(2);

  const stats = [
    { label: 'Polynomial Ring Degree', value: 'N = 8,192', desc: 'RLWE ring security foundation' },
    { label: 'Batch Vector Slots', value: '4,096', desc: 'SIMD float-vector packing' },
    { label: 'Ciphertext Scale Factor', value: 'Δ = 2⁴⁰', desc: 'Fixed-point dynamic precision' },
    { label: 'Zero-Trust Leakage', value: '0 Bytes', desc: 'Zero unencrypted memory exposure' }
  ];

  const computeOperations = [
    {
      id: 'vector_sum',
      name: 'E(∑ xᵢ) Homomorphic Sum',
      complexity: 'O(log n) rotations',
      description: 'Calculates the aggregate scalar across batch-packed encrypted vectors through Galois automorphism cyclic rotations.',
      status: 'VERIFIED_STABLE'
    },
    {
      id: 'mean_variance',
      name: 'E(μ) & E(σ²) Central Moments',
      complexity: 'O(log n) + 1 Mult',
      description: 'Second-order statistical distribution profiling evaluated over ciphertext polynomials with scale relinearization.',
      status: 'VERIFIED_STABLE'
    },
    {
      id: 'pearson_corr',
      name: 'Cov(X, Y) Multi-Variate Correlation',
      complexity: '2 Multiplications',
      description: 'Cross-attribute dependency tracking between encrypted feature columns without disclosing underlying record values.',
      status: 'VERIFIED_STABLE'
    },
    {
      id: 'isolation_forest',
      name: 'Encrypted Anomaly Isolation',
      complexity: 'Tree Traversal Poly',
      description: 'Polynomial depth-budgeted anomaly estimation identifying outlier data vectors in strict enclave boundary.',
      status: 'EXPERIMENTAL_ENCLAVE'
    }
  ];

  return (
    <div className="min-h-screen bg-[#fafbfc] text-slate-900 font-sans selection:bg-sky-500/20 selection:text-slate-900 antialiased">
      {/* Top Engineering Micro-Bar */}
      <div className="bg-[#0b0f19] text-slate-300 border-b border-slate-800 text-[11px] font-mono px-4 py-1.5 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-white font-medium">CRYPTOGRAPHIC ENCLAVE ONLINE</span>
          </span>
          <span className="text-slate-600">|</span>
          <span className="hidden sm:inline text-slate-400">SCHEME: CHEON-KIM-KIM-SONG (CKKS)</span>
          <span className="hidden md:inline text-slate-600">|</span>
          <span className="hidden md:inline text-slate-400">MODULUS: [60, 40, 40, 60]</span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-slate-400">FIPS 140-3 ALIGNED</span>
          <Link to="/login" className="text-sky-400 hover:text-sky-300 transition-colors">
            ACCESS CONSOLE &rarr;
          </Link>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded bg-slate-950 text-white flex items-center justify-center font-mono font-bold text-sm shadow-sm">
                <svg className="w-4 h-4 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold tracking-tight text-slate-900 font-mono">CIPHER ANALYTICS</span>
                <span className="text-[9px] font-mono tracking-widest text-slate-400 uppercase -mt-0.5">Homomorphic Privacy Enclave</span>
              </div>
            </Link>

            <div className="hidden md:flex items-center space-x-6 text-xs font-mono text-slate-600">
              <a href="#architecture" className="hover:text-slate-900 transition-colors">01. ARCHITECTURE</a>
              <a href="#computation" className="hover:text-slate-900 transition-colors">02. FHE KERNEL</a>
              <a href="#governance" className="hover:text-slate-900 transition-colors">03. ZERO-TRUST</a>
              <a href="#telemetry" className="hover:text-slate-900 transition-colors">04. SPECIFICATIONS</a>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Link 
              to="/login"
              className="text-xs font-mono px-3.5 py-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
            >
              Sign In
            </Link>
            <Link 
              to="/register"
              className="text-xs font-mono px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded transition-colors shadow-sm flex items-center space-x-1.5"
            >
              <span>Initialize Workspace</span>
              <ArrowRight className="w-3.5 h-3.5 text-sky-400" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section — Asymmetric Technical Layout */}
      <section className="relative overflow-hidden pt-12 pb-20 border-b border-slate-200 bg-white">
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a08_1px,transparent_1px),linear-gradient(to_bottom,#0f172a08_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Narrative Column */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded bg-slate-100 border border-slate-200 text-slate-700 font-mono text-xs">
                <span className="w-2 h-2 rounded-full bg-sky-600"></span>
                <span>PRODUCTION RELEASE • V2.0 CRYPTOGRAPHIC CORE</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-950 leading-[1.12]">
                Compute high-dimensional analytics directly over ciphertext tensors.
              </h1>

              <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl">
                Cipher Analytics enables collaborative research, federated data queries, and machine learning across sensitive datasets without ever decrypting underlying records. Built on Ring Learning With Errors (RLWE) and TenSEAL.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  to="/register"
                  className="px-5 py-2.5 bg-slate-950 hover:bg-slate-800 text-white text-xs font-mono font-medium rounded transition-colors shadow-sm flex items-center space-x-2"
                >
                  <span>Launch Research Grant</span>
                  <ChevronRight className="w-4 h-4 text-sky-400" />
                </Link>

                <Link
                  to="/login"
                  className="px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 text-xs font-mono font-medium rounded transition-colors"
                >
                  Inspect Existing Datasets
                </Link>

                <div className="text-[11px] font-mono text-slate-400 pl-2">
                  No Plaintext Memory Leaks Guaranteed
                </div>
              </div>

              {/* Mathematical Guarantee Box */}
              <div className="p-4 rounded border border-slate-200 bg-slate-50 font-mono text-xs text-slate-600 space-y-2 mt-4">
                <div className="flex items-center justify-between text-slate-500 text-[10px] uppercase">
                  <span>Theorem 1.1 — CKKS Invariant</span>
                  <span>Scale factor Δ = 2⁴⁰</span>
                </div>
                <div className="text-slate-900 font-semibold">
                  Dec(Enc(x) ⊕ Enc(y)) = x + y + e, &nbsp; ||e|| &lt; 2⁻³²
                </div>
                <div className="text-[11px] text-slate-500">
                  Noise budget managed through scale relinearization and modulus switching.
                </div>
              </div>
            </div>

            {/* Right Asymmetrical Technical Terminal / Enclave Diagram */}
            <div className="lg:col-span-5">
              <div className="rounded-lg border border-slate-800 bg-[#0b0f19] text-slate-200 shadow-xl overflow-hidden font-mono">
                {/* Terminal Title Bar */}
                <div className="px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-[11px]">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500/80"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></span>
                    <span className="text-slate-400 ml-2">cipher-enclave-worker-01</span>
                  </div>
                  <span className="text-emerald-400 text-[10px]">EXEC_ID: #fhe-8192-a1</span>
                </div>

                {/* Live Process Execution Log */}
                <div className="p-4 space-y-3 text-xs leading-relaxed">
                  <div className="text-slate-400">
                    <span className="text-sky-400">$</span> fhe-engine ingest --dataset=clinical_records_v4 --policy=STRICT
                  </div>
                  
                  <div className="p-2.5 rounded bg-black/50 border border-slate-800/80 space-y-1 text-[11px]">
                    <div className="flex justify-between text-slate-400">
                      <span>[01] Vector Batching:</span>
                      <span className="text-white">4,096 slots / polynomial</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>[02] CKKS Context:</span>
                      <span className="text-emerald-400">TenSEAL GaloisKey Registered</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>[03] Isolation Forest:</span>
                      <span className="text-purple-300">Polynomial Depth 4 Approximated</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>[04] k-Anonymity Guard:</span>
                      <span className="text-emerald-400">PASSED (n=1,248 &gt; 5)</span>
                    </div>
                  </div>

                  <div className="space-y-1 text-[11px]">
                    <div className="text-slate-500">// Homomorphic Polynomial Evaluation</div>
                    <div className="text-sky-300 font-medium">
                      E(∑ xᵢ) → 18,492.38491 ± 0.0001
                    </div>
                    <div className="text-slate-400">
                      Rescaling: <span className="text-amber-400">Δ² → Δ</span> | Modulus: <span className="text-slate-300">q₀·q₁·q₂ → q₀·q₁</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500">
                    <span>CELERY QUEUE: queue_fhe</span>
                    <span className="text-emerald-400">LATENCY: 84.2ms</span>
                  </div>
                </div>
              </div>

              {/* Security Pill Grid Below Terminal */}
              <div className="grid grid-cols-2 gap-2 mt-3">
                <div className="p-2.5 rounded bg-white border border-slate-200 flex items-center space-x-2 text-xs">
                  <ShieldCheck className="w-4 h-4 text-sky-600 shrink-0" />
                  <div>
                    <div className="font-semibold text-slate-900 text-[11px]">Zero Key Custody</div>
                    <div className="text-[10px] text-slate-500">Secret keys never leave client</div>
                  </div>
                </div>

                <div className="p-2.5 rounded bg-white border border-slate-200 flex items-center space-x-2 text-xs">
                  <Activity className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <div className="font-semibold text-slate-900 text-[11px]">Daphne ASGI Pub/Sub</div>
                    <div className="text-[10px] text-slate-500">Real-time WebSocket telemetry</div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Numerical Rigor Stats Banner */}
      <section className="bg-slate-900 text-white border-b border-slate-800 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((s, idx) => (
              <div key={idx} className="border-l border-slate-700/80 pl-4 space-y-1">
                <div className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-white">{s.value}</div>
                <div className="text-xs font-mono uppercase text-sky-400 font-semibold">{s.label}</div>
                <div className="text-[11px] text-slate-400">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 01: Engineering Architecture */}
      <section id="architecture" className="py-20 border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12 space-y-2">
            <div className="text-xs font-mono text-sky-600 uppercase tracking-wider font-semibold">01. SYSTEM ARCHITECTURE</div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Orthogonal separation of cryptographic computation and governance.
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Cipher Analytics enforces a rigorous isolation boundary between data storage, computation workers, and analytical consumers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Component 1 */}
            <div className="p-6 rounded border border-slate-200 bg-slate-50/50 space-y-3">
              <div className="w-9 h-9 rounded bg-slate-900 text-white flex items-center justify-center font-mono text-xs font-bold">
                01
              </div>
              <h3 className="text-sm font-bold text-slate-900 font-mono uppercase">Client-Side TenSEAL Keygen</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Data owners generate public encryption context and Galois keys locally. The private evaluation key remains exclusively in local storage or client hardware.
              </p>
              <div className="pt-2 border-t border-slate-200 text-[11px] font-mono text-slate-500">
                OUTPUT: Context.bin (Serialized)
              </div>
            </div>

            {/* Component 2 */}
            <div className="p-6 rounded border border-slate-200 bg-slate-50/50 space-y-3">
              <div className="w-9 h-9 rounded bg-sky-600 text-white flex items-center justify-center font-mono text-xs font-bold">
                02
              </div>
              <h3 className="text-sm font-bold text-slate-900 font-mono uppercase">Partitioned Celery Enclave</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Asynchronous worker queues (<code className="text-sky-700 bg-sky-50 px-1 py-0.5 rounded font-mono text-[10px]">queue_fhe</code> and <code className="text-sky-700 bg-sky-50 px-1 py-0.5 rounded font-mono text-[10px]">queue_ml</code>) compute SIMD vector additions and multiplications directly over ciphertext objects.
              </p>
              <div className="pt-2 border-t border-slate-200 text-[11px] font-mono text-slate-500">
                WORKERS: Isolated Docker Containers
              </div>
            </div>

            {/* Component 3 */}
            <div className="p-6 rounded border border-slate-200 bg-slate-50/50 space-y-3">
              <div className="w-9 h-9 rounded bg-slate-900 text-white flex items-center justify-center font-mono text-xs font-bold">
                03
              </div>
              <h3 className="text-sm font-bold text-slate-900 font-mono uppercase">Decryption & Consent Grant</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Researchers receive the encrypted analytical vector result. The final decryption requires verification against the time-bounded consent ledger and differential privacy noise budget.
              </p>
              <div className="pt-2 border-t border-slate-200 text-[11px] font-mono text-slate-500">
                AUDIT: Immutable PostgreSQL Log
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 02: FHE Mathematical Operations */}
      <section id="computation" className="py-20 border-b border-slate-200 bg-slate-50/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12 space-y-2">
            <div className="text-xs font-mono text-sky-600 uppercase tracking-wider font-semibold">02. HOMOMORPHIC COMPUTATION KERNEL</div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Verified analytical operations executed without plaintext materialization.
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Every operation is budgeted against the cryptographic noise floor using depth-managed polynomial rings.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {computeOperations.map((op) => (
              <div 
                key={op.id}
                className="p-5 rounded bg-white border border-slate-200 hover:border-slate-300 transition-all space-y-2 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-slate-900">{op.name}</span>
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {op.status}
                  </span>
                </div>
                <div className="text-xs text-slate-600 leading-relaxed">
                  {op.description}
                </div>
                <div className="pt-2 flex items-center justify-between text-[11px] font-mono text-slate-500">
                  <span>COMPLEXITY: {op.complexity}</span>
                  <span className="text-sky-600">SIMD ENABLED</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 03: Zero-Trust Governance */}
      <section id="governance" className="py-20 border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-5 space-y-5">
              <div className="text-xs font-mono text-sky-600 uppercase tracking-wider font-semibold">03. ZERO-TRUST GOVERNANCE</div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                Cryptographic guarantees paired with granular policy governance.
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                FHE protects data during in-transit processing, while Cipher Analytics enforces multi-tier access controls before queries can be submitted to worker pools.
              </p>

              <div className="space-y-3 font-mono text-xs">
                <div className="p-3 rounded border border-slate-200 bg-slate-50 space-y-1">
                  <div className="font-bold text-slate-900">STRICT POLICY</div>
                  <div className="text-slate-500 text-[11px]">Explicit approval per researcher inquiry. Time-bounded token verification.</div>
                </div>

                <div className="p-3 rounded border border-slate-200 bg-slate-50 space-y-1">
                  <div className="font-bold text-slate-900">AGGREGATED POLICY</div>
                  <div className="text-slate-500 text-[11px]">Automatic execution permitted only for aggregate statistics with k-anonymity (n ≥ 5).</div>
                </div>

                <div className="p-3 rounded border border-slate-200 bg-slate-50 space-y-1">
                  <div className="font-bold text-slate-900">WHITELIST POLICY</div>
                  <div className="text-slate-500 text-[11px]">Pre-authorized institutional research teams with verifiable cryptographic credentials.</div>
                </div>
              </div>
            </div>

            {/* Interactive Policy Preview Terminal */}
            <div className="lg:col-span-7">
              <div className="p-6 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 font-mono text-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="text-sky-400 font-semibold">// ACCESS POLICY EVALUATION ENGINE</span>
                  <span className="text-[10px] text-slate-500">POLICY_ENGINE_V2</span>
                </div>

                <pre className="text-[11px] leading-relaxed text-slate-300 overflow-x-auto">
{`{
  "dataset_id": "4b92-clinical-genomics",
  "requested_operation": "HOMOMORPHIC_PEARSON_CORR",
  "security_mode": "STRICT",
  "caller": {
    "identity": "researcher@institute.org",
    "role": "RESEARCHER",
    "mfa_verified": true
  },
  "guardrails": {
    "k_anonymity": { "threshold": 5, "actual": 128, "status": "APPROVED" },
    "noise_budget_consumed": "0.14 / 1.00 epsilon",
    "differential_privacy": "LAPLACIAN_APPLIED"
  },
  "grant_decision": "PERMIT_WITH_IMMUTABLE_LOG"
}`}
                </pre>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                  <span>SECURITY AUDIT: EVENT_HASH #8c02a</span>
                  <span className="text-emerald-400">STATUS: AUTHORIZED</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Footer / CTA Section */}
      <footer id="telemetry" className="bg-[#0b0f19] text-slate-300 py-16 border-t border-slate-800 font-mono">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-12 border-b border-slate-800">
            <div className="space-y-1">
              <span className="text-lg font-bold text-white tracking-tight">Cipher Analytics Platform</span>
              <p className="text-xs text-slate-400">
                Secure Homomorphic Analytics • High-Dimensional Data Governance
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/register"
                className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded transition-colors"
              >
                Register Data Owner
              </Link>
              <Link
                to="/login"
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white text-xs font-semibold rounded transition-colors"
              >
                Sign In to Console
              </Link>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
            <div>
              &copy; {new Date().getFullYear()} Cipher Analytics • All rights reserved.
            </div>
            <div className="flex items-center space-x-6">
              <span>TENALGORITHM: CKKS-RLWE</span>
              <span>DAPHNE: ASGI-ENABLED</span>
              <span>POSTGRES: MULTI-TENANT</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
