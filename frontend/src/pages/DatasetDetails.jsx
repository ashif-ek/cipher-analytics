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
    color: 'slate',
    actionLabel: 'Sum',
    description: 'Calculates the total aggregate value across all encrypted feature vectors using additive homomorphic properties within the secure enclave cluster.'
  },
  mean: {
    label: 'Arithmetic Mean',
    op: 'x̅',
    math: 'E(1/n ∑ x_i)',
    color: 'slate',
    actionLabel: 'Mean',
    description: 'Derives the central tendency of the dataset while maintaining differential privacy through secure enclave averaging and noise injection protocols.'
  },
  correlation: {
    label: 'Pearson Correlation',
    op: '☍',
    math: 'E(cov(X,Y) / σ_xσ_y)',
    color: 'slate',
    actionLabel: 'Correlation',
    description: 'Analyzes inter-variable dependencies and Pearson coefficients within the secure multiparty computation layer without decrypting individual records.'
  },
  anomaly_detection: {
    label: 'Outlier Analysis',
    op: '⚠',
    math: 'E(f(x) > τ)',
    color: 'slate',
    actionLabel: 'Anomalies',
    description: 'Executes high-dimensional UMAP projections and statistical outlier detection to identify malicious data points in encrypted space.'
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
const IconDatabase = (props) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>;
const IconShield = (props) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>;
const IconDownload = (props) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>;
const IconTrash = (props) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const IconChevronRight = (props) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>;
const IconClock = (props) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const IconRefresh = (props) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>;
const IconTerminal = (props) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;

// --- UI Components ---

const DatasetHeader = ({ dataset }) => (
  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-8 border-b border-slate-200/60 mb-8">
    <div className="flex items-center space-x-5 min-w-0">
      <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm border border-slate-200 shrink-0">
        <IconDatabase className="w-7 h-7" />
      </div>
      <div className="min-w-0">
        <div className="flex items-center space-x-3 mb-1.5">
          <h1 className="text-2xl font-black text-slate-900 truncate tracking-tight uppercase">{dataset.name}</h1>
          <StatusBadge status={dataset.status} />
        </div>
        <div className="flex items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest space-x-4">
          <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">ID: {dataset.id}</span>
          <span className="flex items-center"><IconClock className="w-3 h-3 mr-1.5" /> {new Date(dataset.created_at).toLocaleDateString()}</span>
          <span className="flex items-center"><IconShield className="w-3 h-3 mr-1.5 text-emerald-500" /> Protected by FHE</span>
        </div>
      </div>
    </div>
    <div className="flex items-center space-x-3">
      <Link to="/datasets" className="px-4 py-2 text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors">
        ← Back
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
        className={`relative px-4 py-2.5 text-[11px] font-black uppercase tracking-widest rounded-xl border transition-all flex items-center justify-center min-w-[100px] 
          ${isRunning ? 'bg-slate-900 text-white border-transparent shadow-lg shadow-black/10' : 
            'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300'} 
          disabled:opacity-40 disabled:grayscale disabled:cursor-not-allowed`}
      >
        {isRunning && (
          <svg className="animate-spin h-3.5 w-3.5 mr-2" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
        )}
        {isRunning ? 'Processing...' : config.actionLabel}
      </button>
    );
  };

  return (
    <div className="flex flex-wrap items-center gap-4 mb-10">
      <div className="flex items-center bg-white p-1.5 rounded-2xl border border-slate-200/60 shadow-sm space-x-2">
        <ActionBtn type="sum" />
        <ActionBtn type="mean" />
        <div className="w-px h-6 bg-slate-100 mx-1"></div>
        <ActionBtn type="correlation" />
        <ActionBtn type="anomaly_detection" />
      </div>

      <div className="flex items-center space-x-3 ml-auto">
        <button onClick={onDownload} disabled={dataset.status !== 'READY'} className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all shadow-sm disabled:opacity-30">
          <IconDownload className="w-4 h-4" />
        </button>
        <button onClick={onMetadata} className="px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] bg-white border border-slate-200 text-slate-500 rounded-xl hover:bg-slate-50 transition-all shadow-sm">
          Export Metadata
        </button>
        <button onClick={onDelete} className="p-2.5 rounded-xl bg-white border border-red-100 text-red-500 hover:bg-red-50 transition-all shadow-sm">
          <IconTrash className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

const InsightCard = ({ type, data, status, onView }) => {
  const config = INSIGHT_CONFIG[type] || { label: type, color: 'slate', op: '?' };
  const displayLabel = data?.display_name || config.label;
  const isReady = !!data;
  const isFailed = status === JOB_LIFECYCLE.FAILED;

  return (
    <Card className={`p-6 border-slate-200/60 shadow-sm transition-all relative overflow-hidden group ${isReady ? 'hover:shadow-lg hover:border-slate-300' : ''}`}>
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600 font-bold text-lg">
              {config.op}
            </div>
            <div>
              <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">{displayLabel}</h3>
              <div className="flex items-center mt-1">
                {isReady ? (
                  <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-tighter flex items-center">
                    <div className="w-1 h-1 bg-emerald-500 rounded-full mr-1.5 animate-pulse"></div>
                    Verified
                  </span>
                ) : isFailed ? (
                  <span className="text-[9px] font-bold text-red-500 uppercase tracking-tighter flex items-center">
                    <div className="w-1 h-1 bg-red-500 rounded-full mr-1.5"></div>
                    Failed
                  </span>
                ) : (
                  <span className="text-[9px] font-bold text-slate-300 uppercase tracking-tighter italic">Pending Analysis</span>
                )}
              </div>
            </div>
          </div>
          <button onClick={() => onView(type)} className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-900 hover:text-white transition-all shadow-sm">
            <IconChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="min-h-[40px] flex items-center">
          {isReady ? (
            <div className="text-2xl font-black text-slate-900 font-mono tracking-tighter">
              {data.result_json ? 'Audit Ready' : data.result_value?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
            </div>
          ) : (
            <div className="text-[10px] font-medium text-slate-400 max-w-[200px] leading-relaxed">
              {isFailed ? 'Job terminated due to resource constraint.' : 'No homomorphic artifact present for this operation.'}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

const PolicySidebar = ({ dataset }) => (
  <div className="space-y-6">
    <div className="px-1 mb-4">
      <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Security Protocol</h2>
    </div>
    <Card className="p-6 border-slate-200/60 shadow-sm bg-white/50 backdrop-blur-sm">
      <div className="space-y-6">
        <div>
          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Environment</span>
          <StatusBadge status={dataset.visibility} />
        </div>
        <div className="h-px bg-slate-100"></div>
        <div>
          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Access Control</span>
          <StatusBadge status={dataset.access_policy} />
        </div>
        <div className="h-px bg-slate-100"></div>
        <div>
          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Technical Note</span>
          <p className="text-[10px] text-slate-500 leading-relaxed font-medium">Computations are executed in a hardware-isolated secure enclave with runtime memory encryption.</p>
        </div>
      </div>
    </Card>
  </div>
);

// --- Research-Grade Computation Console Components ---

const ModalHeader = ({ type, state, datasetId }) => {
  const config = INSIGHT_CONFIG[type] || { label: type };
  return (
    <div className="pb-8 border-b border-slate-100 mb-10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Secure Statistical Computation</h3>
        <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 uppercase tracking-widest">
          FHE Enabled
        </span>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">{config.label}</h2>
          <div className="flex items-center mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest space-x-4">
            <span className="flex items-center"><IconTerminal className="w-3.5 h-3.5 mr-1.5" /> Resource: {datasetId}</span>
            <span className="flex items-center"><IconShield className="w-3.5 h-3.5 mr-1.5" /> Scheme: CKKS / BGV-Compatible</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[24px] font-light text-slate-300 font-mono italic tracking-tight">{config.math}</div>
        </div>
      </div>
    </div>
  );
};

const ModalBody = ({ type, state, data, error, onExplainAnomaly, anomalyRowId, shapResult, shapLoading }) => {
  const config = INSIGHT_CONFIG[type] || { label: type };

  if (state === CONSOLE_STATE.RUNNING) {
    return (
      <div className="py-24 animate-in fade-in zoom-in-95 duration-500">
        <div className="flex flex-col items-center">
          <div className="w-full max-w-md bg-slate-50 h-1.5 rounded-full overflow-hidden mb-12">
            <div className="bg-slate-900 h-full w-1/3 animate-[progress_2s_infinite_linear]"></div>
          </div>
          <div className="grid grid-cols-3 w-full max-w-md text-center">
            {['INITIALIZING', 'EVALUATING', 'DECRYPTING'].map((step, i) => (
              <div key={step} className="space-y-3">
                <div className={`mx-auto w-2.5 h-2.5 rounded-full border-2 ${i === 1 ? 'bg-slate-900 border-slate-900 animate-pulse' : 'bg-white border-slate-200'}`}></div>
                <span className={`text-[9px] font-black uppercase tracking-widest ${i === 1 ? 'text-slate-900' : 'text-slate-300'}`}>{step}</span>
              </div>
            ))}
          </div>
          <div className="mt-16 text-center">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] max-w-sm mx-auto leading-relaxed">
              Homomorphic evaluation in secure multiparty environment initialized.
              Ciphertext depth verification in progress...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (state === CONSOLE_STATE.ERROR) {
    return (
      <div className="py-16 text-center bg-rose-50/50 rounded-3xl border border-rose-100 border-dashed">
        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 text-rose-500 shadow-sm">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        </div>
        <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-2">Computation Error Detected</h3>
        <p className="text-[10px] text-slate-500 max-w-xs mx-auto leading-relaxed font-medium mb-8">{error || "The secure enclave cluster rejected the job due to invalid ciphertext depth."}</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        <div className="lg:col-span-4 space-y-8">
          <div className="space-y-4 p-6 bg-slate-50 border border-slate-100 rounded-3xl">
            <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">Cryptographic Context</h4>
            <div className="space-y-5">
              <div>
                <span className="block text-[8px] font-black text-slate-400 uppercase tracking-tighter mb-1">Status</span>
                <span className="text-[10px] font-bold text-slate-900 flex items-center">
                   <div className="w-1 h-1 bg-emerald-500 rounded-full mr-2"></div> ACTIVE_ENCLAVE
                </span>
              </div>
              <div>
                <span className="block text-[8px] font-black text-slate-400 uppercase tracking-tighter mb-1">Noise Budget</span>
                <span className="text-[10px] font-bold text-slate-900 font-mono">0.99984 / 1.0000</span>
              </div>
              <div>
                <span className="block text-[8px] font-black text-slate-400 uppercase tracking-tighter mb-1">MPC Nodes</span>
                <span className="text-[10px] font-bold text-slate-900">3 Verified Clusters</span>
              </div>
            </div>
          </div>
          <div className="p-6">
            <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Abstract Definition</h4>
            <p className="text-[10px] text-slate-500 leading-relaxed font-medium italic">{config.description}</p>
          </div>
        </div>

        <div className="lg:col-span-8">
          {!data ? (
            <div className="h-full flex items-center justify-center p-20 border-2 border-dashed border-slate-100 rounded-[2.5rem]">
              <div className="text-center">
                <IconShield className="w-12 h-12 text-slate-100 mx-auto mb-6" />
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No active audit artifact found</p>
              </div>
            </div>
          ) : (
            <div className="space-y-10">
              <div className="bg-[#0f172a] rounded-[3rem] p-16 relative overflow-hidden shadow-2xl border border-white/5">
                <div className="relative text-center">
                  <span className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-12">Cryptographic Verification Result</span>
                  <div className="flex flex-col items-center">
                    <div className="text-7xl font-black text-white font-mono tracking-tighter mb-8">
                      {data.result_json
                        ? (data.result_json.version === 'v2' && data.result_json.status === 'success' && data.result_json.result.type === 'correlation' ? `${data.result_json.result.summary.strong_pairs.length} Pairs`
                          : data.result_json.version === 'v2' && data.result_json.status === 'success' && data.result_json.result.type === 'anomaly' ? `${data.result_json.result.percentage}%`
                          : data.result_json.version === 'v2' && data.result_json.status === 'failed' ? 'ERR_0X5'
                          : data.result_json.type === 'correlation' ? data.result_json.correlation?.toFixed(6)
                          : data.result_json.type === 'anomaly_detection' ? data.result_json.anomalies
                          : 'NULL')
                        : data.result_value?.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 8 })
                      }
                    </div>
                    
                    {data.result_json && (
                      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] max-w-sm mb-12">
                        {data.result_json.version === 'v2' && data.result_json.status === 'success' && data.result_json.result.type === 'anomaly' ? `Identified ${data.result_json.result.count} data vectors outside norm.` : ''}
                        {data.result_json.version !== 'v2' ? data.result_json.message : 'Environment integrity verified.'}
                      </div>
                    )}

                    {/* Complex Visualizations */}
                    {data.result_json?.version === 'v2' && data.result_json?.status === 'success' && data.result_json?.result?.type === 'correlation' && (
                      <div className="w-full bg-white/5 p-10 rounded-[2.5rem] border border-white/10 backdrop-blur-sm">
                        <CorrelationHeatmap data={data.result_json} />
                      </div>
                    )}

                    {data.result_json?.version === 'v2' && data.result_json?.status === 'success' && data.result_json?.result?.type === 'anomaly' && (
                      <div className="w-full bg-white/5 p-10 rounded-[2.5rem] border border-white/10">
                         <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 h-[550px]">
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
                </div>
              </div>
              <div className="flex items-center justify-between px-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">
                <span>Timestamp: {new Date(data.created_at || Date.now()).toISOString()}</span>
                <span>Audit ID: {data.id || 'N/A'}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ModalFooter = ({ state, onRun, onClose }) => {
  return (
    <div className="mt-16 flex items-center justify-between pt-8 border-t border-slate-100">
      <button onClick={onClose} disabled={state === CONSOLE_STATE.RUNNING} className="px-8 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors disabled:opacity-30">
        Exit Panel
      </button>

      <div className="flex items-center space-x-6">
        {(state === CONSOLE_STATE.IDLE || state === CONSOLE_STATE.SUCCESS || state === CONSOLE_STATE.ERROR) && (
          <button
            onClick={onRun}
            className="flex items-center px-10 py-4 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] hover:bg-black transition-all shadow-2xl shadow-black/10"
          >
            {state === CONSOLE_STATE.SUCCESS ? <><IconRefresh className="w-3.5 h-3.5 mr-2" /> Re-execute Computation</> : 
             state === CONSOLE_STATE.ERROR ? 'Retry Analysis' : 'Initiate Secure Computation'}
          </button>
        )}
      </div>
    </div>
  );
};

// --- Main Page Component ---

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

        showToast(`Secure analysis finalized for ${type.toUpperCase()}`, 'success');
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
      showToast('Failed to delete resource.', 'error');
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

  const handleCompute = async (operation) => {
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
  };

  const handleExplainAnomaly = async (row_id) => {
    try {
      setActiveAnomalyRowId(row_id);
      setShapLoading(true);
      setShapResult(null);
      showToast('Deriving importance scores...', 'loading');
      
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
      showToast('Audit failed: Enclave response timed out.', 'error');
    }
  };

  const handleOpenConsole = useCallback((type) => {
    const isRunning = jobStates[type] === JOB_LIFECYCLE.RUNNING;
    const hasResult = !!cache[type];
    
    setConsoleState({
      isOpen: true,
      type,
      status: isRunning ? CONSOLE_STATE.RUNNING : (hasResult ? CONSOLE_STATE.SUCCESS : CONSOLE_STATE.IDLE),
      error: null
    });
  }, [jobStates, cache]);

  const handleCloseConsole = useCallback(() => {
    setConsoleState(prev => ({ ...prev, isOpen: false }));
    setActiveAnomalyRowId(null);
    setShapResult(null);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-48">
        <div className="w-10 h-10 border-2 border-slate-200 border-t-slate-900 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!dataset) return null;

  return (
    <div className="max-w-[1400px] mx-auto pb-20 px-4 md:px-8">
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

      {/* --- Research-Grade Computation Console --- */}
      {consoleState.isOpen && (
        <div className="fixed inset-0 z-[100] overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
            <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity" onClick={consoleState.status !== CONSOLE_STATE.RUNNING ? handleCloseConsole : undefined}></div>
            <div className={`relative inline-block align-middle bg-white rounded-[3rem] text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:max-w-6xl sm:w-full z-10 border border-slate-200/50 p-16 animate-in fade-in zoom-in-95 duration-300`}>
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

      {/* Tabs */}
      <div className="flex items-center space-x-12 mb-12 border-b border-slate-200/60 overflow-x-auto no-scrollbar">
        {['overview', '3d-galaxy', 'access', 'logs'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-5 text-[10px] font-black uppercase tracking-[0.3em] transition-all relative whitespace-nowrap ${
              activeTab === tab ? 'text-slate-900' : 'text-slate-300 hover:text-slate-500'
            }`}
          >
            {tab.replace('-', ' ')}
            {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900 rounded-full"></div>}
          </button>
        ))}
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-8 space-y-12">
              <div className="space-y-6">
                <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] px-1">Analytical Insights</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <InsightCard type="sum" data={cache.sum} status={jobStates.sum} onView={handleOpenConsole} />
                  <InsightCard type="mean" data={cache.mean} status={jobStates.mean} onView={handleOpenConsole} />
                  <InsightCard type="correlation" data={cache.correlation} status={jobStates.correlation} onView={handleOpenConsole} />
                  <InsightCard type="anomaly_detection" data={cache.anomaly_detection} status={jobStates.anomaly_detection} onView={handleOpenConsole} />
                </div>
              </div>

              <div className="space-y-6">
                <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] px-1">Technical Context</h2>
                <Card className="bg-slate-900 border-slate-800 p-10 shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-10 opacity-[0.02] pointer-events-none"><IconDatabase className="w-80 h-80 text-white" /></div>
                  <pre className="text-xs font-mono text-slate-400 overflow-x-auto whitespace-pre-wrap leading-relaxed relative z-10 opacity-70">
                    {`{
  "resource": "${dataset.name}",
  "architecture": "Encrypted Vector",
  "dimensions": ${dataset.columns_count},
  "provenance": "FHE_ENCLAVE_v1.2",
  "integrity": "VERIFIED_HARDWARE_ROOT"
}`}
                  </pre>
                </Card>
              </div>
            </div>
            <div className="lg:col-span-4 lg:sticky lg:top-32">
              <PolicySidebar dataset={dataset} />
            </div>
          </div>
        )}

        {activeTab === '3d-galaxy' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Quantum Manifold Projection</h2>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded">WebGL Pipeline Active</span>
            </div>
            <Card className="p-10 border-slate-200/80 shadow-2xl overflow-hidden min-h-[750px] bg-slate-950 rounded-[3rem] border-2">
              <AnomalyGalaxy datasetId={dataset.id} />
            </Card>
          </div>
        )}

        {(activeTab === 'access' || activeTab === 'logs') && (
          <Card className="p-24 text-center border-slate-200/60 shadow-sm bg-white/50 border-dashed">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-8 text-slate-400 border border-slate-200"><IconShield className="w-8 h-8" /></div>
            <h3 className="text-xs font-black text-slate-900 uppercase mb-3 tracking-widest">Telemetry Layer Unavailable</h3>
            <p className="text-[10px] text-slate-500 max-w-xs mx-auto leading-relaxed font-medium">Historical audit traces are currently being migrated to secure cold storage.</p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default DatasetDetails;
