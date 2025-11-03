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
  onRemoteControl: (action: string, data?: any) => void,
  onError?: (title: string, description: string) => void
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
    try {
      const peer = new Peer({
        debug: 2,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
          ]
        }
      });
      peerRef.current = peer;

      peer.on('open', (id) => {
        console.log('Room created with ID:', id);
        setState(prev => ({
          ...prev,
          isHost: true,
          roomCode: id,
          peer,
        }));
      });

      peer.on('connection', (conn) => {
        console.log('Guest connected:', conn.peer);
        connectionRef.current = conn;
        
        conn.on('open', () => {
          console.log('Connection established with guest');
          setState(prev => ({
            ...prev,
            isConnected: true,
            connectedUser: conn.peer,
          }));
        });

        conn.on('close', () => {
          console.log('Guest disconnected');
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

        conn.on('error', (err) => {
          console.error('Connection error:', err);
        });
      });

      peer.on('error', (err) => {
        console.error('Peer error:', err.type, err);
        if (err.type === 'peer-unavailable') {
          onError?.(
            'Connection Failed',
            'Could not connect to peer. Please check the room code.'
          );
        }
      });

      peer.on('disconnected', () => {
        console.log('Peer disconnected, attempting to reconnect...');
        peer.reconnect();
      });
    } catch (err) {
      console.error('Failed to create room:', err);
    }
  };

  const joinRoom = (roomCode: string) => {
    try {
      const peer = new Peer({
        debug: 2,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
          ]
        }
      });
      peerRef.current = peer;

      peer.on('open', (id) => {
        console.log('Guest peer opened, connecting to room:', roomCode);
        const conn = peer.connect(roomCode, {
          reliable: true,
        });
        connectionRef.current = conn;

        conn.on('open', () => {
          console.log('Successfully connected to host');
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
          console.log('Connection closed');
          setState(prev => ({
            ...prev,
            isConnected: false,
            connectedUser: null,
          }));
        });

        conn.on('error', (err) => {
          console.error('Connection error:', err);
        });
      });

      peer.on('error', (err) => {
        console.error('Peer error:', err.type, err);
        if (err.type === 'peer-unavailable') {
          onError?.(
            'Room Not Found',
            'Room not found. Please check the room code and try again.'
          );
        } else if (err.type === 'network') {
          onError?.(
            'Network Error',
            'Network error. Please check your internet connection.'
          );
        }
      });

      peer.on('disconnected', () => {
        console.log('Peer disconnected, attempting to reconnect...');
        peer.reconnect();
      });
    } catch (err) {
      console.error('Failed to join room:', err);
    }
  };

  const sendControl = (action: string, data?: any) => {
    if (connectionRef.current && state.isHost && connectionRef.current.open) {
      console.log('Sending control:', action, data);
      try {
        connectionRef.current.send({ action, data });
      } catch (err) {
        console.error('Failed to send control:', err);
      }
    }
  };

  const sendMessage = (message: string) => {
    if (connectionRef.current && connectionRef.current.open) {
      console.log('Sending message:', message);
      try {
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
      } catch (err) {
        console.error('Failed to send message:', err);
      }
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
