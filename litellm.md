# LiteLLM Integration Setup Guide

Your MCP server now supports both direct Gemini API access and LiteLLM proxy routing. Here's how to set up both options:

## Option 1: Direct Gemini API (Original)

### Configuration
```json
{
  "mcpServers": {
    "multi-agent-gemini": {
      "command": ["node", "/path/to/server.js"],
      "env": {
        "GEMINI_API_KEY": "your_gemini_api_key"
      }
    }
  }
}
```

**Pros:**
- Simple setup
- Direct API access
- No additional services needed

**Cons:**
- Limited to Gemini models only
- No request caching/routing
- No unified monitoring

## Option 2: LiteLLM Proxy

### Step 1: Install LiteLLM
```bash
pip install litellm[proxy]
```

### Step 2: Create LiteLLM Config
Create `litellm_config.yaml`:

```yaml
model_list:
  - model_name: gemini-1.5-pro
    litellm_params:
      model: gemini/gemini-1.5-pro
      api_key: "your_gemini_api_key"
  
  - model_name: gemini-1.5-flash
    litellm_params:
      model: gemini/gemini-1.5-flash
      api_key: "your_gemini_api_key"

  # Optional: Add other providers
  - model_name: gpt-4
    litellm_params:
      model: gpt-4
      api_key: "your_openai_api_key"

  - model_name: claude-3-sonnet
    litellm_params:
      model: anthropic/claude-3-sonnet-20240229
      api_key: "your_anthropic_api_key"

general_settings:
  master_key: "your_litellm_master_key" # Optional: for auth
  database_url: "sqlite:///litellm.db" # Optional: for logging
```

### Step 3: Start LiteLLM Proxy
```bash
litellm --config litellm_config.yaml --port 4000
```

Or run as daemon:
```bash
litellm --config litellm_config.yaml --port 4000 --detailed_debug
```

### Step 4: Configure Consigliere for LiteLLM
```json
{
  "mcpServers": {
    "consigliere": {
      "command": ["node", "/path/to/server.js"],
      "env": {
        "USE_LITELLM": "true",
        "LITELLM_BASE_URL": "http://localhost:4000",
        "LITELLM_API_KEY": "your_litellm_master_key"
      }
    }
  }
}
```

## Advanced LiteLLM Features

### Load Balancing
Configure multiple API keys for the same model:
```yaml
model_list:
  - model_name: gemini-1.5-pro
    litellm_params:
      model: gemini/gemini-1.5-pro
      api_key: "key_1"
  
  - model_name: gemini-1.5-pro
    litellm_params:
      model: gemini/gemini-1.5-pro
      api_key: "key_2"
```

### Fallback Models
```yaml
model_list:
  - model_name: smart-agent
    litellm_params:
      model: gemini/gemini-1.5-pro
      api_key: "your_gemini_key"
      fallbacks: ["gpt-4", "claude-3-sonnet"]
```

### Cost Tracking
```yaml
general_settings:
  database_url: "sqlite:///litellm.db"
  store_model_in_db: true
```

### Rate Limiting
```yaml
model_list:
  - model_name: gemini-1.5-pro
    litellm_params:
      model: gemini/gemini-1.5-pro
      api_key: "your_key"
      rpm: 60  # requests per minute
      tpm: 100000  # tokens per minute
```

## Enhanced Advisor Configuration

You can now easily switch between different models per advisor by updating the AGENTS configuration:

```javascript
const AGENTS = {
  planner: {
    name: "Project Planning Agent",
    systemPrompt: "...",
    model: "gemini-1.5-pro"  // or "gpt-4", "claude-3-sonnet"
  },
  reviewer: {
    name: "Code Review Agent", 
    systemPrompt: "...",
    model: "gemini-1.5-flash"  // Faster for code review
  },
  architect: {
    name: "Software Architecture Agent",
    systemPrompt: "...",
    model: "gpt-4"  // Different model for architecture
  }
};
```

## Production Deployment

### Docker Compose Setup
```yaml
version: '3.8'
services:
  litellm:
    image: ghcr.io/berriai/litellm:main-latest
    ports:
      - "4000:4000"
    environment:
      - DATABASE_URL=postgresql://user:pass@postgres:5432/litellm
    volumes:
      - ./litellm_config.yaml:/app/config.yaml
    command: ["--config", "/app/config.yaml", "--port", "4000"]
    
  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=litellm
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### Environment Variables
```bash
# For production
export USE_LITELLM=true
export LITELLM_BASE_URL=https://your-litellm-instance.com
export LITELLM_API_KEY=your_production_key

# For development  
export USE_LITELLM=true
export LITELLM_BASE_URL=http://localhost:4000
```

## Benefits of LiteLLM Integration

1. **Multi-Provider Support**: Use different models for different agents
2. **Fallback Handling**: Automatic failover if one provider is down
3. **Cost Optimization**: Route to cheapest appropriate model
4. **Rate Limiting**: Built-in request throttling
5. **Monitoring**: Centralized logging and metrics
6. **Caching**: Response caching to reduce costs
7. **Load Balancing**: Distribute requests across multiple API keys

## Troubleshooting

### LiteLLM Proxy Issues
```bash
# Check if proxy is running
curl http://localhost:4000/health

# Test model availability
curl http://localhost:4000/v1/models
```

### MCP Server Issues
```bash
# Test with direct Gemini
USE_LITELLM=false GEMINI_API_KEY=your_key node server.js

# Test with LiteLLM
USE_LITELLM=true LITELLM_BASE_URL=http://localhost:4000 node server.js
```

This setup gives you maximum flexibility - you can start with direct Gemini access and upgrade to LiteLLM when you need more advanced features like multi-provider support, fallbacks, or cost optimization.
