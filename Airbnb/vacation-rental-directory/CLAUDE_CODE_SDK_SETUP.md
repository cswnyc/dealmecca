# Claude Code SDK Setup & Configuration Guide

## Overview

This vacation rental platform now uses the **Claude Code SDK** with comprehensive tool permissions for automatic file operations, database access, and enhanced AI capabilities.

## 🚀 Quick Setup

### 1. Install Dependencies

```bash
# The Claude Code SDK is already configured in package.json
npm install
```

### 2. Environment Configuration

Copy the environment template:

```bash
cp .env.example .env.local
```

**Required Environment Variables:**

```bash
# ===== ANTHROPIC API =====
ANTHROPIC_API_KEY="sk-ant-api03-your-key-here"

# ===== CLAUDE CODE SDK PERMISSIONS =====
CLAUDE_CODE_FILE_ACCESS=enabled
CLAUDE_CODE_AUTO_SAVE=enabled
CLAUDE_CODE_DATABASE_READ=enabled
CLAUDE_CODE_WEB_SEARCH=enabled
CLAUDE_CODE_WEATHER_API=enabled
CLAUDE_CODE_MAPS_API=enabled
CLAUDE_CODE_GEOLOCATION=enabled

# ===== EXTERNAL APIs (Optional but Recommended) =====
GOOGLE_MAPS_API_KEY="your_google_maps_api_key"
OPENWEATHER_API_KEY="your_openweather_api_key"
```

### 3. Create Generated Directories

```bash
mkdir -p app/generated/trip-plans
mkdir -p app/generated/descriptions
mkdir -p app/generated/analytics
```

### 4. Start Development

```bash
npm run dev
```

## 🔧 Claude Code SDK Features

### Automatic File Operations

The SDK is configured with automatic read/write permissions for:

- **Trip Plans**: Auto-saved to `./app/generated/trip-plans/`
- **Property Descriptions**: Variations saved to `./app/generated/descriptions/`
- **Analytics Data**: Usage stats saved to `./app/generated/analytics/`

### Database Integration

- **Read Access**: Full access to all platform data (listings, cities, amenities)
- **Write Access**: Disabled for security (uses Prisma for writes)
- **Query Optimization**: Automatic caching and indexing

### Enhanced AI Capabilities

#### Trip Planning Agent
- **Geolocation Search**: Find precise coordinates and local insights
- **Weather API Integration**: Real-time weather data
- **Local Business Search**: Restaurant and activity recommendations
- **Map Integration**: Route planning and distance calculations

#### Property Management Agent
- **Description Variations**: Auto-generate A/B test content
- **SEO Optimization**: Keywords and meta descriptions
- **Market Analysis**: Competitive pricing insights
- **Image Processing**: Photo optimization and tagging

## 📁 File Structure

```
app/
├── lib/
│   ├── claude-code-config.ts     # SDK configuration
│   └── claude-agents.ts          # Enhanced agent classes
├── actions/
│   └── claude-agents.ts          # Server actions with SDK
├── generated/                    # Auto-generated content
│   ├── trip-plans/
│   ├── descriptions/
│   └── analytics/
└── components/ai/                # AI-powered components
```

## 🛡️ Security & Permissions

### Tool Permissions

| Tool | Permission | Description |
|------|------------|-------------|
| `file_read` | ✅ Enabled | Read configuration and data files |
| `file_write` | ✅ Enabled | Save generated content |
| `database_query` | ✅ Enabled | Read platform data |
| `database_write` | ❌ Restricted | Uses Prisma for security |
| `web_search` | ✅ Enabled | Real-time data for trip planning |
| `api_calls` | ✅ Restricted | Weather, maps, local business APIs |

### File Access Restrictions

- **Allowed Paths**: `./app`, `./components`, `./lib`, `./prisma`, `./scripts`
- **Max File Size**: 10MB
- **Auto-save**: Enabled for generated content
- **Backup**: Automatic versioning

### Rate Limiting

- **Requests**: 60 per minute
- **Tokens**: 100,000 per minute
- **Caching**: 1 hour TTL for trip data

## 🧪 Testing the Configuration

### 1. Validate Configuration

```typescript
import { validateClaudeCodeConfig } from './app/lib/claude-code-config';

console.log('SDK Configured:', validateClaudeCodeConfig());
```

### 2. Test File Operations

Visit `/trip-planner` and create a trip plan. Check `./app/generated/trip-plans/` for auto-saved files.

### 3. Test Database Access

The agents automatically query the database for:
- Available accommodations
- City information
- Local amenities
- Market pricing data

### 4. Test External APIs

- **Weather**: Trip planning includes current forecasts
- **Maps**: Automatic location and route data
- **Business Search**: Local restaurant recommendations

## 📊 Monitoring & Analytics

### Usage Statistics

Every AI operation logs:
- Token usage
- Processing time
- Tools used
- Cache hit rate

### Generated Content Tracking

- Trip plans saved with metadata
- Description variations with performance data
- User interaction analytics

## 🐛 Troubleshooting

### Common Issues

1. **"SDK not configured" Error**
   ```bash
   # Check environment variables
   echo $ANTHROPIC_API_KEY
   ```

2. **File Permission Errors**
   ```bash
   # Create directories and set permissions
   mkdir -p app/generated/{trip-plans,descriptions,analytics}
   chmod 755 app/generated/*
   ```

3. **Rate Limit Errors**
   ```bash
   # Reduce concurrent requests or increase limits in config
   CLAUDE_CODE_RATE_LIMIT=30
   ```

### Debug Mode

Enable detailed logging:

```bash
NODE_ENV=development
LOG_LEVEL=debug
```

## 🚀 Advanced Features

### Custom Tool Configuration

```typescript
// Create specialized clients for different use cases
const customClient = new ClaudeCodeSDK({
  apiKey: process.env.ANTHROPIC_API_KEY,
  permissionMode: 'custom',
  allowedTools: ['file_write', 'database_query'],
  security: {
    allowedPaths: ['./custom-path'],
    maxFileSize: 5
  }
});
```

### Batch Operations

```typescript
// Generate multiple trip plans concurrently
const results = await Promise.all([
  agent.generateTripPlan(request1),
  agent.generateTripPlan(request2),
  agent.generateTripPlan(request3)
]);
```

## 📈 Performance Optimization

### Caching Strategy

- **Trip Plans**: 2 hours (travel data changes slowly)
- **Property Descriptions**: 1 hour (market data updates)
- **Local Business Data**: 6 hours (business hours/availability)

### Token Management

- **Prompt Optimization**: Structured prompts reduce token usage
- **Response Caching**: Identical requests served from cache
- **Batch Processing**: Multiple operations in single request

## 🔄 Updates & Maintenance

### SDK Updates

```bash
npm update @anthropic-ai/claude-code-sdk
```

### Configuration Changes

Update `app/lib/claude-code-config.ts` for:
- New tool permissions
- Security policy changes
- Performance tuning

### Monitoring

Check logs for:
- Error rates
- Token usage trends
- Performance metrics
- User satisfaction scores

---

## 🎯 Next Steps

With Claude Code SDK configured, your vacation rental platform now has:

✅ **Automatic file operations** for content generation  
✅ **Real-time data integration** for trip planning  
✅ **Enhanced AI capabilities** with tool access  
✅ **Secure permissions** with proper access controls  
✅ **Performance optimization** with caching and rate limiting  

The AI agents can now autonomously read/write files, query databases, and access external APIs to provide incredibly sophisticated travel planning and property management features!