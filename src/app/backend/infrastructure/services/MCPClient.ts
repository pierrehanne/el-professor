// MCP Client for AWS Knowledge Server
import { MCPServerConfig } from '../config/mcp.config';

export interface MCPToolCall {
  name: string;
  arguments: Record<string, any>;
}

export interface MCPToolResult {
  content: string;
  isError?: boolean;
}

export interface MCPTool {
  name: string;
  description?: string;
  inputSchema?: any;
}

export class MCPClient {
  private serverConfig: MCPServerConfig;
  private baseUrl: string;

  constructor(serverConfig: MCPServerConfig) {
    this.serverConfig = serverConfig;
    this.baseUrl = serverConfig.url;
  }

  async initialize(): Promise<void> {
    console.log(`🚀 Initializing AWS Knowledge MCP Server: ${this.serverConfig.name}`);
    console.log(`📡 Server URL: ${this.serverConfig.url}`);
    
    // Test different possible endpoints
    await this.testConnection();
  }

  private async testConnection(): Promise<void> {
    const testEndpoints = [
      '', // Root path
      '/mcp', // Common MCP path
      '/api/mcp', // API path
      '/jsonrpc', // JSON-RPC path
    ];

    for (const endpoint of testEndpoints) {
      try {
        console.log(`🔍 Testing endpoint: ${this.baseUrl}${endpoint}`);
        
        // Try a simple JSON-RPC request
        const testRequest = {
          jsonrpc: "2.0",
          id: 1,
          method: "initialize",
          params: {
            protocolVersion: "2024-11-05",
            capabilities: {},
            clientInfo: {
              name: "El-Profesor",
              version: "1.0.0"
            }
          }
        };

        await this.makeRequest(endpoint, 'POST', testRequest);
        console.log(`✅ Successfully connected to endpoint: ${endpoint}`);
        return; // Success, stop testing
      } catch (error) {
        console.log(`❌ Endpoint ${endpoint} failed:`, error instanceof Error ? error.message : error);
      }
    }
    
    console.warn('⚠️ All endpoint tests failed, will use graceful degradation');
  }

  async listTools(): Promise<MCPTool[]> {
    console.log('🔧 Attempting to list MCP tools...');
    
    try {
      const mcpRequest = {
        jsonrpc: "2.0",
        id: Date.now(),
        method: "tools/list",
        params: {}
      };

      console.log('📋 JSON-RPC Request for tools/list:', mcpRequest);
      const response = await this.makeRequest('', 'POST', mcpRequest);

      if (response.result && response.result.tools) {
        console.log(`✅ Successfully retrieved ${response.result.tools.length} tools from MCP server`);
        return response.result.tools.map((tool: any) => ({
          name: tool.name,
          description: tool.description,
          inputSchema: tool.inputSchema
        }));
      } else {
        console.warn('⚠️ MCP response missing result.tools, using fallback');
        console.log('📄 Full response:', response);
      }
    } catch (error) {
      console.error('❌ Could not list AWS Knowledge MCP tools, using fallback:', error);
    }

    // Return known AWS Knowledge MCP Server tools as fallback
    console.log('📋 Using fallback tool list for AWS Knowledge MCP Server');
    return [
      {
        name: 'search_documentation',
        description: 'Search across all AWS documentation'
      },
      {
        name: 'read_documentation', 
        description: 'Retrieve and convert AWS documentation pages to markdown'
      },
      {
        name: 'recommend',
        description: 'Get content recommendations for AWS documentation pages'
      },
      {
        name: 'list_regions',
        description: 'Retrieve a list of all AWS regions (Experimental)'
      },
      {
        name: 'get_regional_availability',
        description: 'Retrieve AWS regional availability information (Experimental)'
      }
    ];
  }

  async callTool(toolCall: MCPToolCall): Promise<MCPToolResult> {
    console.log(`🔧 Calling MCP tool: ${toolCall.name}`);
    console.log(`📋 Tool arguments:`, toolCall.arguments);
    
    try {
      // Use proper JSON-RPC 2.0 MCP protocol format
      const mcpRequest = {
        jsonrpc: "2.0",
        id: Date.now(),
        method: "tools/call",
        params: {
          name: toolCall.name,
          arguments: toolCall.arguments
        }
      };

      console.log('📋 JSON-RPC Request for tools/call:', mcpRequest);
      const response = await this.makeRequest('', 'POST', mcpRequest);

      console.log('📄 MCP Tool Response:', response);

      if (response.result && response.result.content) {
        const content = response.result.content;
        console.log('✅ Tool call successful, processing content...');
        
        const processedContent = Array.isArray(content) 
          ? content.map((c: any) => c.text || c.content || String(c)).join('\n')
          : content.text || content.content || String(content);
          
        console.log(`📄 Processed content (${processedContent.length} chars):`, processedContent.substring(0, 200) + '...');
        
        return {
          content: processedContent,
          isError: false
        };
      }

      if (response.error) {
        console.error('❌ MCP Server returned error:', response.error);
        return {
          content: `MCP Error: ${response.error.message || response.error}`,
          isError: true
        };
      }

      console.warn('⚠️ MCP response missing result.content');
      return {
        content: 'No content returned from AWS Knowledge MCP Server',
        isError: true
      };
    } catch (error) {
      console.error(`❌ Error calling AWS Knowledge tool ${toolCall.name}:`, error);
      return {
        content: `Currently unable to access AWS documentation. Please try again later.`,
        isError: true
      };
    }
  }

  async searchDocumentation(query: string): Promise<string> {
    const result = await this.callTool({
      name: 'aws___search_documentation',
      arguments: { search_phrase: query, limit: 5 }
    });
    return result.content;
  }

  async readDocumentation(url: string): Promise<string> {
    const result = await this.callTool({
      name: 'aws___read_documentation',
      arguments: { url, max_length: 5000 }
    });
    return result.content;
  }

  async getRecommendations(url: string): Promise<string> {
    const result = await this.callTool({
      name: 'aws___recommend',
      arguments: { url }
    });
    return result.content;
  }

  private async makeRequest(endpoint: string, method: 'GET' | 'POST', body?: any): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`;
    const requestBody = body ? JSON.stringify(body) : undefined;
    
    const options: RequestInit = {
      method,
      headers: {
        ...this.serverConfig.headers,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      ...(requestBody && { body: requestBody })
    };

    // 🔍 DETAILED LOGGING
    console.log('🚀 MCP Request Details:');
    console.log(`📡 URL: ${url}`);
    console.log(`🔧 Method: ${method}`);
    console.log(`📋 Headers:`, options.headers);
    if (requestBody) {
      console.log(`📦 Request Body:`, requestBody);
      console.log(`📝 Parsed Request:`, body);
    }

    try {
      const response = await fetch(url, options);
      
      console.log(`📊 Response Status: ${response.status} ${response.statusText}`);
      console.log(`📋 Response Headers:`, Object.fromEntries(response.headers.entries()));
      
      const responseText = await response.text();
      console.log(`📄 Raw Response (first 500 chars):`, responseText.substring(0, 500));
      
      if (!response.ok) {
        console.error(`❌ HTTP Error ${response.status}: ${response.statusText}`);
        console.error(`📄 Error Response:`, responseText.substring(0, 1000));
        throw new Error(`HTTP ${response.status}: ${response.statusText}. Response: ${responseText.substring(0, 200)}`);
      }

      // Check if response is HTML (error page)
      if (responseText.trim().startsWith('<!DOCTYPE') || responseText.trim().startsWith('<html')) {
        console.error('❌ Received HTML response instead of JSON');
        console.error('🔍 This suggests the server endpoint may be incorrect or the server doesn\'t support direct HTTP MCP access');
        throw new Error('Received HTML response instead of JSON - server may not support direct HTTP access');
      }

      try {
        const parsedResponse = JSON.parse(responseText);
        console.log('✅ Successfully parsed JSON response:', parsedResponse);
        return parsedResponse;
      } catch (parseError) {
        console.error('❌ JSON Parse Error:', parseError);
        console.error('📄 Response that failed to parse:', responseText);
        throw new Error(`Invalid JSON response: ${responseText.substring(0, 200)}`);
      }
    } catch (fetchError) {
      console.error('❌ Fetch Error:', fetchError);
      throw fetchError;
    }
  }
}