# MCP (Model Context Protocol) Setup Guide

## What is MCP?

MCP (Model Context Protocol) allows AI assistants like Kiro to interact with external tools and services. This project includes several powerful MCP integrations.

## Available MCP Servers

### 🗄️ Postgres MCP
**Purpose**: Database operations via AI

**Features**:
- Query and analyze your database
- Get schema insights
- Performance recommendations
- Execute SQL commands
- Explain query plans

**Requirements**:
- `uvx` (Python package runner)
- PostgreSQL database connection

**Configuration**:
```json
{
  "postgres": {
    "command": "uvx",
    "args": ["postgres-mcp", "--access-mode=unrestricted"],
    "env": {
      "DATABASE_URI": "postgresql://user:password@localhost:5432/dbname"
    }
  }
}
```

### 🐙 GitHub MCP
**Purpose**: Repository operations via AI

**Features**:
- Search repositories
- Create/manage issues and PRs
- Read/write files to GitHub
- List commits and branches

**Requirements**:
- `npx` (comes with npm)
- GitHub Personal Access Token

**Configuration**:
```json
{
  "github": {
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-github"],
    "env": {
      "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_your_token_here"
    }
  }
}
```

**Get GitHub Token**:
1. Go to https://github.com/settings/tokens
2. Generate new token (classic)
3. Select scopes: `repo`, `read:org`, `read:user`
4. Copy token and add to mcp.json

### 🌐 Fetch MCP
**Purpose**: Web scraping and API calls

**Features**:
- Fetch web content
- Parse HTML/JSON
- Make HTTP requests

**Requirements**:
- `uvx` (Python package runner)

### 🕐 Time MCP
**Purpose**: Timezone operations

**Features**:
- Convert times between timezones
- Get current time in any timezone

**Requirements**:
- `uvx` (Python package runner)

## Installation

### Install uvx (Required for Postgres, Time, Fetch)

**Windows**:
```powershell
# Using pip
pip install uv

# Or using PowerShell
powershell -c "irm https://astral.sh/uv/install.ps1 | iex"
```

**macOS/Linux**:
```bash
# Using curl
curl -LsSf https://astral.sh/uv/install.sh | sh

# Or using pip
pip install uv
```

**Verify Installation**:
```bash
uvx --version
```

### Install npx (Already included with npm)

npx comes with npm, so if you have Node.js installed, you already have npx.

## Configuration

### Setup Steps

1. **MCP config is already included** at `.kiro/settings/mcp.json`
   - Contains all MCP server configurations
   - Uses placeholder tokens (replace with your own)

2. **Update database connection** (done automatically by setup-cli.js):
   ```json
   "DATABASE_URI": "postgresql://user:password@localhost:5432/your_db"
   ```

3. **Add GitHub token** (if using GitHub MCP):
   - Get token from: https://github.com/settings/tokens
   - Replace `YOUR_GITHUB_TOKEN_HERE` in mcp.json:
   ```json
   "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_your_actual_token"
   ```

4. **Enable/disable servers**:
   ```json
   "disabled": false  // or true to disable
   ```

## Security

⚠️ **IMPORTANT**: The `mcp.json` file is included in the repository with placeholder tokens.

- ✅ Included in repo with sanitized placeholders
- ⚠️ Replace placeholders with your actual tokens locally
- ❌ Never commit your real tokens to Git
- ✅ Use environment variables in production
- ✅ Keep your local mcp.json private

**After cloning**:
1. Open `.kiro/settings/mcp.json`
2. Replace `YOUR_GITHUB_TOKEN_HERE` with your actual token
3. Database URI will be updated automatically by setup-cli.js

## Usage in Kiro

Once configured, you can use MCP tools naturally in Kiro:

**Database queries**:
```
"Show me all users in the database"
"What's the schema of the orders table?"
"Find slow queries in my database"
```

**GitHub operations**:
```
"Search for Next.js authentication examples"
"Create an issue in my repo"
"Show me recent commits"
```

**Web fetching**:
```
"Fetch the content from this URL"
"Get the latest news from this API"
```

**Time operations**:
```
"What time is it in Tokyo?"
"Convert 3pm EST to PST"
```

## Managing MCP Servers

### Via Kiro IDE

1. Open Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`)
2. Search for "MCP"
3. Select "MCP: Manage Servers"

### Via Sidebar

1. Open Kiro sidebar
2. Find "MCP Servers" section
3. Enable/disable servers
4. View server status

### Via Config File

Edit `.kiro/settings/mcp.json` directly:
- Change `disabled: true/false`
- Update connection strings
- Add/remove auto-approve permissions

## Troubleshooting

### "uvx: command not found"

Install uv/uvx:
```bash
# See installation instructions above
```

### "Database connection failed"

Check your DATABASE_URI:
- Correct username/password
- Database exists
- PostgreSQL is running
- Port is correct (default: 5432)

### "GitHub token invalid"

Generate a new token:
1. https://github.com/settings/tokens
2. Select required scopes
3. Update mcp.json

### MCP server not responding

1. Check server status in Kiro sidebar
2. Restart server: Command Palette → "MCP: Restart Server"
3. Check logs in Kiro output panel

## Learn More

- [MCP Documentation](https://modelcontextprotocol.io/)
- [Kiro MCP Guide](https://docs.kiro.ai/mcp)
- [Available MCP Servers](https://github.com/modelcontextprotocol/servers)

## Support

If you encounter issues:
1. Check this guide
2. View Kiro output logs
3. Restart MCP servers
4. Check GitHub issues
