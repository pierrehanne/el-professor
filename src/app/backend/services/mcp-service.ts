import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js'

type MCPClient = Client<any, any, any>

export class MCPService {
  private clients: Map<string, MCPClient> = new Map()
  private initialized = false

  async initialize() {
    if (this.initialized) return

    try {
      // AWS Documentation MCP Server
      await this.initializeClient('aws-docs', 'awslabs.aws-documentation-mcp-server@latest')

      // Terraform MCP Server
      await this.initializeClient('terraform', 'awslabs.terraform-mcp-server@latest')

      // AWS Diagram MCP Server
      await this.initializeClient('diagram', 'awslabs.aws-diagram-mcp-server@latest')

      this.initialized = true
      console.log('✅ MCP Services initialized successfully')
    } catch (error) {
      console.error('Failed to initialize MCP clients:', error)
    }
  }

  private async initializeClient(name: string, packageName: string) {
    try {
      const transport = new StdioClientTransport({
        command: 'uvx',
        args: [packageName],
        env: { FASTMCP_LOG_LEVEL: 'ERROR' },
      })

      const client = new Client({ name: `${name}-client`, version: '1.0.0' }, { capabilities: {} })

      await client.connect(transport)
      this.clients.set(name, client)
      console.log(`✅ ${name} MCP client connected`)
    } catch (error) {
      console.error(`Failed to initialize ${name} MCP client:`, error)
    }
  }

  async getRelevantContext(query: string): Promise<string> {
    if (!this.initialized) {
      await this.initialize()
    }

    let context = ''
    const lowerQuery = query.toLowerCase()

    try {
      // AWS Documentation
      if (lowerQuery.includes('aws') || lowerQuery.includes('cloud')) {
        const awsContext = await this.queryMCPServer('aws-docs', 'search_documentation', {
          search_phrase: query,
          limit: 3,
        })
        if (awsContext) {
          context += `AWS Documentation Context: ${JSON.stringify(awsContext)}\n`
        }
      }

      // Terraform Documentation
      if (lowerQuery.includes('terraform') || lowerQuery.includes('infrastructure')) {
        const terraformContext = await this.queryMCPServer('terraform', 'SearchAwsProviderDocs', {
          asset_name: query,
        })
        if (terraformContext) {
          context += `Terraform Context: ${JSON.stringify(terraformContext)}\n`
        }
      }

    } catch (error) {
      console.error('Error getting MCP context:', error)
    }

    return context
  }

  private async queryMCPServer(clientName: string, toolName: string, args: any): Promise<any> {
    const client = this.clients.get(clientName)
    if (!client) return null

    try {
      const result = await Promise.race([
        client.request({
          method: 'tools/call',
          params: {
            name: toolName,
            arguments: args,
          },
        }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('MCP Timeout')), 5000)),
      ])
      return result
    } catch (error) {
      console.error(`${clientName} query failed:`, error)
      return null
    }
  }

  async generateDiagram(description: string): Promise<string | null> {
    if (!this.initialized) {
      await this.initialize()
    }

    try {
      const result = await this.queryMCPServer('diagram', 'generate_diagram', {
        code: description,
      })
      return result ? String(result) : null
    } catch (error) {
      console.error('Diagram generation failed:', error)
      return null
    }
  }

  async cleanup() {
    const clientEntries = Array.from(this.clients.entries())
    for (const [name, client] of clientEntries) {
      try {
        await client.close()
        console.log(`✅ ${name} MCP client closed`)
      } catch (error) {
        console.error(`Failed to close ${name} client:`, error)
      }
    }
    this.clients.clear()
    this.initialized = false
  }
}

// Singleton instance
export const mcpService = new MCPService()
