import { useEffect, useState, useRef, useCallback } from 'react';

const useWebSockets = (onMessage) => {
    const [status, setStatus] = useState('connecting');
    const ws = useRef(null);
    const reconnectTimer = useRef(null);
    const reconnectDelay = useRef(1000);

    const connect = useCallback(() => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            setStatus('unauthorized');
            return;
        }

        // Clear existing reconnect timer if any
        if (reconnectTimer.current) {
            clearTimeout(reconnectTimer.current);
        }

        const wsUrl = `ws://${window.location.hostname}:8000/ws/notifications/?token=${token}`;
        
        console.log(`Attempting WebSocket connection (Delay: ${reconnectDelay.current}ms)`);
        ws.current = new WebSocket(wsUrl);

        ws.current.onopen = () => {
            console.log('WebSocket Connected');
            setStatus('connected');
            reconnectDelay.current = 1000; // Reset delay on success
        };

        ws.current.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (onMessage) onMessage(data);
        };

        ws.current.onclose = () => {
            console.log('WebSocket Disconnected');
            setStatus('disconnected');
            
            // Exponential Backoff Logic: 1s -> 2s -> 4s -> 8s -> max 30s
            const nextDelay = Math.min(reconnectDelay.current * 2, 30000);
            
            reconnectTimer.current = setTimeout(() => {
                reconnectDelay.current = nextDelay;
                connect();
            }, reconnectDelay.current);
        };

        ws.current.onerror = (err) => {
            console.error('WebSocket Error', err);
            ws.current.close();
        };
    }, [onMessage]);

    useEffect(() => {
        connect();
        return () => {
            if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
            if (ws.current) ws.current.close();
        };
    }, [connect]);

    return { status };
};

export default useWebSockets;
