import React, { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import client from '../../api/client';

// --- Custom Shader for Points ---
// Supports per-point size, color, and a soft circular alpha gradient (glow)
const pointShader = {
  uniforms: {
    time: { value: 0 },
  },
  vertexShader: `
    attribute float size;
    varying vec3 vColor;
    void main() {
      vColor = color;
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      // Increased multiplier for better visibility at distance
      gl_PointSize = size * (500.0 / -mvPosition.z);
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    varying vec3 vColor;
    void main() {
      vec2 xy = gl_PointCoord.xy - vec2(0.5);
      float ll = length(xy);
      if(ll > 0.5) discard;
      
      // Adjusted gradient for a sharper, more visible core
      float alpha = pow((0.5 - ll) * 2.0, 1.0);
      gl_FragColor = vec4(vColor, alpha);
    }
  `,
};

const GalaxyPoints = ({ data, onHover, onClickPoint }) => {
  const geometryRef = useRef();
  const materialRef = useRef();

  // Pulse effect for the galaxy
  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = state.clock.getElapsedTime();
    }
  });
  
  // Prepare Float32Arrays for BufferGeometry
  const { positions, colors, sizes } = useMemo(() => {
    const validData = Array.isArray(data) ? data : [];
    const pos = new Float32Array(validData.length * 3);
    const col = new Float32Array(validData.length * 3);
    const sz = new Float32Array(validData.length);
    
    // Color stops
    const colorLow = new THREE.Color('#3b82f6');   // Blue
    const colorMed = new THREE.Color('#f97316');   // Orange
    const colorHigh = new THREE.Color('#ef4444');  // Red
    const tempColor = new THREE.Color();

    validData.forEach((d, i) => {
      pos[i * 3] = d.x * 10; 
      pos[i * 3 + 1] = d.y * 10;
      pos[i * 3 + 2] = d.z * 10;
      
      if (d.score < 0.5) {
        tempColor.lerpColors(colorLow, colorMed, d.score * 2);
      } else {
        tempColor.lerpColors(colorMed, colorHigh, (d.score - 0.5) * 2);
      }
      
      col[i * 3] = tempColor.r;
      col[i * 3 + 1] = tempColor.g;
      col[i * 3 + 2] = tempColor.b;
      
      // Increased base size for immediate visibility
      sz[i] = 4.0 + (d.score * 6.0);
    });
    
    return { positions: pos, colors: col, sizes: sz };
  }, [data]);

  // Raycaster event handlers
  const handlePointerMove = useCallback((e) => {
    e.stopPropagation();
    if (e.index !== undefined) {
      document.body.style.cursor = 'pointer';
      onHover(data[e.index], e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    }
  }, [data, onHover]);

  const handlePointerOut = useCallback(() => {
    document.body.style.cursor = 'auto';
    onHover(null);
  }, [onHover]);

  const handleClick = useCallback((e) => {
    e.stopPropagation();
    if (e.index !== undefined) {
      onClickPoint(data[e.index]);
    }
  }, [data, onClickPoint]);

  return (
    <points
      onPointerMove={handlePointerMove}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
    >
      <bufferGeometry ref={geometryRef}>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
        <bufferAttribute
          attach="attributes-size"
          args={[sizes, 1]}
        />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        vertexShader={pointShader.vertexShader}
        fragmentShader={pointShader.fragmentShader}
        uniforms={pointShader.uniforms}
        transparent={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        vertexColors={true}
      />
    </points>
  );
};

const CameraController = ({ data }) => {
  const { camera } = useThree();
  const [focused, setFocused] = useState(false);
  const initialized = useRef(false);
  
  useFrame((state, delta) => {
    if (!data || data.length === 0 || focused) return;
    
    // One-time snap on data arrival
    if (!initialized.current) {
      const topAnomaly = data.reduce((prev, current) => (prev.score > current.score) ? prev : current);
      camera.position.set(
        (topAnomaly.x * 10) + 5, 
        (topAnomaly.y * 10) + 5, 
        (topAnomaly.z * 10) + 5
      );
      initialized.current = true;
    }
    
    const endPos = new THREE.Vector3(0, 0, 25);
    camera.position.lerp(endPos, 0.05); 
    camera.lookAt(0, 0, 0);

    if (camera.position.distanceTo(endPos) < 0.1) {
      setFocused(true);
    }
  });
  
  return null;
};

export default function AnomalyGalaxy({ datasetId }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoverInfo, setHoverInfo] = useState(null);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [status, setStatus] = useState('INITIAL'); // INITIAL, PENDING, RUNNING, COMPLETED, FAILED

  const fetchEmbedding = useCallback(async (isPolling = false) => {
    try {
      if (!isPolling) setLoading(true);
      const res = await client.get(`datasets/${datasetId}/embedding/`);
      
      // If we're here, it's 200 OK
      const responseData = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      
      if (Array.isArray(responseData) && responseData.length > 0) {
        setData(responseData);
        setError(null);
        setStatus('COMPLETED');
      } else {
        if (!isPolling) setError("No embedding data found.");
      }
    } catch (err) {
      const serverStatus = err.response?.data?.status || 'FAILED';
      setStatus(serverStatus);
      
      if (serverStatus === 'PENDING' || serverStatus === 'RUNNING') {
        setError(null); // Clear error if it's just in progress
      } else {
        setError(err.response?.data?.detail || "Failed to load 3D embedding.");
      }
    } finally {
      if (!isPolling) setLoading(false);
    }
  }, [datasetId]);

  useEffect(() => {
    fetchEmbedding();
  }, [fetchEmbedding]);

  // Polling logic
  useEffect(() => {
    let interval;
    if (status === 'PENDING' || status === 'RUNNING') {
      interval = setInterval(() => {
        fetchEmbedding(true);
      }, 3000);
    } else if (status === 'FAILED') {
      if (interval) clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [status, fetchEmbedding]);

  const handleGenerate = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await client.post(`datasets/${datasetId}/generate-embedding/`, {});
      setStatus(res.data.status || 'PENDING');
    } catch (err) {
      if (err.response?.status === 400) {
        // Already in progress, start polling
        setStatus('PENDING');
      } else {
        setError(err.response?.data?.detail || "Failed to start generation.");
      }
    } finally {
      setLoading(false);
    }
  };

  const isDataEmpty = !Array.isArray(data) || data.length === 0;
  const isProcessing = status === 'PENDING' || status === 'RUNNING';

  if (loading && isDataEmpty && !isProcessing) {
    return (
      <div className="w-full h-[600px] flex items-center justify-center bg-gray-900 rounded-lg border border-gray-800">
        <div className="text-blue-400 animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4"></div>
          Initializing 3D Pipeline...
        </div>
      </div>
    );
  }

  if (isProcessing && isDataEmpty) {
    return (
      <div className="w-full h-[600px] flex flex-col items-center justify-center bg-gray-900 rounded-lg border border-gray-800 p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/10 to-transparent pointer-events-none"></div>
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-20 h-20 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-8 shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
          <h3 className="text-xl font-bold text-white mb-2">Generating 3D Galaxy</h3>
          <p className="text-blue-300/70 text-sm max-w-xs text-center animate-pulse">
            Performing UMAP dimensionality reduction on high-dimensional feature space...
          </p>
          <div className="mt-8 flex space-x-2">
             <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
             <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
             <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error && isDataEmpty) {
    return (
      <div className="w-full h-[600px] flex flex-col items-center justify-center bg-gray-900 rounded-lg border border-gray-800 p-6">
        <div className="text-red-400 mb-6 text-center max-w-md bg-red-900/20 p-4 rounded-lg border border-red-900/50">
          <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          {error}
        </div>
        <button 
          onClick={handleGenerate}
          disabled={loading || isProcessing}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-900/20 flex items-center"
        >
          {loading ? 'Starting...' : 'Generate 3D Embedding'}
        </button>
      </div>
    );
  }

  return (
    <div className="w-full h-[600px] relative bg-black rounded-lg overflow-hidden border border-gray-800">
      <Canvas camera={{ position: [0, 0, 25], fov: 45 }}>
        <color attach="background" args={['#050505']} />
        <ambientLight intensity={0.5} />
        
        <GalaxyPoints 
          data={data} 
          onHover={(point, x, y) => setHoverInfo(point ? { point, x, y } : null)} 
          onClickPoint={setSelectedPoint} 
        />
        
        <CameraController data={data} />
        <OrbitControls 
          enableDamping 
          dampingFactor={0.05} 
          minDistance={2} 
          maxDistance={50} 
        />
      </Canvas>

      {/* Hover Tooltip HTML Overlay */}
      {hoverInfo && hoverInfo.point && (
        <div 
          className="absolute pointer-events-none z-10 bg-gray-900/90 border border-gray-700 p-3 rounded shadow-xl backdrop-blur-sm text-xs text-gray-200"
          style={{ 
            left: hoverInfo.x + 15, 
            top: hoverInfo.y + 15,
            transform: 'translate(-50%, -100%)' // Shift to be slightly above the cursor
          }}
        >
          <div className="font-bold text-white mb-1 border-b border-gray-700 pb-1">
            Anomaly Score: {(hoverInfo.point.score * 100).toFixed(1)}%
          </div>
          <div>Cluster: {hoverInfo.point.cluster === -1 ? 'Noise (-1)' : hoverInfo.point.cluster}</div>
          
          {hoverInfo.point.feature_summary && (
            <div className="mt-2">
              {hoverInfo.point.feature_summary.top_positive?.length > 0 && (
                <div className="mb-1">
                  <span className="text-red-400 font-semibold">High:</span>
                  <ul className="pl-2">
                    {hoverInfo.point.feature_summary.top_positive.map((f, i) => (
                      <li key={i}>{f.feature}</li>
                    ))}
                  </ul>
                </div>
              )}
              {hoverInfo.point.feature_summary.top_negative?.length > 0 && (
                <div>
                  <span className="text-blue-400 font-semibold">Low:</span>
                  <ul className="pl-2">
                    {hoverInfo.point.feature_summary.top_negative.map((f, i) => (
                      <li key={i}>{f.feature}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      
      {/* Selection Panel HTML Overlay */}
      {selectedPoint && (
        <div className="absolute bottom-4 right-4 bg-gray-900/95 border border-gray-700 p-4 rounded-lg shadow-2xl w-64 text-sm text-gray-300">
          <div className="flex justify-between items-start mb-2 border-b border-gray-700 pb-2">
            <h3 className="font-bold text-white">Selected Anomaly</h3>
            <button 
              onClick={() => setSelectedPoint(null)}
              className="text-gray-500 hover:text-white"
            >
              ✕
            </button>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Score:</span>
              <span className={selectedPoint.score > 0.8 ? "text-red-400" : selectedPoint.score > 0.5 ? "text-orange-400" : "text-blue-400"}>
                {(selectedPoint.score * 100).toFixed(2)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span>Cluster ID:</span>
              <span>{selectedPoint.cluster}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
