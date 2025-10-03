// Hook for monitoring MCP server status
'use client';

import { useState, useEffect } from 'react';

export interface MCPServer {
  name: string;
  info: {
    type: 'http' | 'sse' | 'stdio';
    url: string;
  };
  toolCount: number;
}

export interface MCPTool {
  name: string;
  description?: string;
  serverName: string;
  serverType: string;
}

export interface MCPStatus {
  servers: MCPServer[];
  tools: MCPTool[];
  currentModel: string;
}

export function useMCPStatus(selectedModel?: string) {
  const [status, setStatus] = useState<MCPStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStatus();
  }, [selectedModel]);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const url = selectedModel 
        ? `/api/chat/status?model=${selectedModel}`
        : '/api/chat/status';
        
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch MCP status');
      }
      
      const data = await response.json();
      setStatus(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const getServerByType = (type: 'http' | 'sse' | 'stdio') => {
    return status?.servers.filter(server => server.info.type === type) || [];
  };

  const getTotalToolCount = () => {
    return status?.tools.length || 0;
  };

  const getEnabledServerCount = () => {
    return status?.servers.length || 0;
  };

  return {
    status,
    loading,
    error,
    refetch: fetchStatus,
    getServerByType,
    getTotalToolCount,
    getEnabledServerCount
  };
}