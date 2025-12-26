import { useEffect, useState, useCallback, useRef } from 'react';
import * as signalR from '@microsoft/signalr';
import { GroceryItem } from '../types';

/**
 * Hub method names - must match server-side constants
 */
const HUB_METHODS = {
  ITEM_CREATED: 'itemCreated',
  ITEM_UPDATED: 'itemUpdated',
  ITEM_DELETED: 'itemDeleted',
} as const;

export type SignalRConnectionState = 'disconnected' | 'connecting' | 'connected' | 'reconnecting';

export interface SignalRHandlers {
  onItemCreated?: (item: GroceryItem) => void;
  onItemUpdated?: (item: GroceryItem) => void;
  onItemDeleted?: (id: string) => void;
}

/**
 * Custom hook for managing SignalR connection and real-time updates
 * Handles connection lifecycle, automatic reconnection, and message handlers
 */
export function useSignalR(handlers: SignalRHandlers) {
  const [connectionState, setConnectionState] = useState<SignalRConnectionState>('disconnected');
  const [error, setError] = useState<string | null>(null);
  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const handlersRef = useRef(handlers);

  // Update handlers ref when they change (without triggering reconnection)
  useEffect(() => {
    handlersRef.current = handlers;
  }, [handlers]);

  const connect = useCallback(async () => {
    // Don't create a new connection if already connected or connecting
    if (connectionRef.current?.state === signalR.HubConnectionState.Connected ||
        connectionRef.current?.state === signalR.HubConnectionState.Connecting) {
      return;
    }

    try {
      setConnectionState('connecting');
      setError(null);

      // Create connection
      const connection = new signalR.HubConnectionBuilder()
        .withUrl('/api/negotiate', {
          skipNegotiation: false,
        })
        .withAutomaticReconnect({
          nextRetryDelayInMilliseconds: (retryContext) => {
            // Exponential backoff: 2s, 5s, 10s, 30s, 60s
            const delays = [2000, 5000, 10000, 30000, 60000];
            return delays[Math.min(retryContext.previousRetryCount, delays.length - 1)];
          }
        })
        .configureLogging(signalR.LogLevel.Information)
        .build();

      // Set up event handlers
      connection.on(HUB_METHODS.ITEM_CREATED, (item: GroceryItem) => {
        console.log('SignalR: Item created', item);
        handlersRef.current.onItemCreated?.(item);
      });

      connection.on(HUB_METHODS.ITEM_UPDATED, (item: GroceryItem) => {
        console.log('SignalR: Item updated', item);
        handlersRef.current.onItemUpdated?.(item);
      });

      connection.on(HUB_METHODS.ITEM_DELETED, (id: string) => {
        console.log('SignalR: Item deleted', id);
        handlersRef.current.onItemDeleted?.(id);
      });

      // Set up connection lifecycle handlers
      connection.onreconnecting(() => {
        console.log('SignalR: Reconnecting...');
        setConnectionState('reconnecting');
        setError(null);
      });

      connection.onreconnected(() => {
        console.log('SignalR: Reconnected');
        setConnectionState('connected');
        setError(null);
      });

      connection.onclose((error) => {
        console.log('SignalR: Connection closed', error);
        setConnectionState('disconnected');
        if (error) {
          setError(`Connection closed: ${error.message}`);
        }
      });

      // Start the connection
      await connection.start();
      connectionRef.current = connection;
      setConnectionState('connected');
      console.log('SignalR: Connected successfully');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to connect to SignalR';
      console.error('SignalR connection error:', err);
      setConnectionState('disconnected');
      setError(message);
    }
  }, []);

  const disconnect = useCallback(async () => {
    if (connectionRef.current) {
      try {
        await connectionRef.current.stop();
        connectionRef.current = null;
        setConnectionState('disconnected');
        console.log('SignalR: Disconnected');
      } catch (err) {
        console.error('Error disconnecting from SignalR:', err);
      }
    }
  }, []);

  // Connect on mount, disconnect on unmount
  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    connectionState,
    error,
    connect,
    disconnect,
  };
}
