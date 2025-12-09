import { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';

const SERVER_URL = "http://localhost:4000";

export const useSocket = () => {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    socketRef.current = io(SERVER_URL);

    socketRef.current.on('connect', () => {
      setIsConnected(true);
    });

    socketRef.current.on('disconnect', () => {
      setIsConnected(false);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  return socketRef.current;
};