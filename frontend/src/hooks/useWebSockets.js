import { useEffect, useState, useRef, useCallback } from 'react';

const useWebSockets = (onMessage) => {
    const [status, setStatus] = useState('connecting');
    const ws = useRef(null);

    const connect = useCallback(() => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            setStatus('unauthorized');
            return;
        }

        // Using query param for minimal JWT auth in Channels
        const wsUrl = `ws://${window.location.hostname}:8000/ws/notifications/?token=${token}`;
        
        ws.current = new WebSocket(wsUrl);

        ws.current.onopen = () => {
            console.log('WebSocket Connected');
            setStatus('connected');
        };

        ws.current.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (onMessage) onMessage(data);
        };

        ws.current.onclose = () => {
            console.log('WebSocket Disconnected');
            setStatus('disconnected');
            // Simple reconnect logic
            setTimeout(connect, 3000);
        };

        ws.current.onerror = (err) => {
            console.error('WebSocket Error', err);
            ws.current.close();
        };
    }, [onMessage]);

    useEffect(() => {
        connect();
        return () => {
            if (ws.current) ws.current.close();
        };
    }, [connect]);

    return { status };
};

export default useWebSockets;
