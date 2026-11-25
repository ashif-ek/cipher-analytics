import React from 'react';
import { Link } from 'react-router-dom';
import EnclaveDiagram from '../components/landing/EnclaveDiagram';
import { 
  ArrowRight, 
  ShieldCheck, 
  Cpu, 
  Lock, 
  Database, 
  Activity, 
  Network,
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
              <div className="w-8 h-8 rounded bg-slate-900 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                C
              </div>
              <div className="flex flex-col">
                <span className="text-base font-semibold tracking-tight text-slate-900">Cipher Analytics</span>
                <span className="text-[11px] text-slate-500 font-normal">Privacy-Preserving Computation</span>
              </div>
            </Link>

            <nav className="hidden md:flex items-center space-x-6 text-xs text-slate-600 font-medium">
              <a href="#core-problem" className="hover:text-slate-900 transition-colors">Overview</a>
              <a href="#how-it-works" className="hover:text-slate-900 transition-colors">How It Works</a>
              <a href="#capabilities" className="hover:text-slate-900 transition-colors">Capabilities</a>
              <a href="#architecture" className="hover:text-slate-900 transition-colors">Architecture</a>
              <a href="#governance" className="hover:text-slate-900 transition-colors">Governance</a>
              <a href="#applications" className="hover:text-slate-900 transition-colors">Applications</a>
            </nav>
          </div>

          <div className="flex items-center space-x-3">
            <Link 
              to="/login"
              className="text-xs px-3.5 py-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors font-medium"
            >
              Sign in
            </Link>
            <Link 
              to="/register"
              className="text-xs px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-md transition-colors shadow-xs font-medium"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Hero Section: Core Value Proposition */}
      <section className="py-16 lg:py-20 border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Narrative Column */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-900"></span>
                <span>Privacy-Preserving Enterprise Analytics</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-950 leading-[1.15]">
                Analytics executed over encrypted data. Plaintext never exposed.
              </h1>

              <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl font-normal">
                Cipher Analytics enables institutions to compute statistical distributions, linear correlations, and anomaly models across confidential records without ever decrypting underlying data on the server.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  to="/register"
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-md transition-colors shadow-xs flex items-center space-x-2"
                >
                  <span>Get started</span>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </Link>

                <Link
                  to="/login"
                  className="px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 text-xs font-medium rounded-md transition-colors"
                >
                  Sign in
                </Link>
              </div>
            </div>

            {/* Right Interactive Architecture Component */}
            <div className="lg:col-span-5">
              <EnclaveDiagram />
            </div>

          </div>

          {/* Metric Band */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-12 mt-12 border-t border-slate-200">
            <div>
              <div className="text-xs uppercase text-slate-500 font-semibold">Security Standard</div>
              <div className="text-lg font-bold text-slate-900 mt-1">Zero Key Custody</div>
              <p className="text-xs text-slate-500 mt-0.5">Private keys remain on client devices</p>
            </div>

            <div>
              <div className="text-xs uppercase text-slate-500 font-semibold">Compute Model</div>
              <div className="text-lg font-bold text-slate-900 mt-1">Homomorphic Execution</div>
              <p className="text-xs text-slate-500 mt-0.5">Calculations execute directly on ciphertexts</p>
            </div>

            <div>
              <div className="text-xs uppercase text-slate-500 font-semibold">Vector Capacity</div>
              <div className="text-lg font-bold text-slate-900 mt-1">Parallel SIMD Slots</div>
              <p className="text-xs text-slate-500 mt-0.5">Fast batch evaluation across encrypted features</p>
            </div>

            <div>
              <div className="text-xs uppercase text-slate-500 font-semibold">Privacy Defense</div>
              <div className="text-lg font-bold text-slate-900 mt-1">k-Anonymity Protection</div>
              <p className="text-xs text-slate-500 mt-0.5">Automated protection against inference attacks</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. The Core Problem */}
      <section id="core-problem" className="py-20 border-b border-slate-200 bg-slate-50/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-5 space-y-4">
              <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">The Privacy Challenge</div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 leading-snug">
                Traditional data pipelines require decrypting data to analyze it.
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Standard encryption protects data in transit and at rest. However, when an analytical query runs, data is typically decrypted into plaintext memory. This creates security exposure in shared cloud infrastructure and across institutional boundaries.
              </p>
            </div>

            <div className="lg:col-span-7">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-6 bg-white border border-slate-200 rounded-lg space-y-2">
                  <div className="text-xs uppercase font-bold text-rose-600">Conventional Approach</div>
                  <h3 className="text-sm font-bold text-slate-900">Decryption in RAM</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Servers must hold the decryption key. A single hypervisor breach, memory dump, or compromised credential exposes raw records.
                  </p>
                </div>

                <div className="p-6 bg-white border border-slate-200 rounded-lg space-y-2">
                  <div className="text-xs uppercase font-bold text-slate-900">Cipher Analytics</div>
                  <h3 className="text-sm font-bold text-slate-900">Encrypted Execution</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Servers only process encrypted structures. Even with root memory access, attackers cannot reconstruct the underlying plaintext numbers.
                  </p>
                </div>

                <div className="p-6 bg-white border border-slate-200 rounded-lg space-y-2">
                  <div className="text-xs uppercase font-bold text-rose-600">Conventional Approach</div>
                  <h3 className="text-sm font-bold text-slate-900">Broad Access Grants</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Organizations must either share raw databases with external analysts or manually synthesize lossy summary files.
                  </p>
                </div>

                <div className="p-6 bg-white border border-slate-200 rounded-lg space-y-2">
                  <div className="text-xs uppercase font-bold text-slate-900">Cipher Analytics</div>
                  <h3 className="text-sm font-bold text-slate-900">Verified Governance</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Granular zero-trust policies enforce minimum cohort size requirements and strict grant approvals before queries can execute.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. How It Works: The 4-Stage Lifecycle */}
      <section id="how-it-works" className="py-20 border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12 space-y-2">
            <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">How It Works</div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              The End-to-End Processing Lifecycle
            </h2>
            <p className="text-sm text-slate-600">
              How Cipher Analytics executes verified computations without ever handling plaintext on the server.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Step 1 */}
            <div className="p-5 border border-slate-200 rounded-lg bg-slate-50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">Step 01</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700">Client</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900">Vector Formatting</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Raw real-valued vectors are grouped and formatted client-side into structured slots, preserving analytical precision.
              </p>
              <div className="p-2.5 rounded bg-white border border-slate-200 text-xs text-slate-700">
                Data prepared locally before any network dispatch.
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-5 border border-slate-200 rounded-lg bg-slate-50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">Step 02</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700">Client</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900">Local Encryption</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Vectors are encrypted on the client workstation using local keys. The secret key stays strictly in the data owner's control.
              </p>
              <div className="p-2.5 rounded bg-white border border-slate-200 text-xs text-slate-700">
                Only public evaluation context is shared with workers.
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-5 border border-slate-200 rounded-lg bg-slate-50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">Step 03</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-white">Enclave</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900">Encrypted Execution</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Distributed workers evaluate additions, multiplications, and statistical aggregations directly over ciphertexts.
              </p>
              <div className="p-2.5 rounded bg-white border border-slate-200 text-xs text-slate-700">
                Operations execute with zero decryption in memory.
              </div>
            </div>

            {/* Step 4 */}
            <div className="p-5 border border-slate-200 rounded-lg bg-slate-50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">Step 04</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700">Client</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900">Authorized Decryption</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                The resulting ciphertext is returned to the authorized researcher, who decrypts the result locally using their private credentials.
              </p>
              <div className="p-2.5 rounded bg-white border border-slate-200 text-xs text-slate-700">
                Accurate answers delivered without privacy compromise.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Supported Analytical Operations */}
      <section id="capabilities" className="py-20 border-b border-slate-200 bg-slate-50/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12 space-y-2">
            <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Analytical Capabilities</div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Core Operations Supported on Encrypted Data
            </h2>
            <p className="text-sm text-slate-600">
              Run real-world statistical and machine learning queries directly over encrypted cohorts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Op 1: Homomorphic Vector Sum */}
            <div className="p-6 bg-white border border-slate-200 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900">1. Vector Sum &amp; Aggregation</h3>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                  Supported
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Calculates totals and aggregate counts across encrypted feature vectors while keeping individual observations completely confidential.
              </p>
              <div className="p-3 bg-slate-50 rounded border border-slate-200 text-xs space-y-1">
                <div className="text-slate-500 text-[11px] font-medium">Use Case:</div>
                <div className="text-slate-900">Federated metric aggregation across multiple regional datasets</div>
              </div>
            </div>

            {/* Op 2: Mean & Variance */}
            <div className="p-6 bg-white border border-slate-200 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900">2. Mean &amp; Variance Statistics</h3>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                  Supported
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Evaluates distribution statistics, standard deviations, and higher-order moments without revealing patient or customer data points.
              </p>
              <div className="p-3 bg-slate-50 rounded border border-slate-200 text-xs space-y-1">
                <div className="text-slate-500 text-[11px] font-medium">Use Case:</div>
                <div className="text-slate-900">Benchmarking patient biometric indicators across hospitals</div>
              </div>
            </div>

            {/* Op 3: Pearson Correlation */}
            <div className="p-6 bg-white border border-slate-200 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900">3. Multi-Variate Correlation</h3>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                  Supported
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Measures linear statistical dependencies between paired variables across institutions without either side exposing raw feature columns.
              </p>
              <div className="p-3 bg-slate-50 rounded border border-slate-200 text-xs space-y-1">
                <div className="text-slate-500 text-[11px] font-medium">Use Case:</div>
                <div className="text-slate-900">Cross-institutional genomic regression and clinical outcome studies</div>
              </div>
            </div>

            {/* Op 4: Isolation Forest Anomaly Detection */}
            <div className="p-6 bg-white border border-slate-200 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900">4. Anomaly Detection (Isolation Forest)</h3>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                  Supported
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Identifies outliers and suspicious transaction patterns across multi-dimensional feature records while maintaining data confidentiality.
              </p>
              <div className="p-3 bg-slate-50 rounded border border-slate-200 text-xs space-y-1">
                <div className="text-slate-500 text-[11px] font-medium">Use Case:</div>
                <div className="text-slate-900">Syndicated fraud detection across consortium financial networks</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Technical Architecture */}
      <section id="architecture" className="py-20 border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12 space-y-2">
            <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">System Architecture</div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Engineered for Isolation and High Availability
            </h2>
            <p className="text-sm text-slate-600">
              A decoupled architecture separating presentation, orchestration, and compute workloads.
            </p>
          </div>

          <div className="space-y-4">
            {/* Layer 1 */}
            <div className="p-5 border border-slate-200 rounded-lg bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1 md:max-w-xl">
                <div className="text-xs font-semibold text-slate-500 uppercase">Layer 01 &bull; Client Console</div>
                <h3 className="text-sm font-bold text-slate-900">React &bull; Vite &bull; Tailwind CSS &bull; WebSockets</h3>
                <p className="text-xs text-slate-600">
                  Interactive dataset browser, role-based workflows, live WebSocket progress updates, and data visualization.
                </p>
              </div>
              <div className="text-xs px-3 py-1.5 rounded bg-white border border-slate-200 text-slate-700 shrink-0 font-medium">
                Browser Interface
              </div>
            </div>

            {/* Layer 2 */}
            <div className="p-5 border border-slate-200 rounded-lg bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1 md:max-w-xl">
                <div className="text-xs font-semibold text-slate-500 uppercase">Layer 02 &bull; API &amp; Orchestration</div>
                <h3 className="text-sm font-bold text-slate-900">Django &bull; Django REST Framework &bull; Daphne ASGI</h3>
                <p className="text-xs text-slate-600">
                  Authentication, role permissions, policy verification, grant governance, and real-time WebSocket channel routing.
                </p>
              </div>
              <div className="text-xs px-3 py-1.5 rounded bg-white border border-slate-200 text-slate-700 shrink-0 font-medium">
                API Gateway
              </div>
            </div>

            {/* Layer 3 */}
            <div className="p-5 border border-slate-200 rounded-lg bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1 md:max-w-xl">
                <div className="text-xs font-semibold text-slate-500 uppercase">Layer 03 &bull; Distributed Workers</div>
                <h3 className="text-sm font-bold text-slate-900">Celery Workers &bull; Redis Broker &bull; Encrypted Compute Kernel</h3>
                <p className="text-xs text-slate-600">
                  Asynchronous workers handle intensive mathematical computations in isolated queues without blocking user operations.
                </p>
              </div>
              <div className="text-xs px-3 py-1.5 rounded bg-white border border-slate-200 text-slate-700 shrink-0 font-medium">
                Worker Pool
              </div>
            </div>

            {/* Layer 4 */}
            <div className="p-5 border border-slate-200 rounded-lg bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1 md:max-w-xl">
                <div className="text-xs font-semibold text-slate-500 uppercase">Layer 04 &bull; Storage &amp; Audit Log</div>
                <h3 className="text-sm font-bold text-slate-900">PostgreSQL &bull; Multi-Tenant Schemas &bull; Immutable Receipts</h3>
                <p className="text-xs text-slate-600">
                  Stores serialized encrypted context payloads, dataset metadata, and tamper-evident audit logs. Raw values are never stored.
                </p>
              </div>
              <div className="text-xs px-3 py-1.5 rounded bg-white border border-slate-200 text-slate-700 shrink-0 font-medium">
                Encrypted Storage
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Zero-Trust Access Governance */}
      <section id="governance" className="py-20 border-b border-slate-200 bg-slate-50/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12 space-y-2">
            <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Governance &amp; Access</div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Clear Policy Enforcement Before Queries Execute
            </h2>
            <p className="text-sm text-slate-600">
              Homomorphic encryption protects calculations in memory; multi-tier governance ensures only authorized queries are dispatched.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-white border border-slate-200 rounded-lg space-y-3">
              <div className="text-xs font-bold text-slate-900 uppercase">Policy Tier 01</div>
              <h3 className="text-sm font-bold text-slate-900">Strict Consent</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Requires the Data Owner to review and approve each researcher grant request before any query can be executed.
              </p>
              <div className="text-xs text-slate-500 pt-2 border-t border-slate-100">
                Ideal for clinical trials and confidential records.
              </div>
            </div>

            <div className="p-6 bg-white border border-slate-200 rounded-lg space-y-3">
              <div className="text-xs font-bold text-slate-900 uppercase">Policy Tier 02</div>
              <h3 className="text-sm font-bold text-slate-900">Aggregated Privacy</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Permits statistical queries automatically, provided cohort sizes pass minimum k-anonymity privacy thresholds.
              </p>
              <div className="text-xs text-slate-500 pt-2 border-t border-slate-100">
                Ideal for cross-organization risk and fraud detection.
              </div>
            </div>

            <div className="p-6 bg-white border border-slate-200 rounded-lg space-y-3">
              <div className="text-xs font-bold text-slate-900 uppercase">Policy Tier 03</div>
              <h3 className="text-sm font-bold text-slate-900">Partner Whitelist</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Grants instant calculation capabilities to pre-approved researcher organizations under established institutional agreements.
              </p>
              <div className="text-xs text-slate-500 pt-2 border-t border-slate-100">
                Ideal for recurring academic and research partnerships.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Practical Applications */}
      <section id="applications" className="py-20 border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12 space-y-2">
            <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Applications</div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Where Encrypted Computation Solves Data-Sharing Barriers
            </h2>
            <p className="text-sm text-slate-600">
              Enabling multi-party collaboration where regulatory compliance previously prevented sharing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 border border-slate-200 rounded-lg bg-slate-50 space-y-2">
              <div className="text-xs text-slate-500 font-semibold uppercase">Healthcare &amp; Clinical Research</div>
              <h3 className="text-base font-bold text-slate-900">Multi-Hospital Medical Research</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Hospitals cannot pool patient data due to HIPAA and GDPR restrictions. With Cipher Analytics, research teams compute clinical correlations and regressions across encrypted records without exposing raw patient data.
              </p>
            </div>

            <div className="p-6 border border-slate-200 rounded-lg bg-slate-50 space-y-2">
              <div className="text-xs text-slate-500 font-semibold uppercase">Financial Services</div>
              <h3 className="text-base font-bold text-slate-900">Consortium Fraud Detection</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Competing financial institutions are barred from sharing customer transactions. Cipher Analytics allows banks to compute anomaly scores over encrypted records to identify money laundering patterns.
              </p>
            </div>

            <div className="p-6 border border-slate-200 rounded-lg bg-slate-50 space-y-2">
              <div className="text-xs text-slate-500 font-semibold uppercase">Public Sector</div>
              <h3 className="text-base font-bold text-slate-900">Cross-Agency Analytics</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Jurisdictional data silos prevent joint operations. Encrypted analysis allows combined telemetry and statistical evaluation without sharing confidential operational files.
              </p>
            </div>

            <div className="p-6 border border-slate-200 rounded-lg bg-slate-50 space-y-2">
              <div className="text-xs text-slate-500 font-semibold uppercase">Supply Chain</div>
              <h3 className="text-base font-bold text-slate-900">Supplier Quality Optimization</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Manufacturers and vendors can compute aggregate defect rates and lead-time distributions across suppliers without any vendor revealing proprietary margins or production quantities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 9. Technical Considerations */}
      <section className="py-20 border-b border-slate-200 bg-slate-50/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-8 space-y-2">
            <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Engineering Standards</div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Clear Engineering Trade-Offs
            </h2>
            <p className="text-sm text-slate-600">
              Homomorphic computation provides verified confidentiality with intentional engineering considerations.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-5 bg-white border border-slate-200 rounded-lg space-y-2">
              <div className="text-xs font-bold text-slate-900">Compute Workload</div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Encrypted operations require more processing than raw calculations. Cipher Analytics delegates these workloads to dedicated background worker queues.
              </p>
            </div>

            <div className="p-5 bg-white border border-slate-200 rounded-lg space-y-2">
              <div className="text-xs font-bold text-slate-900">Calculation Depth</div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Sequential multiplications introduce noise accumulation. Automated scaling and relinearization maintain precision throughout deep operations.
              </p>
            </div>

            <div className="p-5 bg-white border border-slate-200 rounded-lg space-y-2">
              <div className="text-xs font-bold text-slate-900">Non-Linear Operations</div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Certain discrete comparisons are adapted into high-accuracy polynomial approximations to support algorithms like isolation forests.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 10. Call to Action Section */}
      <section className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-10 lg:p-14 rounded-xl border border-slate-200 bg-slate-900 text-white space-y-6">
            <div className="max-w-2xl space-y-3">
              <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                Get Started
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
                Ready to explore encrypted analytics?
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Create an account as a Data Owner to upload and encrypt datasets, or as a Researcher to request analytical computation grants.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to="/register"
                className="px-6 py-3 bg-white hover:bg-slate-100 text-slate-950 text-xs font-semibold rounded-md transition-colors shadow-xs"
              >
                Create an account
              </Link>
              <Link
                to="/login"
                className="px-6 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-semibold rounded-md transition-colors"
              >
                Sign in to console
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 11. Professional Enterprise Footer */}
      <footer className="bg-white text-slate-600 py-12 border-t border-slate-200 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-200">
            <div className="space-y-3 md:col-span-1">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                  C
                </div>
                <span className="font-semibold text-slate-900 tracking-tight text-sm">Cipher Analytics</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Privacy-preserving analytics platform enabling secure computation without sharing raw data.
              </p>
            </div>

            <div>
              <div className="font-semibold text-slate-900 text-xs mb-3">Platform</div>
              <ul className="space-y-2 text-xs text-slate-500">
                <li><Link to="/login" className="hover:text-slate-900">Console</Link></li>
                <li><Link to="/login" className="hover:text-slate-900">Dataset catalog</Link></li>
                <li><Link to="/login" className="hover:text-slate-900">Analytical queries</Link></li>
                <li><Link to="/login" className="hover:text-slate-900">Audit logs</Link></li>
              </ul>
            </div>

            <div>
              <div className="font-semibold text-slate-900 text-xs mb-3">Technology</div>
              <ul className="space-y-2 text-xs text-slate-500">
                <li>Homomorphic computation</li>
                <li>Client-side key generation</li>
                <li>Isolated worker queues</li>
                <li>Real-time WebSocket telemetry</li>
              </ul>
            </div>

            <div>
              <div className="font-semibold text-slate-900 text-xs mb-3">Security &amp; Access</div>
              <ul className="space-y-2 text-xs text-slate-500">
                <li>Zero key custody model</li>
                <li>k-Anonymity safeguards</li>
                <li>Role-based access control</li>
                <li><Link to="/register" className="hover:text-slate-900">Register account</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
            <div>
              &copy; {new Date().getFullYear()} Cipher Analytics Inc. All rights reserved.
            </div>
            <div className="flex items-center space-x-6 text-slate-500">
              <span>Zero-knowledge client keys</span>
              <span>Encrypted transmission</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Landing;
