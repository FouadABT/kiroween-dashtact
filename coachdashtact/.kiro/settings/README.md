# Kiro Settings Configuration

This directory contains configuration files for Kiro IDE features and integrations.

## MCP (Model Context Protocol) Configuration

### Setup Instructions

1. **Copy the example file**:
   ```bash
   cp mcp.json.example mcp.json
   ```

2. **Add your GitHub Personal Access Token**:
   - Go to https://github.com/settings/tokens
   - Click "Generate new token" → "Generate new token (classic)"
   - Give it a name like "Kiro MCP"
   - Select scopes: `repo`, `workflow`, `user`
   - Generate and copy the token

3. **Update mcp.json**:
   - Open `.kiro/settings/mcp.json`
   - Replace `your_github_token_here` with your actual token
   - Save the file

4. **Reconnect MCP Server**:
   - Open Kiro command palette (Ctrl+Shift+P / Cmd+Shift+P)
   - Search for "MCP: Reconnect Server"
   - Or find it in the MCP Server view in Kiro's feature panel

### Security Note

⚠️ **IMPORTANT**: The `mcp.json` file is excluded from git to protect your tokens. Never commit files containing actual tokens to version control.

### Available MCP Servers

#### GitHub MCP
- **Purpose**: Interact with GitHub repositories, issues, and pull requests
- **Auto-approved tools**: 
  - `search_repositories`
  - `create_repository`
- **Other capabilities**: Create/update files, manage issues, create PRs, and more

### Adding More MCP Servers

You can add additional MCP servers to the `mcpServers` object in `mcp.json`. Example:

```json
{
  "mcpServers": {
    "github": { ... },
    "another-server": {
      "command": "npx",
      "args": ["-y", "@package/mcp-server"],
      "env": {
        "API_KEY": "your_api_key"
      },
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

### Troubleshooting

- **Authentication errors**: Verify your token has the correct scopes
- **Server not connecting**: Check the MCP Server view for error messages
- **Token expired**: Generate a new token and update mcp.json
- **Changes not taking effect**: Reconnect the MCP server after configuration changes

For more information about MCP, visit: https://modelcontextprotocol.io
