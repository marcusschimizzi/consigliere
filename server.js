#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fetch from 'node-fetch';

// Agent configurations with specialized system prompts
const AGENTS = {
  planner: {
    name: "Project Planning Agent",
    systemPrompt: `You are an expert software project planning agent. Your role is to:

CORE RESPONSIBILITIES:
- Break down project requirements into concrete, actionable tasks
- Create logical task dependencies and development sequences
- Suggest optimal project structure and architecture patterns
- Estimate complexity and identify potential risks
- Recommend development approaches and methodologies

OUTPUT FORMAT:
Always structure your responses as:
1. **Project Overview** - Brief summary of what we're building
2. **Architecture Recommendations** - High-level design decisions
3. **Task Breakdown** - Ordered list of specific implementation tasks
4. **Dependencies** - What needs to be done before what
5. **Risk Assessment** - Potential challenges and mitigation strategies
6. **Next Steps** - Immediate actionable items

PLANNING PRINCIPLES:
- Start with MVP functionality, then iterate
- Consider scalability from the beginning
- Prioritize user-facing features early
- Plan for testing and documentation
- Think about deployment and maintenance

Be specific, practical, and actionable. Focus on helping developers move from idea to implementation efficiently.`,
    model: "gemini-2.5-pro"
  },

  reviewer: {
    name: "Code Review Agent",
    systemPrompt: `You are a senior software engineer specializing in comprehensive code review. Your expertise covers:

REVIEW AREAS:
- Code quality and maintainability
- Security vulnerabilities and best practices
- Performance optimization opportunities
- Architecture and design patterns
- Testing coverage and quality
- Documentation completeness
- Error handling and edge cases

REVIEW PROCESS:
1. **Code Analysis** - Examine logic, structure, and implementation
2. **Security Scan** - Check for common vulnerabilities (OWASP Top 10)
3. **Performance Review** - Identify bottlenecks and optimization opportunities
4. **Best Practices** - Ensure adherence to language/framework conventions
5. **Maintainability** - Assess readability, modularity, and documentation

OUTPUT FORMAT:
Structure reviews as:
- **Summary** - Overall assessment and key findings
- **Critical Issues** - Must-fix problems (security, bugs)
- **Improvements** - Code quality and performance enhancements
- **Best Practices** - Standards and convention recommendations
- **Positive Notes** - What's done well
- **Action Items** - Prioritized list of specific changes

REVIEW STYLE:
- Be constructive and educational
- Provide specific examples and solutions
- Explain the "why" behind recommendations
- Balance criticism with recognition of good practices
- Focus on actionable feedback`,
    model: "gemini-2.5-pro"
  },

  architect: {
    name: "Software Architecture Agent",
    systemPrompt: `You are a principal software architect with deep expertise in system design. You specialize in:

ARCHITECTURAL DOMAINS:
- System design and scalability patterns
- Database design and data modeling
- API design and microservices architecture
- Security architecture and compliance
- Performance and reliability engineering
- Technology stack selection
- Integration patterns and protocols

ANALYSIS APPROACH:
1. **Requirements Analysis** - Understand functional and non-functional needs
2. **Constraint Identification** - Technical, business, and resource limitations
3. **Pattern Selection** - Choose appropriate architectural patterns
4. **Technology Recommendations** - Stack and tool selection with rationale
5. **Scalability Planning** - Growth and performance considerations
6. **Risk Assessment** - Technical debt and architectural risks

OUTPUT STRUCTURE:
- **Architecture Overview** - High-level system design
- **Component Breakdown** - Key system components and responsibilities
- **Data Flow** - How information moves through the system
- **Technology Stack** - Recommended tools and frameworks with justification
- **Scalability Strategy** - How the system will handle growth
- **Security Considerations** - Protection strategies and compliance
- **Implementation Roadmap** - Phased development approach

Focus on creating robust, scalable, and maintainable architectures that solve real business problems.`,
    model: "gemini-2.5-pro"
  }
};

class ConsigliereServer {
  constructor() {
    this.server = new Server(
      {
        name: 'consigliere',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    // Determine which client to use based on environment variables
    this.useLiteLLM = process.env.USE_LITELLM === 'true';
    this.liteLLMBaseUrl = process.env.LITELLM_BASE_URL || 'http://localhost:4000';
    
    if (this.useLiteLLM) {
      console.error('Using LiteLLM proxy at:', this.liteLLMBaseUrl);
      // LiteLLM doesn't require API key here if configured in the proxy
    } else {
      // Use direct Gemini API
      if (!process.env.GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY environment variable is required when not using LiteLLM');
      }
      this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      console.error('Using direct Gemini API');
    }
    
    this.setupToolHandlers();
  }

  setupToolHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'plan_project',
            description: 'Get project planning and task breakdown from the planning agent',
            inputSchema: {
              type: 'object',
              properties: {
                requirements: {
                  type: 'string',
                  description: 'Project requirements and description'
                },
                context: {
                  type: 'string',
                  description: 'Additional context like tech stack preferences, constraints, etc.'
                }
              },
              required: ['requirements']
            }
          },
          {
            name: 'review_code',
            description: 'Get comprehensive code review from the review agent',
            inputSchema: {
              type: 'object',
              properties: {
                code: {
                  type: 'string',
                  description: 'Code to review'
                },
                language: {
                  type: 'string',
                  description: 'Programming language'
                },
                focus: {
                  type: 'string',
                  description: 'Specific areas to focus on (security, performance, etc.)'
                }
              },
              required: ['code']
            }
          },
          {
            name: 'design_architecture',
            description: 'Get architectural guidance from the architecture agent',
            inputSchema: {
              type: 'object',
              properties: {
                requirements: {
                  type: 'string',
                  description: 'System requirements and constraints'
                },
                scale: {
                  type: 'string',
                  description: 'Expected scale (users, data, requests, etc.)'
                },
                existing_system: {
                  type: 'string',
                  description: 'Description of existing system if applicable'
                }
              },
              required: ['requirements']
            }
          },
          {
            name: 'consult_agent',
            description: 'Directly consult any agent with a custom prompt',
            inputSchema: {
              type: 'object',
              properties: {
                agent: {
                  type: 'string',
                  enum: ['planner', 'reviewer', 'architect'],
                  description: 'Which agent to consult'
                },
                prompt: {
                  type: 'string',
                  description: 'Your question or request'
                }
              },
              required: ['agent', 'prompt']
            }
          }
        ]
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'plan_project':
            return await this.planProject(args.requirements, args.context);
          
          case 'review_code':
            return await this.reviewCode(args.code, args.language, args.focus);
          
          case 'design_architecture':
            return await this.designArchitecture(args.requirements, args.scale, args.existing_system);
          
          case 'consult_agent':
            return await this.consultAgent(args.agent, args.prompt);
          
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error.message}`
            }
          ]
        };
      }
    });
  }

  async planProject(requirements, context = '') {
    const prompt = `${requirements}\n\nAdditional Context: ${context}`;
    const response = await this.callAgent('planner', prompt);
    
    return {
      content: [
        {
          type: 'text',
          text: `## Project Planning Analysis\n\n${response}`
        }
      ]
    };
  }

  async reviewCode(code, language = '', focus = '') {
    const prompt = `Please review this ${language} code${focus ? ` with focus on: ${focus}` : ''}:\n\n\`\`\`${language}\n${code}\n\`\`\``;
    const response = await this.callAgent('reviewer', prompt);
    
    return {
      content: [
        {
          type: 'text',
          text: `## Code Review\n\n${response}`
        }
      ]
    };
  }

  async designArchitecture(requirements, scale = '', existingSystem = '') {
    let prompt = `System Requirements:\n${requirements}`;
    if (scale) prompt += `\n\nExpected Scale:\n${scale}`;
    if (existingSystem) prompt += `\n\nExisting System:\n${existingSystem}`;
    
    const response = await this.callAgent('architect', prompt);
    
    return {
      content: [
        {
          type: 'text',
          text: `## Architecture Design\n\n${response}`
        }
      ]
    };
  }

  async consultAgent(agentType, prompt) {
    const response = await this.callAgent(agentType, prompt);
    const agent = AGENTS[agentType];
    
    return {
      content: [
        {
          type: 'text',
          text: `## ${agent.name} Response\n\n${response}`
        }
      ]
    };
  }

  async callAgent(agentType, prompt) {
    const agent = AGENTS[agentType];
    if (!agent) {
      throw new Error(`Unknown agent type: ${agentType}`);
    }

    if (this.useLiteLLM) {
      return await this.callAgentWithLiteLLM(agent, prompt);
    } else {
      return await this.callAgentWithGemini(agent, prompt);
    }
  }

  async callAgentWithLiteLLM(agent, prompt) {
    try {
      const response = await fetch(`${this.liteLLMBaseUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add authorization if your LiteLLM proxy requires it
          ...(process.env.LITELLM_API_KEY && { 'Authorization': `Bearer ${process.env.LITELLM_API_KEY}` })
        },
        body: JSON.stringify({
          model: agent.model,
          messages: [
            {
              role: 'system',
              content: agent.systemPrompt
            },
            {
              role: 'user', 
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 4000
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`LiteLLM API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('LiteLLM call failed:', error);
      throw new Error(`LiteLLM request failed: ${error.message}`);
    }
  }

  async callAgentWithGemini(agent, prompt) {
    try {
      const model = this.genAI.getGenerativeModel({ 
        model: agent.model,
        systemInstruction: agent.systemPrompt
      });

      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.error('Gemini API call failed:', error);
      throw new Error(`Gemini API request failed: ${error.message}`);
    }
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Consigliere MCP server running on stdio');
  }
}

// Start the server
const server = new ConsigliereServer();
server.run().catch(console.error);

