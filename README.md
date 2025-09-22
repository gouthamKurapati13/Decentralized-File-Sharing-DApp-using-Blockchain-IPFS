# DStorage - Decentralized File Storage

A full-stack decentralized application (DApp) that combines **IPFS** (InterPlanetary File System) for distributed file storage with **Ethereum smart contracts** for metadata management. Built with React, Web3, and Solidity.

## 🔧 Project Diagram:
![Project Diagram](https://i.gyazo.com/2738ea6743a40036756b1b5714ab9fa8.png)

## 🚀 Features

- **Decentralized Storage**: Files stored on IPFS network for distributed, censorship-resistant storage
- **Blockchain Integration**: File metadata recorded on Ethereum blockchain via smart contracts
- **Web3 Interface**: MetaMask integration for seamless blockchain interactions
- **File Management**: Upload, view, and manage files with descriptions and metadata
- **Real-time Updates**: Live file list updates after successful uploads
- **IPFS Gateway**: Direct access to files via IPFS hash

## 🛠 Technology Stack

### Frontend
- **React 18.2.0** - Modern UI framework
- **Web3 4.2.2** - Ethereum blockchain interaction
- **React Bootstrap 2.9.1** - UI components and styling
- **Moment.js 2.29.4** - Date/time formatting
- **Identicon.js 2.3.3** - User avatar generation

### Blockchain
- **Solidity** - Smart contract programming language
- **Truffle 5.11.5** - Development framework
- **Ganache** - Local blockchain for development
- **Web3** - Ethereum JavaScript API

### Storage
- **IPFS HTTP Client 60.0.1** - Decentralized file storage
- **IPFS Daemon** - Local IPFS node

### Development Tools
- **Node.js** - JavaScript runtime
- **npm** - Package manager
- **MetaMask** - Browser wallet extension

## 📁 Project Structure

```
dstorage-ipfs/
├── public/                 # Static assets
│   ├── index.html
│   ├── favicon.ico
│   └── manifest.json
├── src/
│   ├── components/         # React components
│   │   ├── App.js         # Main application component
│   │   ├── App.css        # Application styles
│   │   ├── Main.js        # File display component
│   │   ├── Navbar.js      # Navigation bar
│   │   └── helpers.js     # Utility functions
│   ├── contracts/         # Solidity smart contracts
│   │   ├── DStorage.sol   # Main storage contract
│   │   └── Migrations.sol # Truffle migrations
│   ├── abis/              # Contract artifacts (auto-generated)
│   │   ├── DStorage.json
│   │   └── Migrations.json
│   ├── index.js           # React entry point
│   └── serviceWorker.js   # PWA service worker
├── migrations/            # Deployment scripts
│   ├── 1_initial_migration.js
│   └── 2_deploy_contracts.js
├── test/                  # Smart contract tests
│   └── test.js
├── truffle-config.js      # Truffle configuration
├── package.json           # Dependencies and scripts
└── README.md              # This file
```

## 🔧 Installation & Setup

### Prerequisites
- **Node.js** (v14 or higher)
- **npm** or **yarn**
- **MetaMask** browser extension
- **Ganache** (GUI or CLI)
- **Git**

### 1. Clone the Repository
```bash
git clone <repository-url>
cd dstorage-ipfs
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Install and Configure IPFS

#### Option A: IPFS Desktop (Recommended)
1. Download from: https://github.com/ipfs/ipfs-desktop/releases
2. Install and run the application
3. IPFS will automatically start on port 5001

#### Option B: IPFS CLI
```bash
# Install IPFS (Linux)
wget https://dist.ipfs.tech/kubo/v0.22.0/kubo_v0.22.0_linux-amd64.tar.gz
tar -xvzf kubo_v0.22.0_linux-amd64.tar.gz
cd kubo
sudo ./install.sh

# Initialize IPFS
ipfs init

# Configure CORS for web applications
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin '["http://localhost:3000", "http://127.0.0.1:3000"]'
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Methods '["PUT", "POST", "GET"]'

# Start IPFS daemon
ipfs daemon
```

### 4. Setup Blockchain Environment

#### Using Ganache GUI
1. Download Ganache from: https://trufflesuite.com/ganache/
2. Create a new workspace
3. Set RPC Server to `127.0.0.1:7545`
4. Set Network ID to `1337`

#### Using Ganache CLI
```bash
npx ganache-cli -p 7545 -i 1337 --deterministic
```

### 5. Deploy Smart Contracts
```bash
npx truffle migrate --reset --network development
```

### 6. Configure MetaMask
1. Add custom network:
   - **Network Name**: Ganache Local
   - **RPC URL**: http://127.0.0.1:7545
   - **Chain ID**: 1337
   - **Currency Symbol**: ETH
2. Import an account using a private key from Ganache

### 7. Start the Application
```bash
npm start
```

The application will open at `http://localhost:3000`

## 🎯 Usage

### Uploading Files
1. Connect MetaMask to the application
2. Click "Choose File" and select a file
3. Enter a description
4. Click "Upload File"
5. Confirm the transaction in MetaMask
6. Wait for the upload to complete

### Viewing Files
- All uploaded files are displayed in a table
- Click on IPFS hashes to view files
- File details include size, type, upload time, and uploader

### Accessing Files via IPFS
Files can be accessed directly via IPFS gateway:
- Local: `http://127.0.0.1:8080/ipfs/[HASH]`
- Public: `https://ipfs.io/ipfs/[HASH]`

## 🔗 Smart Contract Details

### DStorage.sol
The main smart contract manages file metadata on the blockchain:

```solidity
struct File {
    uint fileId;
    string fileHash;      // IPFS hash
    uint fileSize;        // File size in bytes
    string fileType;      // MIME type
    string fileName;      // Original filename
    string fileDescription; // User description
    uint uploadTime;      // Timestamp
    address payable uploader; // Uploader address
}
```

### Key Functions
- `uploadFile()` - Store file metadata on blockchain
- `files()` - Retrieve file information by ID
- `fileCount()` - Get total number of uploaded files

## 🌐 Network Configuration

### Development (Ganache)
- **Host**: 127.0.0.1
- **Port**: 7545
- **Network ID**: 1337
- **Gas Limit**: 6721975

### IPFS Configuration
- **API Port**: 5001
- **Gateway Port**: 8080
- **Web UI**: http://127.0.0.1:5001/webui

## 🧪 Testing

### Run Smart Contract Tests
```bash
npx truffle test
```

### Manual Testing Checklist
- [ ] MetaMask connects to local network
- [ ] File upload completes successfully
- [ ] File appears in the list
- [ ] IPFS hash links work
- [ ] Transaction appears in Ganache
- [ ] File details are accurate

## 🛠 Troubleshooting

### Common Issues

#### "Buffer is not defined"
- **Solution**: Already fixed with buffer polyfill in package.json

#### "Cannot convert BigInt to a number"
- **Solution**: Already handled in helpers.js convertBytes function

#### IPFS Upload Fails
- Check IPFS daemon is running: `ipfs id`
- Verify CORS configuration
- Ensure port 5001 is not blocked

#### Contract Methods Fail
- Verify Ganache is running on correct port
- Check MetaMask is connected to network 1337
- Ensure account has sufficient ETH for gas

#### "Network Error"
- Confirm Ganache network ID matches truffle-config.js
- Restart Ganache and redeploy contracts
- Check MetaMask network configuration

### Debug Commands
```bash
# Check IPFS status
ipfs id

# Test IPFS connectivity
curl http://127.0.0.1:5001/api/v0/version

# Verify Ganache connection
curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
  http://127.0.0.1:7545
```

## 📚 Additional Resources

### IPFS
- [IPFS Documentation](https://docs.ipfs.io/)
- [IPFS Web UI](http://127.0.0.1:5001/webui) (when daemon is running)

### Ethereum Development
- [Truffle Documentation](https://trufflesuite.com/docs/)
- [Web3.js Documentation](https://web3js.readthedocs.io/)
- [Solidity Documentation](https://docs.soliditylang.org/)

### React & Web3
- [React Documentation](https://reactjs.org/docs/)
- [MetaMask Developer Docs](https://docs.metamask.io/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 👨‍💻 Author

**Goutham Kurapati**
- Decentralized File Storage Implementation
- Full-stack DApp Development

---
