import React, { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import axios from 'axios';

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
      // Scale size by distance to camera
      gl_PointSize = size * (200.0 / -mvPosition.z);
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    varying vec3 vColor;
    void main() {
      vec2 xy = gl_PointCoord.xy - vec2(0.5);
      float ll = length(xy);
      if(ll > 0.5) discard;
      
      // Radial gradient for additive blending glow
      float alpha = pow((0.5 - ll) * 2.0, 1.5);
      gl_FragColor = vec4(vColor, alpha);
    }
  `,
};

const GalaxyPoints = ({ data, onHover, onClickPoint }) => {
  const geometryRef = useRef();
  
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
      pos[i * 3] = d.x * 10; // Scale up the normalized [-1, 1] space for better camera manipulation
      pos[i * 3 + 1] = d.y * 10;
      pos[i * 3 + 2] = d.z * 10;
      
      // Interpolate color based on score (0 to 1)
      if (d.score < 0.5) {
        tempColor.lerpColors(colorLow, colorMed, d.score * 2);
      } else {
        tempColor.lerpColors(colorMed, colorHigh, (d.score - 0.5) * 2);
      }
      
      col[i * 3] = tempColor.r;
      col[i * 3 + 1] = tempColor.g;
      col[i * 3 + 2] = tempColor.b;
      
      // Size mapping: high anomaly gets much larger size (glow effect)
      sz[i] = 1.0 + (d.score * 4.0);
    });
    
    return { positions: pos, colors: col, sizes: sz };
  }, [data]);

  // Raycaster event handlers
  const handlePointerMove = useCallback((e) => {
    e.stopPropagation();
    if (e.index !== undefined) {
      document.body.style.cursor = 'pointer';
      // Throttle/Debounce in a real app, but R3F manages event frequency decently
      onHover(data[e.index], e.clientX, e.clientY);
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
  
  useEffect(() => {
    if (!data || data.length === 0 || focused) return;
    
    // Focus on top anomaly
    const topAnomaly = data.reduce((prev, current) => (prev.score > current.score) ? prev : current);
    
    // Start camera close to the top anomaly
    camera.position.set(
      (topAnomaly.x * 10) + 2, 
      (topAnomaly.y * 10) + 2, 
      (topAnomaly.z * 10) + 2
    );
    camera.lookAt(topAnomaly.x * 10, topAnomaly.y * 10, topAnomaly.z * 10);
    
    // Animate zoom out
    const duration = 2000;
    const startPos = camera.position.clone();
    const endPos = new THREE.Vector3(0, 0, 25);
    const startTime = performance.now();
    
    const animate = (time) => {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1.0);
      
      // Easing function (easeOutCubic)
      const ease = 1 - Math.pow(1 - progress, 3);
      
      camera.position.lerpVectors(startPos, endPos, ease);
      camera.lookAt(0, 0, 0); // Eventually look at center
      
      if (progress < 1.0) {
        requestAnimationFrame(animate);
      } else {
        setFocused(true);
      }
    };
    
    requestAnimationFrame(animate);
  }, [data, camera, focused]);
  
  return null;
};

export default function AnomalyGalaxy({ datasetId }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoverInfo, setHoverInfo] = useState(null);
  const [selectedPoint, setSelectedPoint] = useState(null);

  useEffect(() => {
    let active = true;
    const fetchEmbedding = async () => {
      try {
        setLoading(true);
        // Get JWT from storage if needed
        const token = localStorage.getItem('access_token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        
        const res = await axios.get(`/api/datasets/${datasetId}/embedding/`, { headers });
        if (active) {
          // Sometimes APIs wrap arrays in an object, handle if it's not an array directly
          const responseData = Array.isArray(res.data) ? res.data : (res.data?.data || []);
          
          if (!Array.isArray(responseData) || responseData.length === 0) {
             // Treat empty or invalid data as an error state if it's not currently loading
             if (!loading) setError("No embedding data found.");
          } else {
             setData(responseData);
             setError(null);
          }
        }
      } catch (err) {
        if (active) {
          setError(err.response?.data?.detail || "Failed to load 3D embedding. Please generate it first.");
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchEmbedding();
    return () => { active = false; };
  }, [datasetId]);

  const handleGenerate = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await axios.post(`/api/datasets/${datasetId}/generate-embedding/`, {}, { headers });
      setError("Generation started. Please wait and refresh in a few moments.");
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to start generation.");
    } finally {
      setLoading(false);
    }
  };

  const isDataEmpty = !Array.isArray(data) || data.length === 0;

  if (loading && isDataEmpty) {
    return (
      <div className="w-full h-96 flex items-center justify-center bg-gray-900 rounded-lg border border-gray-800">
        <div className="text-blue-400 animate-pulse">Loading 3D Galaxy...</div>
      </div>
    );
  }

  if (error && isDataEmpty) {
    return (
      <div className="w-full h-96 flex flex-col items-center justify-center bg-gray-900 rounded-lg border border-gray-800 p-6">
        <div className="text-red-400 mb-4 text-center">{error}</div>
        <button 
          onClick={handleGenerate}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
        >
          Generate Embedding
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
