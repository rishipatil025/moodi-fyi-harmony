import { useState, useEffect, useRef } from 'react';
import Peer, { DataConnection } from 'peerjs';

export interface ChatMessage {
  id: string;
  message: string;
  timestamp: Date;
  isOwn: boolean;
}

export interface ListenTogetherState {
  isHost: boolean;
  isConnected: boolean;
  roomCode: string | null;
  connectedUser: string | null;
  peer: Peer | null;
  messages: ChatMessage[];
}

export const useListenTogether = (
  onRemoteControl: (action: string, data?: any) => void
) => {
  const [state, setState] = useState<ListenTogetherState>({
    isHost: false,
    isConnected: false,
    roomCode: null,
    connectedUser: null,
    peer: null,
    messages: [],
  });

  const connectionRef = useRef<DataConnection | null>(null);
  const peerRef = useRef<Peer | null>(null);

  useEffect(() => {
    return () => {
      if (connectionRef.current) {
        connectionRef.current.close();
      }
      if (peerRef.current) {
        peerRef.current.destroy();
      }
    };
  }, []);

  const createRoom = () => {
    const peer = new Peer();
    peerRef.current = peer;

    peer.on('open', (id) => {
      setState(prev => ({
        ...prev,
        isHost: true,
        roomCode: id,
        peer,
      }));
    });

    peer.on('connection', (conn) => {
      connectionRef.current = conn;
      
      conn.on('open', () => {
        setState(prev => ({
          ...prev,
          isConnected: true,
          connectedUser: conn.peer,
        }));
      });

      conn.on('close', () => {
        setState(prev => ({
          ...prev,
          isConnected: false,
          connectedUser: null,
        }));
      });

      conn.on('data', (data: any) => {
        console.log('Host received:', data);
        if (data.type === 'chat') {
          setState(prev => ({
            ...prev,
            messages: [...prev.messages, {
              id: Date.now().toString(),
              message: data.message,
              timestamp: new Date(),
              isOwn: false,
            }],
          }));
        }
      });
    });

    peer.on('error', (err) => {
      console.error('Peer error:', err);
    });
  };

  const joinRoom = (roomCode: string) => {
    const peer = new Peer();
    peerRef.current = peer;

    peer.on('open', () => {
      const conn = peer.connect(roomCode);
      connectionRef.current = conn;

      conn.on('open', () => {
        setState(prev => ({
          ...prev,
          isHost: false,
          isConnected: true,
          roomCode,
          connectedUser: roomCode,
          peer,
        }));
      });

      conn.on('data', (data: any) => {
        console.log('Guest received:', data);
        if (data.action) {
          onRemoteControl(data.action, data.data);
        }
        if (data.type === 'chat') {
          setState(prev => ({
            ...prev,
            messages: [...prev.messages, {
              id: Date.now().toString(),
              message: data.message,
              timestamp: new Date(),
              isOwn: false,
            }],
          }));
        }
      });

      conn.on('close', () => {
        setState(prev => ({
          ...prev,
          isConnected: false,
          connectedUser: null,
        }));
      });
    });

    peer.on('error', (err) => {
      console.error('Peer error:', err);
    });
  };

  const sendControl = (action: string, data?: any) => {
    if (connectionRef.current && state.isHost) {
      connectionRef.current.send({ action, data });
    }
  };

  const sendMessage = (message: string) => {
    if (connectionRef.current) {
      connectionRef.current.send({ type: 'chat', message });
      setState(prev => ({
        ...prev,
        messages: [...prev.messages, {
          id: Date.now().toString(),
          message,
          timestamp: new Date(),
          isOwn: true,
        }],
      }));
    }
  };

  const disconnect = () => {
    if (connectionRef.current) {
      connectionRef.current.close();
    }
    if (peerRef.current) {
      peerRef.current.destroy();
    }
    setState({
      isHost: false,
      isConnected: false,
      roomCode: null,
      connectedUser: null,
      peer: null,
      messages: [],
    });
  };

  return {
    state,
    createRoom,
    joinRoom,
    sendControl,
    sendMessage,
    disconnect,
  };
};
