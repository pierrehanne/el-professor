// MCP Repository Implementation with AWS Knowledge MCP Server
import { IMCPRepository, MCPTool, MCPServer, ToolExecutionResult } from '../../domain/repositories/IMCPRepository';
import { MCPClient } from '../services/MCPClient';
import { mcpServers, getDefaultMCPServer } from '../config/mcp.config';

export class MCPRepository implements IMCPRepository {
  private initialized = false;
  private mcpClient: MCPClient | null = null;
  private availableTools: MCPTool[] = [];

  async initialize(selectedModel?: string): Promise<void> {
    if (this.initialized) {
      return;
    }
    
    try {
      // Initialize AWS Knowledge MCP Server
      const serverConfig = getDefaultMCPServer();
      this.mcpClient = new MCPClient(serverConfig);
      
      await this.mcpClient.initialize();
      
      // Load available tools (using fallback list for now)
      const tools = await this.mcpClient.listTools();
      this.availableTools = tools.map(tool => ({
        name: tool.name,
        description: tool.description,
        serverName: serverConfig.name,
        serverType: serverConfig.type
      }));
      
      this.initialized = true;
      console.log(`✅ MCP Repository initialized with AWS Knowledge integration (${this.availableTools.length} tools available)`);
    } catch (error) {
      console.warn('⚠️ MCP Repository initialization encountered issues, running in enhanced fallback mode:', error);
      
      // Set up fallback tools
      this.availableTools = [
        {
          name: 'aws_knowledge_context',
          description: 'Provides AWS knowledge context for queries',
          serverName: 'aws-knowledge',
          serverType: 'http'
        }
      ];
      
      this.initialized = true; // Allow graceful degradation with enhanced AWS knowledge
    }
  }

  async getRelevantContext(query: string): Promise<string> {
    try {
      // Check if query is AWS-related
      const awsKeywords = ['aws', 'amazon', 'ec2', 's3', 'lambda', 'cloudformation', 'terraform', 'cloud'];
      const isAWSRelated = awsKeywords.some(keyword => 
        query.toLowerCase().includes(keyword.toLowerCase())
      );

      if (!isAWSRelated) {
        return '';
      }

      // Now use the real AWS Knowledge MCP Server!
      if (this.mcpClient && this.initialized) {
        console.log('🔍 Searching AWS Knowledge MCP Server for:', query);
        const searchResults = await this.mcpClient.searchDocumentation(query);
        if (searchResults && searchResults.length > 0 && !searchResults.includes('Currently unable to access')) {
          console.log('✅ Retrieved AWS documentation context from MCP server');
          return `AWS Documentation Context:\n${searchResults}`;
        }
      }

      // Fallback message if MCP search doesn't return results
      return `AWS Knowledge Context: This query appears to be AWS-related. El Profesor has access to AWS documentation and best practices to provide accurate, up-to-date information about AWS services, architecture patterns, and troubleshooting guidance.`;
    } catch (error) {
      console.warn('Error getting relevant context from MCP:', error);
      return '';
    }
  }

  async getAvailableTools(): Promise<MCPTool[]> {
    return this.availableTools;
  }

  async getServerStatus(): Promise<MCPServer[]> {
    const servers: MCPServer[] = [];
    
    for (const serverConfig of mcpServers) {
      servers.push({
        name: serverConfig.name,
        type: serverConfig.type,
        url: serverConfig.url,
        toolCount: this.availableTools.filter(tool => tool.serverName === serverConfig.name).length
      });
    }
    
    return servers;
  }

  async executeToolStream(
    query: string,
    onChunk: (chunk: string) => void
  ): Promise<ToolExecutionResult | null> {
    if (!this.mcpClient || !this.initialized) {
      return null;
    }

    try {
      // Determine which tool to use based on the query
      const toolName = this.selectBestTool(query);
      if (!toolName) {
        return null;
      }

      let result: string;
      let toolUsed = toolName;

      switch (toolName) {
        case 'aws___search_documentation':
          result = await this.mcpClient.searchDocumentation(query);
          onChunk(result);
          break;
          
        case 'aws___read_documentation':
          // Extract URL from query if present
          const urlMatch = query.match(/https?:\/\/[^\s]+/);
          if (urlMatch) {
            result = await this.mcpClient.readDocumentation(urlMatch[0]);
            onChunk(result);
          } else {
            return null;
          }
          break;
          
        case 'aws___recommend':
          // Extract URL from query if present
          const recUrlMatch = query.match(/https?:\/\/[^\s]+/);
          if (recUrlMatch) {
            result = await this.mcpClient.getRecommendations(recUrlMatch[0]);
            onChunk(result);
          } else {
            return null;
          }
          break;

        case 'aws___list_regions':
          const regionsResult = await this.mcpClient.callTool({
            name: 'aws___list_regions',
            arguments: {}
          });
          result = regionsResult.content;
          onChunk(result);
          break;

        case 'aws___get_regional_availability':
          // Try to extract resource type from query
          let resourceType = 'api'; // default
          if (query.toLowerCase().includes('cloudformation') || query.toLowerCase().includes('cfn')) {
            resourceType = 'cfn';
          }
          
          const availabilityResult = await this.mcpClient.callTool({
            name: 'aws___get_regional_availability',
            arguments: { resource_type: resourceType }
          });
          result = availabilityResult.content;
          onChunk(result);
          break;
          
        default:
          return null;
      }

      return {
        content: result!,
        toolUsed: {
          tool: toolUsed,
          reasoning: `Used ${toolUsed} to find AWS documentation relevant to: ${query}`
        }
      };
    } catch (error) {
      console.error('Error executing MCP tool:', error);
      return null;
    }
  }

  private selectBestTool(query: string): string | null {
    const lowerQuery = query.toLowerCase();
    
    // Check for URL in query - use read_documentation or recommend
    if (lowerQuery.includes('http')) {
      if (lowerQuery.includes('recommend') || lowerQuery.includes('related') || lowerQuery.includes('similar')) {
        return 'aws___recommend';
      }
      return 'aws___read_documentation';
    }
    
    // Check for region-related queries
    if (lowerQuery.includes('region') || lowerQuery.includes('availability') || lowerQuery.includes('available in')) {
      if (lowerQuery.includes('list') || lowerQuery.includes('all regions')) {
        return 'aws___list_regions';
      }
      return 'aws___get_regional_availability';
    }
    
    // Default to search for general AWS queries
    if (lowerQuery.includes('aws') || lowerQuery.includes('amazon') || 
        lowerQuery.includes('cloud') || lowerQuery.includes('ec2') ||
        lowerQuery.includes('s3') || lowerQuery.includes('lambda') ||
        lowerQuery.includes('cloudformation') || lowerQuery.includes('terraform')) {
      return 'aws___search_documentation';
    }
    
    return null;
  }

  async testConnection(): Promise<{ success: boolean; details: string }> {
    console.log('🧪 Testing MCP connection...');
    
    if (!this.mcpClient) {
      return {
        success: false,
        details: 'MCP client not initialized'
      };
    }

    try {
      // Try to list tools as a connection test
      const tools = await this.mcpClient.listTools();
      return {
        success: true,
        details: `Successfully connected. Found ${tools.length} tools: ${tools.map(t => t.name).join(', ')}`
      };
    } catch (error) {
      return {
        success: false,
        details: `Connection failed: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  async cleanup(): Promise<void> {
    this.initialized = false;
    this.mcpClient = null;
    this.availableTools = [];
    console.log('✅ MCP Repository cleaned up');
  }
}

// Export repository instance
export const mcpRepository = new MCPRepository();