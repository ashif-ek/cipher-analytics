import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Cpu, 
  Lock, 
  Database, 
  ArrowRight, 
  CheckCircle2, 
  Layers, 
  Activity, 
  Server, 
  FileCode, 
  Workflow, 
  BarChart3,
  Key,
  Binary,
  GitBranch,
  ShieldAlert,
  Sliders,
  Scale
} from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen bg-[#fafbfc] text-slate-900 font-sans selection:bg-slate-900 selection:text-white antialiased">
      
      {/* 1. Global Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded bg-slate-900 text-white flex items-center justify-center font-mono font-bold text-sm shadow-sm">
                C
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold tracking-tight text-slate-900 font-mono">CIPHER ANALYTICS</span>
                <span className="text-[9px] font-mono tracking-widest text-slate-500 uppercase -mt-0.5">Homomorphic Privacy Enclave</span>
              </div>
            </Link>

            <nav className="hidden md:flex items-center space-x-6 text-xs font-mono text-slate-600">
              <a href="#core-problem" className="hover:text-slate-900 transition-colors">01. Problem</a>
              <a href="#fhe-mechanics" className="hover:text-slate-900 transition-colors">02. FHE Core</a>
              <a href="#operations" className="hover:text-slate-900 transition-colors">03. Analytical Operations</a>
              <a href="#architecture" className="hover:text-slate-900 transition-colors">04. Architecture</a>
              <a href="#governance" className="hover:text-slate-900 transition-colors">05. Zero-Trust</a>
              <a href="#applications" className="hover:text-slate-900 transition-colors">06. Applications</a>
            </nav>
          </div>

          <div className="flex items-center space-x-3">
            <Link 
              to="/login"
              className="text-xs font-mono px-3.5 py-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
            >
              Log in
            </Link>
            <Link 
              to="/register"
              className="text-xs font-mono px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded transition-colors shadow-sm font-medium"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Hero Section: Core Value Proposition */}
      <section className="py-20 lg:py-24 border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded bg-slate-100 border border-slate-200 text-slate-700 font-mono text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-900"></span>
              <span>ENGINEERING SPECIFICATION • PRODUCTION PLATFORM</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-950 leading-[1.12]">
              Analytics executed over encrypted data. Plaintext never materialized.
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl font-normal">
              Cipher Analytics enables institutions to compute statistical distributions, linear correlations, and anomaly scores across confidential records without ever decrypting underlying data in memory or on disk.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                to="/register"
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-mono font-medium rounded transition-colors shadow-sm flex items-center space-x-2"
              >
                <span>Initialize Research Enclave</span>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </Link>

              <Link
                to="/login"
                className="px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 text-xs font-mono font-medium rounded transition-colors"
              >
                Sign In to Console
              </Link>
            </div>
          </div>

          {/* Core Technical Metric Band */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-16 mt-16 border-t border-slate-200">
            <div>
              <div className="text-xs font-mono uppercase text-slate-500 font-semibold">Cryptographic Scheme</div>
              <div className="text-lg font-bold font-mono text-slate-900 mt-1">CKKS (RLWE)</div>
              <p className="text-xs text-slate-500 mt-0.5">Cheon-Kim-Kim-Song fixed-point arithmetic</p>
            </div>

            <div>
              <div className="text-xs font-mono uppercase text-slate-500 font-semibold">Polynomial Modulus</div>
              <div className="text-lg font-bold font-mono text-slate-900 mt-1">N = 8,192</div>
              <p className="text-xs text-slate-500 mt-0.5">240-bit coefficient modulus chain</p>
            </div>

            <div>
              <div className="text-xs font-mono uppercase text-slate-500 font-semibold">SIMD Vector Slots</div>
              <div className="text-lg font-bold font-mono text-slate-900 mt-1">4,096 Values</div>
              <p className="text-xs text-slate-500 mt-0.5">Packed parallel floating-point evaluation</p>
            </div>

            <div>
              <div className="text-xs font-mono uppercase text-slate-500 font-semibold">Key Custody Model</div>
              <div className="text-lg font-bold font-mono text-slate-900 mt-1">Client-Isolated</div>
              <p className="text-xs text-slate-500 mt-0.5">Private keys never enter worker infrastructure</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. The Core Problem: The Plaintext Dilemma */}
      <section id="core-problem" className="py-20 border-b border-slate-200 bg-slate-50/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-5 space-y-4">
              <div className="text-xs font-mono text-slate-500 uppercase tracking-wider font-semibold">01. THE COMPUTATION PARADOX</div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 leading-snug">
                Traditional data pipelines require decrypting data to analyze it.
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Standard TLS protects data in transit, and AES-256 protects data at rest. However, the moment an analytical algorithm or query runs, ciphertext must be decrypted into plaintext memory. This creates a catastrophic attack vector in multi-tenant cloud environments and cross-institutional research.
              </p>
            </div>

            <div className="lg:col-span-7">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-6 bg-white border border-slate-200 rounded-lg space-y-2">
                  <div className="text-xs font-mono uppercase font-bold text-red-600">Conventional Approach</div>
                  <h3 className="text-sm font-bold text-slate-900">Decryption in RAM</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Servers must hold the decryption key. A single hypervisor breach, memory dump, or malicious administrator exposes every raw patient or financial record.
                  </p>
                </div>

                <div className="p-6 bg-white border border-slate-200 rounded-lg space-y-2">
                  <div className="text-xs font-mono uppercase font-bold text-slate-900">Cipher Analytics Approach</div>
                  <h3 className="text-sm font-bold text-slate-900">Encrypted In-Memory Execution</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Compute nodes manipulate encrypted polynomial structures. Memory dumps contain only high-entropy pseudorandom ring elements with zero information leakage.
                  </p>
                </div>

                <div className="p-6 bg-white border border-slate-200 rounded-lg space-y-2">
                  <div className="text-xs font-mono uppercase font-bold text-red-600">Conventional Approach</div>
                  <h3 className="text-sm font-bold text-slate-900">Coarse Access Grants</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Organizations must either share raw databases with external analysts or manually synthesize degraded, lossy extracts.
                  </p>
                </div>

                <div className="p-6 bg-white border border-slate-200 rounded-lg space-y-2">
                  <div className="text-xs font-mono uppercase font-bold text-slate-900">Cipher Analytics Approach</div>
                  <h3 className="text-sm font-bold text-slate-900">Granular Zero-Trust Verification</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Rigorous mathematical boundaries: k-anonymity (n &ge; 5) guards, sliding-window query limits, and differential privacy noise controls.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Plaintext-to-Ciphertext-to-Computation Lifecycle Diagram */}
      <section id="fhe-mechanics" className="py-20 border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12 space-y-2">
            <div className="text-xs font-mono text-slate-500 uppercase tracking-wider font-semibold">02. CRYPTOGRAPHIC LIFECYCLE</div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Plaintext to Ciphertext to Encrypted Result: The 4-Stage Lifecycle
            </h2>
            <p className="text-sm text-slate-600">
              How Cipher Analytics executes verifiable mathematical computations without data exposure.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Step 1 */}
            <div className="p-5 border border-slate-200 rounded-lg bg-slate-50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-slate-400">STAGE 01</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700">CLIENT</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900">SIMD Vector Encoding</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Raw real-valued floating-point vectors are packed into complex polynomial slots using the canonical CKKS embedding map:
              </p>
              <div className="p-2.5 rounded bg-white border border-slate-200 font-mono text-[11px] text-slate-800">
                m &isin; &real;<sup>4096</sup> &rarr; m(X) &isin; &Zopf;[X]/(X<sup>8192</sup> + 1)
              </div>
              <div className="text-[11px] text-slate-500">
                Data scaled by factor &Delta; = 2<sup>40</sup> to preserve precision.
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-5 border border-slate-200 rounded-lg bg-slate-50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-slate-400">STAGE 02</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700">CLIENT</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900">RLWE Encryption</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Plaintext polynomials are masked with Ring Learning With Errors secrets. Public evaluation keys are generated; secret key remains strictly client-side:
              </p>
              <div className="p-2.5 rounded bg-white border border-slate-200 font-mono text-[11px] text-slate-800">
                c = (c<sub>0</sub>, c<sub>1</sub>) &isin; R<sub>q</sub> &times; R<sub>q</sub>
              </div>
              <div className="text-[11px] text-slate-500">
                TenSEAL context serialized with Galois evaluation keys.
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-5 border border-slate-200 rounded-lg bg-slate-50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-slate-400">STAGE 03</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-white">ENCLAVE</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900">Homomorphic Execution</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Celery workers perform polynomial additions, scalar products, cyclic rotations, and scale relinearization without decrypting:
              </p>
              <div className="p-2.5 rounded bg-white border border-slate-200 font-mono text-[11px] text-slate-800">
                c<sub>res</sub> = c<sub>1</sub> &oplus; c<sub>2</sub>, &nbsp; c<sub>prod</sub> = c<sub>1</sub> &otimes; c<sub>2</sub>
              </div>
              <div className="text-[11px] text-slate-500">
                Rescaling: &Delta;<sup>2</sup> &rarr; &Delta; via modulus switching.
              </div>
            </div>

            {/* Step 4 */}
            <div className="p-5 border border-slate-200 rounded-lg bg-slate-50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-slate-400">STAGE 04</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700">CLIENT</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900">Authorized Decryption</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                The resulting ciphertext scalar or vector is returned to the authorized caller who applies their local private key:
              </p>
              <div className="p-2.5 rounded bg-white border border-slate-200 font-mono text-[11px] text-slate-800">
                Dec(c<sub>res</sub>, s) &asymp; m<sub>1</sub> + m<sub>2</sub> + e
              </div>
              <div className="text-[11px] text-slate-500">
                Absolute error bounded by noise floor: ||e|| &lt; 2<sup>-32</sup>.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Supported Analytical Operations */}
      <section id="operations" className="py-20 border-b border-slate-200 bg-slate-50/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12 space-y-2">
            <div className="text-xs font-mono text-slate-500 uppercase tracking-wider font-semibold">03. IMPLEMENTED ANALYTICAL CAPABILITIES</div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Verified Mathematical Operations in Current Production
            </h2>
            <p className="text-sm text-slate-600">
              These algorithms are actively implemented in the TenSEAL execution engine and scheduled across Celery worker queues.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Op 1: Homomorphic Vector Sum */}
            <div className="p-6 bg-white border border-slate-200 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 font-mono">1. Homomorphic Vector Sum</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                  PRODUCTION
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Calculates the total aggregate of all SIMD slots in an encrypted vector using binary Galois automorphism rotations and vector-vector ciphertext additions.
              </p>
              <div className="p-3 bg-slate-50 rounded border border-slate-200 font-mono text-xs space-y-1">
                <div className="text-slate-500 text-[10px]">MATHEMATICAL FORMULA:</div>
                <div className="text-slate-900 font-semibold">E(&sum; x<sub>i</sub>) = &sum;<sub>i=1</sub><sup>n</sup> Enc(x<sub>i</sub>)</div>
                <div className="text-[11px] text-slate-500">Complexity: O(log<sub>2</sub> n) cyclic Galois rotations</div>
              </div>
            </div>

            {/* Op 2: Mean & Second-Order Moments */}
            <div className="p-6 bg-white border border-slate-200 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 font-mono">2. Central Moments & Variance</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                  PRODUCTION
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Evaluates distribution statistics over ciphertext tensors by combining homomorphic sum, scalar multiplication by 1/n, and quadratic deviation estimation.
              </p>
              <div className="p-3 bg-slate-50 rounded border border-slate-200 font-mono text-xs space-y-1">
                <div className="text-slate-500 text-[10px]">MATHEMATICAL FORMULA:</div>
                <div className="text-slate-900 font-semibold">E(&mu;) = (1/n) &middot; E(&sum; x<sub>i</sub>), &nbsp; E(&sigma;<sup>2</sup>) = E(x<sup>2</sup>) - &mu;<sup>2</sup></div>
                <div className="text-[11px] text-slate-500">Requires 1 ciphertext-ciphertext multiplication and rescaling</div>
              </div>
            </div>

            {/* Op 3: Pearson Correlation */}
            <div className="p-6 bg-white border border-slate-200 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 font-mono">3. Multi-Variate Pearson Correlation</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                  PRODUCTION
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Determines the linear statistical dependency between two encrypted feature vectors X and Y without revealing individual observations to the coordinator.
              </p>
              <div className="p-3 bg-slate-50 rounded border border-slate-200 font-mono text-xs space-y-1">
                <div className="text-slate-500 text-[10px]">MATHEMATICAL FORMULA:</div>
                <div className="text-slate-900 font-semibold">Cov(X, Y) = E(X &middot; Y) - E(X) &middot; E(Y)</div>
                <div className="text-[11px] text-slate-500">Evaluates cross-feature interaction in encrypted domain</div>
              </div>
            </div>

            {/* Op 4: Isolation Forest Anomaly Detection */}
            <div className="p-6 bg-white border border-slate-200 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 font-mono">4. Anomaly Isolation Forest</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                  PRODUCTION
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Generates polynomial-depth isolation trees over multi-dimensional feature records to compute outlier path lengths under encrypted bounds.
              </p>
              <div className="p-3 bg-slate-50 rounded border border-slate-200 font-mono text-xs space-y-1">
                <div className="text-slate-500 text-[10px]">MATHEMATICAL FORMULA:</div>
                <div className="text-slate-900 font-semibold">s(x, n) = 2<sup>-E(h(x)) / c(n)</sup> &rarr; Polynomial fit</div>
                <div className="text-[11px] text-slate-500">Evaluated in Celery queue_ml worker partition</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Technical Architecture & Technology Stack */}
      <section id="architecture" className="py-20 border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12 space-y-2">
            <div className="text-xs font-mono text-slate-500 uppercase tracking-wider font-semibold">04. SYSTEM ARCHITECTURE & TECH STACK</div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Production Architecture Built for Hardware Isolation
            </h2>
            <p className="text-sm text-slate-600">
              Every layer of the stack is chosen to isolate CPU-intensive cryptographic execution from web presentation and database storage.
            </p>
          </div>

          {/* Architecture Layer Breakdown */}
          <div className="space-y-4">
            {/* Layer 1: Frontend Client */}
            <div className="p-5 border border-slate-200 rounded-lg bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1 md:max-w-xl">
                <div className="text-xs font-mono font-bold text-slate-500 uppercase">LAYER 01 &bull; CLIENT WORKSPACE</div>
                <h3 className="text-sm font-bold text-slate-900">React 18 &bull; Vite &bull; Tailwind CSS &bull; WebSockets</h3>
                <p className="text-xs text-slate-600">
                  Single-page client application with interactive dataset catalog, real-time WebSocket telemetry via Daphne ASGI channels, and differential privacy sliders.
                </p>
              </div>
              <div className="text-xs font-mono px-3 py-1.5 rounded bg-white border border-slate-200 text-slate-700 shrink-0">
                BROWSER ENGINE
              </div>
            </div>

            {/* Layer 2: API Gateway & Coordination */}
            <div className="p-5 border border-slate-200 rounded-lg bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1 md:max-w-xl">
                <div className="text-xs font-mono font-bold text-slate-500 uppercase">LAYER 02 &bull; API &amp; COORDINATION</div>
                <h3 className="text-sm font-bold text-slate-900">Django 5 &bull; Django REST Framework &bull; Daphne (ASGI)</h3>
                <p className="text-xs text-slate-600">
                  Handles JWT authentication, role-based access governance, schema validation, rate-limiting, and WebSocket connection multiplexing.
                </p>
              </div>
              <div className="text-xs font-mono px-3 py-1.5 rounded bg-white border border-slate-200 text-slate-700 shrink-0">
                ASGI ORCHESTRATION
              </div>
            </div>

            {/* Layer 3: Celery Computation Enclave */}
            <div className="p-5 border border-slate-200 rounded-lg bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1 md:max-w-xl">
                <div className="text-xs font-mono font-bold text-slate-500 uppercase">LAYER 03 &bull; FHE COMPUTATION WORKERS</div>
                <h3 className="text-sm font-bold text-slate-900">Celery Distributed Workers &bull; Redis 7 Broker &bull; TenSEAL C++ Core</h3>
                <p className="text-xs text-slate-600">
                  Hardware-isolated worker queues: <code className="bg-slate-200 px-1 py-0.5 rounded text-[11px]">queue_fhe</code> for arithmetic polynomial evaluations and <code className="bg-slate-200 px-1 py-0.5 rounded text-[11px]">queue_ml</code> for tree algorithms.
                </p>
              </div>
              <div className="text-xs font-mono px-3 py-1.5 rounded bg-white border border-slate-200 text-slate-700 shrink-0">
                CONTAINER ENCLAVES
              </div>
            </div>

            {/* Layer 4: Storage & Ledger */}
            <div className="p-5 border border-slate-200 rounded-lg bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1 md:max-w-xl">
                <div className="text-xs font-mono font-bold text-slate-500 uppercase">LAYER 04 &bull; PERSISTENCE &amp; AUDIT LEDGER</div>
                <h3 className="text-sm font-bold text-slate-900">PostgreSQL 16 &bull; Multi-Tenant Schemas &bull; Immutable Audit Logs</h3>
                <p className="text-xs text-slate-600">
                  Stores serialized encrypted context payloads, dataset metadata, and tamper-evident query verification hashes. Never stores unencrypted numerical values.
                </p>
              </div>
              <div className="text-xs font-mono px-3 py-1.5 rounded bg-white border border-slate-200 text-slate-700 shrink-0">
                ZERO-PLAINTEXT DB
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Zero-Trust Access Governance */}
      <section id="governance" className="py-20 border-b border-slate-200 bg-slate-50/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12 space-y-2">
            <div className="text-xs font-mono text-slate-500 uppercase tracking-wider font-semibold">05. ZERO-TRUST GOVERNANCE</div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Orthogonal Policy Enforcement Before Enclave Dispatch
            </h2>
            <p className="text-sm text-slate-600">
              Homomorphic encryption protects in-memory execution; multi-tier access policy ensures queries cannot be submitted without verifiable authorization.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-white border border-slate-200 rounded-lg space-y-3">
              <div className="text-xs font-mono font-bold text-slate-900 uppercase">POLICY TIER 01</div>
              <h3 className="text-sm font-bold text-slate-900">STRICT Consent</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Requires the Data Owner to explicitly review and grant each researcher inquiry. Grants are bound to a specific dataset ID and an expiring session token.
              </p>
              <div className="text-[11px] font-mono text-slate-500 pt-2 border-t border-slate-100">
                Use Case: Sensitive Clinical &amp; Genomic Trials
              </div>
            </div>

            <div className="p-6 bg-white border border-slate-200 rounded-lg space-y-3">
              <div className="text-xs font-mono font-bold text-slate-900 uppercase">POLICY TIER 02</div>
              <h3 className="text-sm font-bold text-slate-900">AGGREGATED Privacy</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Permits automatic execution of statistical queries provided the cohort size passes the k-anonymity gate (n &ge; 5) and privacy budget (&epsilon;) is not exhausted.
              </p>
              <div className="text-[11px] font-mono text-slate-500 pt-2 border-t border-slate-100">
                Use Case: Cross-Bank Fraud &amp; Financial Risk
              </div>
            </div>

            <div className="p-6 bg-white border border-slate-200 rounded-lg space-y-3">
              <div className="text-xs font-mono font-bold text-slate-900 uppercase">POLICY TIER 03</div>
              <h3 className="text-sm font-bold text-slate-900">WHITELIST Pre-Authorization</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Grants instant evaluation capability to authenticated researchers from verified partner institutions with contractual data agreements.
              </p>
              <div className="text-[11px] font-mono text-slate-500 pt-2 border-t border-slate-100">
                Use Case: Collaborative Academic Consortia
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Practical Applications & Industry Use Cases */}
      <section id="applications" className="py-20 border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12 space-y-2">
            <div className="text-xs font-mono text-slate-500 uppercase tracking-wider font-semibold">06. PRACTICAL APPLICATIONS</div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Where Encrypted Computation Solves Real Industry Deadlocks
            </h2>
            <p className="text-sm text-slate-600">
              Enabling multi-party statistical insights where legal and competitive barriers previously prevented any data sharing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 border border-slate-200 rounded-lg bg-slate-50 space-y-2">
              <div className="text-xs font-mono text-slate-500 font-semibold uppercase">Healthcare &amp; Genomics</div>
              <h3 className="text-base font-bold text-slate-900">Cross-Hospital Cohort Biomarker Discovery</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Hospitals cannot pool patient oncological phenotypes due to HIPAA and GDPR restrictions. With Cipher Analytics, research universities compute correlation matrices and genomic regressions across encrypted patient vectors without raw health record exposure.
              </p>
            </div>

            <div className="p-6 border border-slate-200 rounded-lg bg-slate-50 space-y-2">
              <div className="text-xs font-mono text-slate-500 font-semibold uppercase">Financial Networks</div>
              <h3 className="text-base font-bold text-slate-900">Anti-Money Laundering &amp; Syndicated Fraud Detection</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Competing financial institutions are legally barred from sharing customer transaction histories. Cipher Analytics allows banks to compute federated anomaly scores and correlation indices over encrypted financial tensors, detecting cross-institution laundering networks.
              </p>
            </div>

            <div className="p-6 border border-slate-200 rounded-lg bg-slate-50 space-y-2">
              <div className="text-xs font-mono text-slate-500 font-semibold uppercase">Public Sector &amp; Defense</div>
              <h3 className="text-base font-bold text-slate-900">Multi-Agency Threat Intelligence Pooling</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Jurisdictional data silos prevent joint operations between municipal, federal, and international agencies. Encrypted vector addition allows joint telemetry analysis without compromising sensitive investigative sources.
              </p>
            </div>

            <div className="p-6 border border-slate-200 rounded-lg bg-slate-50 space-y-2">
              <div className="text-xs font-mono text-slate-500 font-semibold uppercase">Commercial Supply Chain</div>
              <h3 className="text-base font-bold text-slate-900">Supplier Yield Optimization Without Margin Disclosure</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Manufacturers and third-party vendors can compute aggregate defect rates and lead-time distributions across their supply base without any participant revealing proprietary production margins or shipment volumes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 9. Technical Considerations & Cryptographic Realities */}
      <section className="py-20 border-b border-slate-200 bg-slate-50/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-8 space-y-2">
            <div className="text-xs font-mono text-slate-500 uppercase tracking-wider font-semibold">07. TECHNICAL REALITIES &amp; BOUNDARIES</div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Engineering Transparency: Limitations of FHE
            </h2>
            <p className="text-sm text-slate-600">
              Fully Homomorphic Encryption provides absolute mathematical confidentiality, but comes with specific engineering trade-offs that Cipher Analytics addresses.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-5 bg-white border border-slate-200 rounded-lg space-y-2">
              <div className="text-xs font-mono font-bold text-slate-900">Computational Overhead</div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Homomorphic operations require 10&times; to 100&times; more CPU cycles than plaintext evaluation. We mitigate this through hardware-partitioned Celery worker queues and AVX2-optimized C++ TenSEAL kernels.
              </p>
            </div>

            <div className="p-5 bg-white border border-slate-200 rounded-lg space-y-2">
              <div className="text-xs font-mono font-bold text-slate-900">Polynomial Depth Budget</div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Each ciphertext multiplication consumes a level in the modulus chain. Cipher Analytics implements automated scale relinearization and modulus switching to manage noise accumulation.
              </p>
            </div>

            <div className="p-5 bg-white border border-slate-200 rounded-lg space-y-2">
              <div className="text-xs font-mono font-bold text-slate-900">Non-Linear Operations</div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Exact comparisons and non-linear step functions cannot be evaluated directly in CKKS. Algorithms such as Anomaly Isolation Forests are formulated using Chebyshev polynomial approximations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 10. Call to Action Section */}
      <section className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-10 lg:p-14 rounded-xl border border-slate-300 bg-slate-950 text-white space-y-6">
            <div className="max-w-2xl space-y-3">
              <div className="text-xs font-mono text-slate-400 uppercase tracking-wider font-semibold">
                SYSTEM DEPLOYMENT
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
                Ready to deploy zero-trust computation?
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Create an account as a Data Owner to ingest and encrypt datasets, or as a Researcher to request analytical computation grants.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to="/register"
                className="px-6 py-3 bg-white hover:bg-slate-100 text-slate-950 text-xs font-mono font-bold rounded transition-colors shadow-sm"
              >
                Create Data Owner Account
              </Link>
              <Link
                to="/login"
                className="px-6 py-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white text-xs font-mono font-bold rounded transition-colors"
              >
                Sign In to Console
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 11. Professional Enterprise Footer */}
      <footer className="bg-white text-slate-600 py-12 border-t border-slate-200 font-mono text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-200">
            <div className="space-y-3 md:col-span-1">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                  C
                </div>
                <span className="font-bold text-slate-900 tracking-tight text-sm">CIPHER ANALYTICS</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed font-sans">
                Privacy-preserving analytics platform utilizing Fully Homomorphic Encryption (FHE) and zero-trust data governance.
              </p>
            </div>

            <div>
              <div className="font-bold text-slate-900 uppercase text-[11px] mb-3">Core Platform</div>
              <ul className="space-y-2 text-[11px] text-slate-500">
                <li><Link to="/login" className="hover:text-slate-900">Research Console</Link></li>
                <li><Link to="/login" className="hover:text-slate-900">Dataset Registry</Link></li>
                <li><Link to="/login" className="hover:text-slate-900">Analytical Briefs</Link></li>
                <li><Link to="/login" className="hover:text-slate-900">Audit Ledger</Link></li>
              </ul>
            </div>

            <div>
              <div className="font-bold text-slate-900 uppercase text-[11px] mb-3">Cryptographic Engine</div>
              <ul className="space-y-2 text-[11px] text-slate-500">
                <li>Scheme: CKKS-RLWE-8192</li>
                <li>Slots: 4,096 Vector Batch</li>
                <li>Precision: &Delta; = 2<sup>40</sup></li>
                <li>Task Topology: Celery Partition</li>
              </ul>
            </div>

            <div>
              <div className="font-bold text-slate-900 uppercase text-[11px] mb-3">Access &amp; Compliance</div>
              <ul className="space-y-2 text-[11px] text-slate-500">
                <li>FIPS 140-3 Cryptographic Standards</li>
                <li>Zero-Knowledge Client Keygen</li>
                <li>k-Anonymity Defense (n &ge; 5)</li>
                <li><Link to="/register" className="hover:text-slate-900">Register New Organization</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-4">
            <div>
              &copy; {new Date().getFullYear()} Cipher Analytics Inc. All rights reserved.
            </div>
            <div className="flex items-center space-x-6">
              <span>SECURITY: FHE VERIFIED</span>
              <span>TRANSPORT: TLS 1.3</span>
              <span>STATE: STABLE</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Landing;
