# DeFi IDE Platform

A comprehensive IDE platform for DeFi smart contract development, featuring built-in version control, project templates, and blockchain integration.

## Features

- **File System Management**: Create, read, update, and delete files and directories
- **Project Templates**: Pre-built templates for common DeFi contract patterns
- **Version Control**: Git-like version control for tracking changes
- **Blockchain Integration**: Direct interaction with Ethereum networks
- **Smart Contract Development**: Built-in Solidity support and compilation

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL
- Ethereum node (local or remote)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/defi-ide.git
cd defi-ide
```

2. Install dependencies:
```bash
npm install
```

3. Copy the environment configuration:
```bash
cp .env.example .env
```

4. Update the `.env` file with your configuration.

## Development

Start the development server:
```bash
npm run dev
```

## Building for Production

Build the project:
```bash
npm run build
```

Start the production server:
```bash
npm start
```

## API Endpoints

### File System
- `GET /api/fs/:projectId/structure` - Get directory structure
- `POST /api/fs/:projectId/directory` - Create directory
- `POST /api/fs/:projectId/file` - Create/update file
- `GET /api/fs/:projectId/file` - Read file content
- `DELETE /api/fs/:projectId/file` - Delete file/directory

### Templates
- `POST /api/templates/load` - Load templates
- `GET /api/templates` - Get all templates
- `GET /api/templates/:id` - Get template by ID
- `POST /api/templates/:id/project` - Create project from template

### Version Control
- `POST /api/vc/:projectId/init` - Initialize version control
- `POST /api/vc/:projectId/commit` - Create commit
- `POST /api/vc/:projectId/branch` - Create branch
- `POST /api/vc/:projectId/switch-branch` - Switch branch
- `POST /api/vc/:projectId/merge` - Merge branch

### Ethereum Integration
- `POST /api/ethereum/connect` - Connect wallet with private key
- `GET /api/ethereum/balance/:address` - Get wallet balance
- `POST /api/ethereum/compile` - Compile Solidity contract
- `POST /api/ethereum/deploy` - Deploy compiled contract
- `POST /api/ethereum/interact` - Interact with deployed contract
- `GET /api/ethereum/receipt/:txHash` - Get transaction receipt
- `POST /api/ethereum/estimate-gas` - Estimate gas for transaction
- `GET /api/ethereum/network` - Get network information

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 