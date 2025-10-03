// API route to test MCP connection
import { NextRequest, NextResponse } from 'next/server';
import { mcpRepository } from '@/app/backend/infrastructure/repositories/MCPRepository';

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Starting MCP connection test...');
    
    // Initialize MCP if not already done
    await mcpRepository.initialize();
    
    // Test the connection
    const testResult = await mcpRepository.testConnection();
    
    // Get server status
    const serverStatus = await mcpRepository.getServerStatus();
    
    // Get available tools
    const availableTools = await mcpRepository.getAvailableTools();
    
    const response = {
      timestamp: new Date().toISOString(),
      connectionTest: testResult,
      serverStatus,
      availableTools,
      message: testResult.success 
        ? 'MCP connection test successful' 
        : 'MCP connection test failed - check server logs for details'
    };
    
    console.log('📊 MCP Test Results:', response);
    
    return NextResponse.json(response, { 
      status: testResult.success ? 200 : 500 
    });
    
  } catch (error) {
    console.error('❌ MCP test endpoint error:', error);
    
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'MCP test failed with exception'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query } = body;
    
    if (!query) {
      return NextResponse.json({
        error: 'Query parameter required'
      }, { status: 400 });
    }
    
    console.log(`🔍 Testing MCP context retrieval for query: "${query}"`);
    
    // Initialize MCP if not already done
    await mcpRepository.initialize();
    
    // Test getting relevant context
    const context = await mcpRepository.getRelevantContext(query);
    
    const response = {
      timestamp: new Date().toISOString(),
      query,
      context,
      contextLength: context.length,
      message: context.length > 0 
        ? 'Successfully retrieved AWS context' 
        : 'No relevant AWS context found'
    };
    
    console.log('📊 MCP Context Test Results:', response);
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('❌ MCP context test error:', error);
    
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'MCP context test failed'
    }, { status: 500 });
  }
}