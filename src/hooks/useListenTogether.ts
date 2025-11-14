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
  connectedUsers: string[];
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
    connectedUsers: [],
    peer: null,
    messages: [],
  });

  const connectionsRef = useRef<Map<string, DataConnection>>(new Map());
  const peerRef = useRef<Peer | null>(null);

  useEffect(() => {
    return () => {
      if (connectionsRef.current) {
        connectionsRef.current.forEach(conn => conn.close());
        connectionsRef.current.clear();
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
        connectionsRef.current.set(conn.peer, conn);
        
        conn.on('open', () => {
          console.log('Connection established with guest:', conn.peer);
          setState(prev => ({
            ...prev,
            isConnected: true,
            connectedUsers: Array.from(connectionsRef.current.keys()),
          }));
        });

        conn.on('close', () => {
          console.log('Guest disconnected:', conn.peer);
          connectionsRef.current.delete(conn.peer);
          setState(prev => ({
            ...prev,
            isConnected: connectionsRef.current.size > 0,
            connectedUsers: Array.from(connectionsRef.current.keys()),
          }));
        });

        conn.on('data', (data: any) => {
          console.log('[Host] Received data from guest:', conn.peer, data);
          if (data.type === 'chat') {
            console.log('[Host] Received chat message:', data.message);
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
        connectionsRef.current.set(roomCode, conn);

        conn.on('open', () => {
          console.log('Successfully connected to host');
          setState(prev => ({
            ...prev,
            isHost: false,
            isConnected: true,
            roomCode,
            connectedUsers: [roomCode],
            peer,
          }));
        });

        conn.on('data', (data: any) => {
          console.log('[Guest] Received data from host:', data);
          if (data.action) {
            onRemoteControl(data.action, data.data);
          }
          if (data.type === 'chat') {
            console.log('[Guest] Received chat message:', data.message);
            setState(prev => {
              const newMessages = [...prev.messages, {
                id: Date.now().toString(),
                message: data.message,
                timestamp: new Date(),
                isOwn: false,
              }];
              console.log('[Guest] Updated messages state:', newMessages);
              return {
                ...prev,
                messages: newMessages,
              };
            });
          }
        });

        conn.on('close', () => {
          console.log('Connection closed');
          setState(prev => ({
            ...prev,
            isConnected: false,
            connectedUsers: [],
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
    if (!state.isHost || connectionsRef.current.size === 0) {
      console.error('Cannot send control: not host or no connections');
      return;
    }
    
    console.log('[Host] Broadcasting control to', connectionsRef.current.size, 'guests:', action, data);
    const message = {
      type: 'control',
      action,
      data,
    };
    
    connectionsRef.current.forEach((conn, peerId) => {
      try {
        if (conn.open) {
          conn.send(message);
        }
      } catch (err) {
        console.error(`Failed to send control to ${peerId}:`, err);
      }
    });
  };

  const sendMessage = (message: string) => {
    console.log('[SendMessage] Attempting to send:', message);
    
    const connections = state.isHost 
      ? connectionsRef.current 
      : new Map([[state.roomCode || '', connectionsRef.current.get(state.roomCode || '') as DataConnection]]);
    
    console.log('[SendMessage] Broadcasting to', connections.size, 'connection(s)');

    if (connections.size === 0) {
      console.error('[SendMessage] No active connections');
      return;
    }

    const chatMessage = {
      type: 'chat',
      message,
    };

    let sentCount = 0;
    connections.forEach((conn, peerId) => {
      if (conn && conn.open) {
        try {
          conn.send(chatMessage);
          sentCount++;
          console.log('[SendMessage] Sent to peer:', peerId);
        } catch (err) {
          console.error('[SendMessage] Failed to send to', peerId, err);
        }
      }
    });

    if (sentCount > 0) {
      console.log('[SendMessage] Successfully sent to', sentCount, 'peer(s)');
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
    connectionsRef.current.forEach(conn => conn.close());
    connectionsRef.current.clear();
    if (peerRef.current) {
      peerRef.current.destroy();
      peerRef.current = null;
    }
    setState({
      isHost: false,
      isConnected: false,
      roomCode: null,
      connectedUsers: [],
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
