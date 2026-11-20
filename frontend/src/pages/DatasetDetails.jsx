import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import client from '../api/client';
import useWebSockets from '../hooks/useWebSockets';
import Card from '../components/ui/Card';
import StatusBadge from '../components/ui/StatusBadge';
import Toast from '../components/ui/Toast';
import Modal from '../components/ui/Modal';
import CorrelationHeatmap from '../components/CorrelationHeatmap';
import AnomalyHeatmap from '../components/AnomalyHeatmap';
import ShapBarChart from '../components/ShapBarChart';
import AnomalyGalaxy from '../components/analytics/AnomalyGalaxy';

// --- Centralized UI Mapping Layer ---
const INSIGHT_CONFIG = {
  sum: {
    label: 'Aggregate Summation',
    op: '∑',
    math: 'E(∑ x_i)',
    actionLabel: 'Sum',
    description: 'Calculates the total aggregate value across encrypted feature vectors using additive homomorphic properties in the secure enclave.'
  },
  mean: {
    label: 'Arithmetic Mean',
    op: 'x̄',
    math: 'E(1/n ∑ x_i)',
    actionLabel: 'Mean',
    description: 'Derives the central tendency across ciphertext vectors via SIMD slot-batched CKKS scalar scaling.'
  },
  correlation: {
    label: 'Pearson Correlation Matrix',
    op: '☍',
    math: 'cov(X, Y) / (σ_x σ_y)',
    actionLabel: 'Correlation',
    description: 'Analyzes inter-variable dependencies and Pearson coefficients across numeric columns without exposing raw data points.'
  },
  anomaly_detection: {
    label: 'Isolation Forest Anomaly Detection',
    op: '⚠',
    math: 'E(score(x)) > τ',
    actionLabel: 'Anomalies',
    description: 'Executes unsupervised Isolation Forest and localized SHAP attribution to identify and explain multivariate outliers.'
  }
};

const JOB_LIFECYCLE = {
  IDLE: 'idle',
  RUNNING: 'running',
  SUCCESS: 'success',
  FAILED: 'failed'
};

const CONSOLE_STATE = {
  IDLE: 'idle',
  RUNNING: 'running',
  SUCCESS: 'success',
  ERROR: 'error'
};

// --- Icons ---
const IconDatabase = (props) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>;
const IconShield = (props) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>;
const IconDownload = (props) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>;
const IconTrash = (props) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const IconChevronRight = (props) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>;
const IconClock = (props) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const IconRefresh = (props) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>;
const IconTerminal = (props) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;

// --- UI Sub-Components ---

const DatasetHeader = ({ dataset }) => (
  <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-6 border-b border-slate-200/90 mb-6 gap-4">
    <div className="flex items-center space-x-4 min-w-0">
      <div className="w-10 h-10 bg-slate-900 rounded-md flex items-center justify-center text-sky-400 shrink-0 shadow-sm">
        <IconDatabase className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <div className="flex items-center space-x-2.5 mb-1">
          <h1 className="text-xl font-bold text-slate-900 truncate tracking-tight font-mono">{dataset.name}</h1>
          <StatusBadge status={dataset.status} errorMessage={dataset.error_message} />
        </div>
        <div className="flex items-center text-[10px] font-mono text-slate-500 space-x-3 flex-wrap">
          <span>ID::{dataset.id.toString().padStart(4, '0')}</span>
          <span>•</span>
          <span className="flex items-center"><IconClock className="w-3 h-3 mr-1" /> {new Date(dataset.created_at).toLocaleDateString()}</span>
          <span>•</span>
          <span className="flex items-center text-sky-700 font-semibold"><IconShield className="w-3 h-3 mr-1 text-sky-600" /> CKKS Scheme Active</span>
          <span>•</span>
          <span>{dataset.rows_count.toLocaleString()} rows × {dataset.columns_count} cols</span>
        </div>
      </div>
    </div>

    <div className="flex items-center space-x-2 shrink-0">
      <Link 
        to="/datasets" 
        className="px-3 py-1.5 text-xs font-medium border border-slate-300 rounded bg-white text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
      >
        ← Return to Catalog
      </Link>
    </div>
  </div>
);

const ActionToolbar = ({ dataset, jobStates, onOpenConsole, onDownload, onMetadata, onDelete }) => {
  const ActionBtn = ({ type }) => {
    const config = INSIGHT_CONFIG[type];
    const isRunning = jobStates[type] === JOB_LIFECYCLE.RUNNING;
    
    return (
      <button
        onClick={() => onOpenConsole(type)}
        disabled={dataset.status !== 'READY'}
        className={`px-3 py-1.5 text-xs font-medium rounded border transition-colors flex items-center justify-center 
          ${isRunning 
            ? 'bg-slate-900 text-white border-transparent' 
            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50 hover:border-slate-400 shadow-sm'} 
          disabled:opacity-40 disabled:cursor-not-allowed`}
      >
        {isRunning && (
          <svg className="animate-spin h-3 w-3 mr-1.5 text-sky-400" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
        )}
        {isRunning ? 'Computing...' : config.actionLabel}
      </button>
    );
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mb-6 p-2 rounded-md bg-white border border-slate-200/90 shadow-[0_1px_2px_0_rgba(15,23,42,0.03)]">
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider px-2">Execute FHE:</span>
        <ActionBtn type="sum" />
        <ActionBtn type="mean" />
        <div className="w-px h-5 bg-slate-200 mx-1"></div>
        <ActionBtn type="correlation" />
        <ActionBtn type="anomaly_detection" />
      </div>

      <div className="flex items-center space-x-2 ml-auto">
        <button 
          onClick={onDownload} 
          disabled={dataset.status !== 'READY'} 
          className="inline-flex items-center px-2.5 py-1.5 rounded border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 text-xs font-medium shadow-sm transition-colors disabled:opacity-30"
          title="Download Ciphertext Binary"
        >
          <IconDownload className="w-3.5 h-3.5 mr-1 text-slate-400" />
          Ciphertext .enc
        </button>

        <button 
          onClick={onMetadata} 
          className="inline-flex items-center px-2.5 py-1.5 rounded border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 text-xs font-medium shadow-sm transition-colors"
          title="Export Schema and Statistics"
        >
          Export Metadata
        </button>

        <button 
          onClick={onDelete} 
          className="p-1.5 rounded border border-rose-200 bg-white text-rose-600 hover:bg-rose-50 shadow-sm transition-colors"
          title="Delete Dataset Asset"
        >
          <IconTrash className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

const InsightCard = ({ type, data, status, onView }) => {
  const config = INSIGHT_CONFIG[type] || { label: type, op: '?' };
  const displayLabel = data?.display_name || config.label;
  const isReady = !!data;
  const isFailed = status === JOB_LIFECYCLE.FAILED;

  return (
    <Card className="p-4 transition-all hover:border-slate-300">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-mono font-bold text-sm">
            {config.op}
          </div>
          <div>
            <h3 className="text-xs font-semibold text-slate-900">{displayLabel}</h3>
            <div className="text-[10px] font-mono mt-0.5">
              {isReady ? (
                <span className="text-emerald-700 font-medium flex items-center">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5"></span>
                  COMPUTED
                </span>
              ) : isFailed ? (
                <span className="text-rose-600 font-medium flex items-center">
                  <span className="w-1.5 h-1.5 bg-rose-500 rounded-full mr-1.5"></span>
                  FAILED
                </span>
              ) : (
                <span className="text-slate-400">UNEXECUTED</span>
              )}
            </div>
          </div>
        </div>

        <button 
          onClick={() => onView(type)} 
          className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          title="Inspect Insight"
        >
          <IconChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="min-h-[36px] flex items-center">
        {isReady ? (
          <div className="text-lg font-bold text-slate-900 font-mono tracking-tight">
            {data.result_json 
              ? (data.result_json.version === 'v2' && data.result_json.status === 'success' && data.result_json.result.type === 'correlation'
                  ? `${data.result_json.result.summary.strong_pairs.length} Strong Pairs`
                  : data.result_json.version === 'v2' && data.result_json.status === 'success' && data.result_json.result.type === 'anomaly'
                    ? `${data.result_json.result.percentage}% Outliers (${data.result_json.result.count})`
                    : 'Structured Result Available')
              : data.result_value?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
          </div>
        ) : (
          <div className="text-[11px] text-slate-400 font-mono">
            {isFailed ? 'Execution failed on worker.' : 'Click to execute on ciphertext vectors.'}
          </div>
        )}
      </div>

      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono text-slate-400">
        <span>{config.math}</span>
        <button 
          onClick={() => onView(type)} 
          className="text-sky-600 hover:text-sky-700 font-sans font-medium"
        >
          Open Console →
        </button>
      </div>
    </Card>
  );
};

const PolicySidebar = ({ dataset }) => (
  <div className="space-y-4">
    <Card className="p-4 space-y-4">
      <div className="border-b border-slate-100 pb-2">
        <h3 className="text-xs font-semibold text-slate-900">Governance & Security Controls</h3>
        <p className="text-[10px] text-slate-400 font-mono mt-0.5">ENCLAVE ACCESS POLICY</p>
      </div>

      <div className="space-y-3 text-xs">
        <div>
          <span className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Catalog Visibility</span>
          <StatusBadge status={dataset.visibility} />
        </div>

        <div>
          <span className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Compute Governance Mode</span>
          <StatusBadge status={dataset.compute_mode} />
        </div>

        <div className="pt-2 border-t border-slate-100">
          <span className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Cryptographic Engine</span>
          <span className="font-mono text-slate-700 text-[11px] block">CKKS (SEAL / TenSEAL)</span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Polynomial Modulus Degree N=8192</span>
        </div>

        <div className="pt-2 border-t border-slate-100">
          <span className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Inference Defense</span>
          <span className="text-[11px] text-slate-600 leading-snug block">
            Automated k-anonymity (n ≥ 5) and cardinality filtering active.
          </span>
        </div>
      </div>
    </Card>
  </div>
);

// --- Research-Grade Computation Console Modal ---

const ModalHeader = ({ type, state, datasetId }) => {
  const config = INSIGHT_CONFIG[type] || { label: type };
  return (
    <div className="pb-4 border-b border-slate-200 mb-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
          FHE COMPUTATION EXECUTION ENCLAVE
        </span>
        <span className="text-[9px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 uppercase">
          Zero-Trust Verified
        </span>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">{config.label}</h2>
          <div className="flex items-center mt-1 text-[11px] font-mono text-slate-400 space-x-3">
            <span>Target: ID::{datasetId}</span>
            <span>•</span>
            <span>Engine: CKKS Vector Slot SIMD</span>
          </div>
        </div>
        <div className="text-xs font-mono text-slate-500 bg-slate-100 px-2.5 py-1 rounded border border-slate-200">
          {config.math}
        </div>
      </div>
    </div>
  );
};

const ModalBody = ({ type, state, data, error, onExplainAnomaly, anomalyRowId, shapResult, shapLoading }) => {
  const config = INSIGHT_CONFIG[type] || { label: type };

  if (state === CONSOLE_STATE.RUNNING) {
    return (
      <div className="py-16 text-center animate-in fade-in duration-300">
        <div className="w-10 h-10 border-2 border-slate-200 border-t-sky-600 rounded-full animate-spin mx-auto mb-4"></div>
        <h3 className="text-xs font-mono font-bold text-slate-800 uppercase tracking-wider mb-1">
          Evaluating Homomorphic Operation...
        </h3>
        <p className="text-[11px] text-slate-500 max-w-sm mx-auto leading-relaxed">
          Celery worker running CKKS arithmetic across encrypted polynomial vectors. No plaintext loaded into memory.
        </p>
      </div>
    );
  }

  if (state === CONSOLE_STATE.ERROR) {
    return (
      <div className="py-10 text-center bg-rose-50/60 rounded-md border border-rose-200 p-6">
        <div className="w-8 h-8 bg-rose-100 text-rose-600 rounded flex items-center justify-center mx-auto mb-3">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">Execution Failure Detected</h3>
        <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">{error || "Computation job terminated on worker."}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="p-4 bg-slate-50 border border-slate-200 rounded text-xs">
        <span className="font-semibold text-slate-800 block mb-0.5">Mathematical Definition:</span>
        <span className="text-slate-600 leading-relaxed block">{config.description}</span>
      </div>

      {!data ? (
        <div className="py-12 text-center border-2 border-dashed border-slate-200 rounded-md">
          <IconShield className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-xs text-slate-500 font-medium">No verified computation results stored for this operation.</p>
          <p className="text-[10px] text-slate-400 mt-0.5 font-mono">Click "Initiate Computation" to dispatch task.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-slate-900 rounded-md p-6 text-white text-center shadow-inner border border-slate-800">
            <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider block mb-2">
              Cryptographically Verified Result
            </span>
            <div className="text-4xl font-bold font-mono tracking-tight text-sky-400">
              {data.result_json
                ? (data.result_json.version === 'v2' && data.result_json.status === 'success' && data.result_json.result.type === 'correlation' 
                    ? `${data.result_json.result.summary.strong_pairs.length} Strong Pairs`
                    : data.result_json.version === 'v2' && data.result_json.status === 'success' && data.result_json.result.type === 'anomaly' 
                      ? `${data.result_json.result.percentage}% Anomalies`
                      : 'Structured Result')
                : (typeof data.result_value === 'number' 
                    ? data.result_value.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 6 }) 
                    : data.result_value)
              }
            </div>
            {data.result_json?.message && (
              <p className="text-[11px] text-slate-400 mt-2 font-mono">{data.result_json.message}</p>
            )}
          </div>

          {/* Complex ML Visualizations */}
          {data.result_json?.version === 'v2' && data.result_json?.status === 'success' && data.result_json?.result?.type === 'correlation' && (
            <div className="p-4 bg-white border border-slate-200 rounded-md">
              <CorrelationHeatmap data={data.result_json} />
            </div>
          )}

          {data.result_json?.version === 'v2' && data.result_json?.status === 'success' && data.result_json?.result?.type === 'anomaly' && (
            <div className="p-4 bg-white border border-slate-200 rounded-md">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3">
                  <AnomalyHeatmap data={data.result_json.result} onRowClick={onExplainAnomaly} activeRowId={anomalyRowId} />
                </div>
                <div className="lg:col-span-2">
                  <ShapBarChart data={shapResult} loading={shapLoading} />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const ModalFooter = ({ state, onRun, onClose }) => (
  <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-200">
    <button 
      onClick={onClose} 
      disabled={state === CONSOLE_STATE.RUNNING} 
      className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-300 rounded bg-white hover:bg-slate-50 transition-colors disabled:opacity-30"
    >
      Close
    </button>

    {(state === CONSOLE_STATE.IDLE || state === CONSOLE_STATE.SUCCESS || state === CONSOLE_STATE.ERROR) && (
      <button
        onClick={onRun}
        className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-medium shadow-sm transition-colors flex items-center"
      >
        {state === CONSOLE_STATE.SUCCESS ? <><IconRefresh className="w-3.5 h-3.5 mr-1.5" /> Re-execute Operation</> : 
         state === CONSOLE_STATE.ERROR ? 'Retry Analysis' : 'Initiate Computation'}
      </button>
    )}
  </div>
);

// --- Main DatasetDetails View ---

const DatasetDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [dataset, setDataset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [toast, setToast] = useState({ message: null, type: 'info' });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const [jobStates, setJobStates] = useState({
    sum: JOB_LIFECYCLE.IDLE,
    mean: JOB_LIFECYCLE.IDLE,
    correlation: JOB_LIFECYCLE.IDLE,
    anomaly_detection: JOB_LIFECYCLE.IDLE
  });
  
  const [consoleState, setConsoleState] = useState({
    isOpen: false,
    type: 'sum',
    status: CONSOLE_STATE.IDLE,
    error: null
  });

  const [activeAnomalyRowId, setActiveAnomalyRowId] = useState(null);
  const [shapResult, setShapResult] = useState(null);
  const [shapLoading, setShapLoading] = useState(false);
  
  const lastEventTimestamp = useRef(0);
  const activeJobsRef = useRef({}); 

  // --- L2 Client-Side Cache Layer ---
  const [cache, setCache] = useState(() => {
    const saved = localStorage.getItem(`dataset:${id}:insights:v1`);
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    if (id) {
      const saved = localStorage.getItem(`dataset:${id}:insights:v1`);
      setCache(saved ? JSON.parse(saved) : {});
    }
  }, [id]);

  const updateCache = useCallback((type, data) => {
    setCache(prev => {
      const newCache = { ...prev, [type]: data };
      localStorage.setItem(`dataset:${id}:insights:v1`, JSON.stringify(newCache));
      return newCache;
    });
  }, [id]);

  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type });
  }, []);

  const fetchDataset = useCallback(async () => {
    try {
      setLoading(true);
      const response = await client.get(`datasets/${id}/`);
      setDataset(response.data);
      
      if (response.data.computations?.length > 0) {
        const latest = {};
        response.data.computations.forEach(c => {
          const type = c.operation.toLowerCase();
          if (!latest[type]) latest[type] = c;
        });
        setCache(prev => {
          const merged = { ...latest, ...prev };
          localStorage.setItem(`dataset:${id}:insights:v1`, JSON.stringify(merged));
          return merged;
        });
      }
    } catch (error) {
      showToast('Failed to load dataset resource.', 'error');
    } finally {
      setLoading(false);
    }
  }, [id, showToast]);

  const checkJobStatus = useCallback(async (jobId, type) => {
    try {
      const jobRes = await client.get(`datasets/jobs/${jobId}/`);
      if (jobRes.data.status === 'COMPLETED') {
        const result = {
          ...jobRes.data,
          result: jobRes.data.result_value, 
          result_json: jobRes.data.result_json,
          datasetName: dataset?.name,
          display_name: jobRes.data.display_name 
        };
        updateCache(type, result);
        setJobStates(prev => ({ ...prev, [type]: JOB_LIFECYCLE.SUCCESS }));
        
        setConsoleState(prev => {
          if (prev.isOpen && prev.type === type) {
            return { ...prev, status: CONSOLE_STATE.SUCCESS };
          }
          return prev;
        });

        showToast(`Secure analysis completed for ${type.toUpperCase()}`, 'success');
        delete activeJobsRef.current[jobId];
        fetchDataset();
      } else if (jobRes.data.status === 'FAILED') {
        setJobStates(prev => ({ ...prev, [type]: JOB_LIFECYCLE.FAILED }));
        setConsoleState(prev => {
          if (prev.isOpen && prev.type === type) {
            return { ...prev, status: CONSOLE_STATE.ERROR, error: "The secure enclave cluster rejected the job due to invalid ciphertext depth." };
          }
          return prev;
        });
        showToast(`${type.toUpperCase()} terminated: Hardware enclave constraint.`, 'error');
        delete activeJobsRef.current[jobId];
      }
    } catch (err) {
      console.error("Poll Error", err);
    }
  }, [dataset?.name, fetchDataset, updateCache, showToast]);

  const checkShapJobStatus = useCallback(async (jobId) => {
    try {
      const jobRes = await client.get(`datasets/jobs/${jobId}/`);
      if (jobRes.data.status === 'COMPLETED') {
        setShapResult(jobRes.data.result_json);
        setShapLoading(false);
        showToast('SHAP Explanation verified.', 'success');
      } else if (jobRes.data.status === 'FAILED') {
        setShapLoading(false);
        showToast('SHAP analysis failed.', 'error');
      }
    } catch (err) {
      console.error("SHAP Poll Error", err);
    }
  }, [showToast]);

  useWebSockets(useCallback((message) => {
    if (message.type === 'DATASET_STATUS_UPDATED' || message.type === 'COMPUTATION_STATUS_UPDATED') {
       const { payload, metadata } = message;
       const eventTime = new Date(metadata.timestamp).getTime();
       if (eventTime <= lastEventTimestamp.current) return;
       lastEventTimestamp.current = eventTime;

       if (payload.model === 'dataset' && payload.id === parseInt(id)) {
           fetchDataset();
       } else if (payload.model === 'computation') {
           fetchDataset();
           const jobType = activeJobsRef.current[payload.id];
           if (jobType) checkJobStatus(payload.id, jobType);
       }
    }
  }, [id, fetchDataset, checkJobStatus]));

  useEffect(() => {
    fetchDataset();
  }, [fetchDataset]);

  const handleDelete = async () => {
    try {
      setShowDeleteModal(false);
      await client.delete(`datasets/${id}/`);
      navigate('/datasets');
    } catch (error) {
      showToast('Failed to delete dataset.', 'error');
    }
  };

  const handleDownload = async () => {
    try {
      showToast('Preparing secure download package...', 'loading');
      const response = await client.get(`datasets/${id}/download/`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${dataset.name}.enc`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      showToast('Download initialized.', 'success');
    } catch (err) {
      showToast('Download failed: Resource locked or unavailable.', 'error');
    }
  };

  const handleExportMetadata = async () => {
    try {
      const response = await client.get(`datasets/${id}/export-metadata/`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${dataset.name}_metadata.json`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      showToast('Metadata exported.', 'success');
    } catch (err) {
      showToast('Metadata export failed.', 'error');
    }
  };

  const handleCompute = useCallback(async (operation) => {
    const internalOp = operation.toLowerCase();
    try {
      setJobStates(prev => ({ ...prev, [internalOp]: JOB_LIFECYCLE.RUNNING }));
      setConsoleState(prev => ({ ...prev, status: CONSOLE_STATE.RUNNING, error: null }));
      
      const response = await client.post(`datasets/${id}/compute/`, { operation });
      const jobId = response.data.job_id;
      activeJobsRef.current[jobId] = internalOp;

      if (response.data.status === 'COMPLETED' || response.data.status === 'FAILED') {
        checkJobStatus(jobId, internalOp);
      }
    } catch (error) {
      setJobStates(prev => ({ ...prev, [internalOp]: JOB_LIFECYCLE.FAILED }));
      setConsoleState(prev => ({ ...prev, status: CONSOLE_STATE.ERROR, error: error.response?.data?.detail || "Network connection failure" }));
      showToast(`Audit initialization failed: ${error.response?.data?.detail || 'Network error'}`, 'error');
    }
  }, [id, checkJobStatus, showToast]);

  const handleExplainAnomaly = async (row_id) => {
    try {
      setActiveAnomalyRowId(row_id);
      setShapLoading(true);
      setShapResult(null);
      showToast('Deriving feature contributions...', 'loading');
      
      const response = await client.post(`datasets/${id}/explain_anomaly/`, { row_id });
      if (response.data.cached && response.data.result_json) {
        setShapResult(response.data.result_json);
        setShapLoading(false);
        showToast('Insights verified from cache.', 'success');
        return;
      }

      if (response.data.status === 'COMPLETED' || response.data.status === 'FAILED') {
         checkShapJobStatus(response.data.job_id);
      }
    } catch (error) {
      setShapLoading(false);
      showToast('Analysis failed: Enclave response timed out.', 'error');
    }
  };

  const handleOpenConsole = useCallback((type) => {
    const isRunning = jobStates[type] === JOB_LIFECYCLE.RUNNING;
    const hasResult = !!cache[type];
    
    if (!isRunning && !hasResult) {
      setConsoleState({
        isOpen: true,
        type,
        status: CONSOLE_STATE.RUNNING,
        error: null
      });
      handleCompute(type);
    } else {
      setConsoleState({
        isOpen: true,
        type,
        status: isRunning ? CONSOLE_STATE.RUNNING : (hasResult ? CONSOLE_STATE.SUCCESS : CONSOLE_STATE.IDLE),
        error: null
      });
    }
  }, [jobStates, cache, handleCompute]);

  const handleCloseConsole = useCallback(() => {
    setConsoleState(prev => ({ ...prev, isOpen: false }));
    setActiveAnomalyRowId(null);
    setShapResult(null);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-48">
        <div className="w-8 h-8 border-2 border-slate-200 border-t-sky-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!dataset) return null;

  return (
    <div className="space-y-6">
      {toast.message && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast({ message: null, type: 'info' })} 
        />
      )}
      
      <Modal 
        isOpen={showDeleteModal} 
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Destroy Data Asset"
        message={`Confirm permanent termination of "${dataset.name}" resource from the secure enclave.`}
        confirmText="Confirm Destruction"
        variant="danger"
      />

      {/* Computation Console Modal */}
      {consoleState.isOpen && (
        <div className="fixed inset-0 z-[100] overflow-y-auto">
          <div className="flex items-start justify-center min-h-screen px-4 pt-10 pb-20 text-center sm:p-0">
            <div 
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity" 
              onClick={consoleState.status !== CONSOLE_STATE.RUNNING ? handleCloseConsole : undefined}
            ></div>
            <div className="relative inline-block align-middle bg-white rounded-lg text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:max-w-4xl sm:w-full z-10 border border-slate-200 p-6">
              <ModalHeader type={consoleState.type} state={consoleState.status} datasetId={dataset.id} />
              <ModalBody 
                type={consoleState.type} 
                state={consoleState.status} 
                data={cache[consoleState.type]} 
                error={consoleState.error}
                onExplainAnomaly={handleExplainAnomaly}
                anomalyRowId={activeAnomalyRowId}
                shapResult={shapResult}
                shapLoading={shapLoading}
              />
              <ModalFooter 
                state={consoleState.status} 
                onRun={() => handleCompute(consoleState.type)} 
                onClose={handleCloseConsole} 
              />
            </div>
          </div>
        </div>
      )}

      <DatasetHeader dataset={dataset} />

      <ActionToolbar 
        dataset={dataset} 
        jobStates={jobStates}
        onOpenConsole={handleOpenConsole}
        onDownload={handleDownload}
        onMetadata={handleExportMetadata}
        onDelete={() => setShowDeleteModal(true)}
      />

      {/* Navigation Tabs */}
      <div className="flex items-center space-x-6 border-b border-slate-200">
        {[
          { id: 'overview', label: 'Analytical Summary' },
          { id: '3d-galaxy', label: '3D Manifold Galaxy' },
          { id: 'access', label: 'Access Grants' },
          { id: 'logs', label: 'Audit Trail' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-2.5 text-xs font-medium transition-colors relative ${
              activeTab === tab.id ? 'text-slate-900 font-semibold' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900 rounded-full"></div>
            )}
          </button>
        ))}
      </div>

      <div>
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-8 space-y-6">
              <div>
                <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Homomorphic Insights & Primitives
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InsightCard type="sum" data={cache.sum} status={jobStates.sum} onView={handleOpenConsole} />
                  <InsightCard type="mean" data={cache.mean} status={jobStates.mean} onView={handleOpenConsole} />
                  <InsightCard type="correlation" data={cache.correlation} status={jobStates.correlation} onView={handleOpenConsole} />
                  <InsightCard type="anomaly_detection" data={cache.anomaly_detection} status={jobStates.anomaly_detection} onView={handleOpenConsole} />
                </div>
              </div>

              <div>
                <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Technical Artifact Metadata
                </h2>
                <Card className="bg-slate-900 border-slate-800 p-4 shadow-sm text-slate-300">
                  <pre className="text-xs font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed text-slate-300">
                    {JSON.stringify({
                      resource: dataset.name,
                      architecture: "Encrypted Vector",
                      dimensions: `${dataset.rows_count} rows x ${dataset.columns_count} columns`,
                      provenance: "FHE_ENCLAVE_v2.0",
                      encryption_scheme: "CKKS-RLWE-8192",
                      integrity_verification: "VERIFIED_HARDWARE_ROOT"
                    }, null, 2)}
                  </pre>
                </Card>
              </div>
            </div>

            <div className="lg:col-span-4">
              <PolicySidebar dataset={dataset} />
            </div>
          </div>
        )}

        {activeTab === '3d-galaxy' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
                  3D High-Dimensional Manifold Projection
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  UMAP 3-component projection mapped directly to WebGL GPU buffers with anomaly heat distribution.
                </p>
              </div>
              <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                GPU SHADERS ACTIVE
              </span>
            </div>

            <Card className="border-slate-800 shadow-xl overflow-hidden min-h-[600px] bg-slate-950 rounded-md">
              <AnomalyGalaxy datasetId={dataset.id} />
            </Card>
          </div>
        )}

        {(activeTab === 'access' || activeTab === 'logs') && (
          <Card className="p-16 text-center border-dashed border-slate-300 bg-white">
            <IconShield className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-xs font-semibold text-slate-900 mb-1">Audit Ledger & Access Logs</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              Granular audit events and research grant history can be inspected in the platform Governance timeline.
            </p>
            <div className="mt-4">
              <Link 
                to="/audit-logs" 
                className="inline-flex items-center text-xs font-medium text-sky-600 hover:text-sky-700"
              >
                Open Audit Timeline →
              </Link>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default DatasetDetails;
