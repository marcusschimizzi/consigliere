# Consigliere

> Your trusted AI advisors for Claude Code development

Consigliere is a multi-agent MCP server that provides specialized AI consultants to enhance your Claude Code workflow. Think of it as having a senior developer, architect, and project manager available for instant consultation while you code.

## Features

🎯 **Planning Agent** - Project breakdown, task organization, architecture recommendations  
🔍 **Review Agent** - Code quality, security, performance analysis  
🏗️ **Architecture Agent** - System design, scalability, technology decisions  
🤝 **Flexible Backend** - Direct Gemini API or LiteLLM proxy support

## Quick Start

1. **Get Gemini API key** from [Google AI Studio](https://aistudio.google.com/)

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Claude Desktop** (`claude_desktop_config.json`):
   ```json
   {
     "mcpServers": {
       "consigliere": {
         "command": ["node", "/absolute/path/to/server.js"],
         "env": {
           "GEMINI_API_KEY": "your_api_key_here"
         }
       }
     }
   }
   ```

4. **Restart Claude Desktop** and start coding with your AI advisors!

## Usage

```bash
# Get project planning
plan_project: "Build a REST API for a blog platform"

# Review your code
review_code: [paste your code]

# Get architectural guidance  
design_architecture: "Chat system for 50k users"

# Consult specific experts
consult_agent: agent=reviewer, prompt="Best practices for JWT auth?"
```

## LiteLLM Support

For multi-provider support and advanced features:

```bash
# Start LiteLLM proxy
litellm --config litellm_config.yaml --port 4000

# Configure for LiteLLM
USE_LITELLM=true LITELLM_BASE_URL=http://localhost:4000 npm start
```

## Claude Code Integration

Add to `~/.claude/CLAUDE.md` for automatic workflow integration:

```markdown
# Auto-suggest agent consultation:
# - New projects → plan_project
# - Code discussion → review_code  
# - System design → design_architecture
# - Complex problems → consult_agent
```

## License

MIT
