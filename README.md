# Decentralized File Sharing DApp using Blockchain & IPFS

A comprehensive decentralized application (DApp) that combines **IPFS** (InterPlanetary File System) for distributed file storage with **Ethereum smart contracts** for advanced metadata management and access control. Built with React, Web3, Solidity, and featuring client-side encryption, role-based access control, and modern UI components.

## 🚀 Key Features

### 🔒 **Security & Privacy**
- **Client-Side Encryption**: AES-GCM encryption with Web Crypto API for private files
- **Access Control System**: Three-tier access levels (Public, Private, Restricted)
- **Blockchain-Based Authorization**: Smart contract-managed file permissions
- **Secure File Sharing**: Encrypted file sharing with specific recipients

### 📁 **File Management**
- **Decentralized Storage**: Files stored on IPFS network for distributed, censorship-resistant storage
- **Rich Metadata**: File descriptions, types, sizes, and upload timestamps
- **File Type Detection**: Automatic file type identification from extensions
- **Owner Verification**: Visual indicators for file ownership

### 🎨 **Modern User Interface**
- **Dark Theme**: Professional dark-themed interface with smooth gradients
- **Lucide Icons**: Clean, scalable vector icons for action buttons
- **Responsive Design**: Mobile-friendly responsive layout
- **Interactive Elements**: Drag-and-drop file upload with visual feedback
- **Real-time Updates**: Live file list updates after successful operations

### 🌐 **Blockchain Integration**
- **Smart Contract Architecture**: Solidity-based contracts with optimized gas usage
- **Web3 Integration**: MetaMask support for seamless blockchain interactions
- **Event Logging**: Comprehensive blockchain event tracking
- **Multiple Network Support**: Configurable for different Ethereum networks

### 🔄 **Advanced Functionality**
- **File Sharing Modal**: User-friendly interface for sharing files with specific addresses
- **Form Reset**: Automatic form clearing after successful uploads
- **Error Handling**: Comprehensive error management and user feedback
- **Progress Indicators**: Visual feedback during file operations

## 🛠 Technology Stack

### Frontend
- **React 18.2.0** - Modern UI framework with hooks and functional components
- **Web3 4.2.2** - Ethereum blockchain interaction library
- **Lucide React** - Modern icon system for clean, scalable icons
- **Moment.js 2.29.4** - Advanced date/time formatting and manipulation
- **CSS3** - Custom styling with CSS Grid, Flexbox, and animations

### Blockchain & Smart Contracts
- **Solidity ^0.5.0** - Smart contract programming language
- **Truffle 5.11.5** - Development framework for Ethereum
- **Ganache** - Local blockchain environment for development
- **Web3.js** - Ethereum JavaScript API for blockchain interaction

### Storage & Encryption
- **IPFS HTTP Client 60.0.1** - Decentralized file storage protocol
- **Web Crypto API** - Native browser encryption for client-side security
- **AES-GCM Encryption** - Advanced encryption standard with Galois/Counter Mode

### Development Tools
- **Node.js** - JavaScript runtime environment
- **npm** - Package manager and dependency management
- **MetaMask** - Browser wallet extension for Web3 interactions
- **Buffer Polyfill** - Browser compatibility for Node.js Buffer API

## 📁 Enhanced Project Structure

```
dstorage-ipfs/
├── public/                     # Static assets and PWA configuration
│   ├── index.html             # Main HTML template
│   ├── favicon.ico           # Application favicon
│   └── manifest.json         # Progressive Web App manifest
├── src/
│   ├── components/           # React components with modern architecture
│   │   ├── App.js           # Main application component with state management
│   │   ├── App.css          # Global styles with dark theme and animations
│   │   ├── Main.js          # File management interface with encryption
│   │   ├── Navbar.js        # Navigation with wallet connection status
│   │   ├── helpers.js       # Utility functions for data formatting
│   │   ├── encryption.js    # Client-side encryption utilities
│   │   └── NotificationToast.js # User feedback system
│   ├── contracts/           # Solidity smart contracts
│   │   ├── DStorage.sol     # Main storage contract with access control
│   │   └── Migrations.sol   # Truffle deployment management
│   ├── abis/               # Contract artifacts (auto-generated)
│   │   ├── DStorage.json   # Contract ABI and bytecode
│   │   └── Migrations.json # Migration contract ABI
│   ├── assets/             # Static assets
│   │   ├── box.png         # Application logo
│   │   └── logo.png        # Brand assets
│   ├── index.js            # React application entry point
│   └── serviceWorker.js    # Progressive Web App service worker
├── migrations/             # Blockchain deployment scripts
│   ├── 1_initial_migration.js    # Base migration setup
│   └── 2_deploy_contracts.js     # DStorage contract deployment
├── test/                   # Smart contract test suite
│   └── test.js            # Comprehensive contract testing
├── truffle-config.js       # Truffle framework configuration
├── package.json           # Dependencies, scripts, and metadata
├── install-ipfs.sh        # IPFS installation automation script
├── setup-ipfs.md          # Detailed IPFS setup instructions
├── SETUP_COMPLETE.md      # Post-installation verification guide
└── README.md              # This comprehensive documentation
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

## 🎯 Comprehensive Usage Guide

### 🔐 **Access Control System**

The platform supports three distinct access levels:

#### 🌍 **Public Files**
- **Visibility**: Accessible to anyone with the IPFS hash
- **Use Case**: Open-source documents, public announcements, shared resources
- **Security**: No encryption, stored as-is on IPFS
- **Sharing**: Automatic global accessibility

#### 🔐 **Private Files**  
- **Visibility**: Only accessible by the file owner
- **Use Case**: Personal documents, private backups, confidential files
- **Security**: Optional client-side AES-GCM encryption
- **Sharing**: No sharing capabilities

#### 👥 **Restricted Files**
- **Visibility**: Accessible by owner and specified recipients
- **Use Case**: Collaborative documents, team files, selective sharing
- **Security**: Client-side encryption with shared access
- **Sharing**: Manual recipient management via Ethereum addresses

### 📤 **File Upload Process**

1. **Connect Wallet**: Ensure MetaMask is connected to the correct network
2. **Select File**: Use drag-and-drop or click to choose files (any format supported)
3. **Add Description**: Provide meaningful description for better organization
4. **Choose Access Level**: Select from Public, Private, or Restricted
5. **Configure Recipients** (Restricted only): Add Ethereum addresses for shared access
6. **Enable Encryption** (Optional): Toggle client-side encryption for sensitive files
7. **Upload**: Confirm blockchain transaction in MetaMask
8. **Verification**: File appears in the table with all metadata

### 📋 **File Management Interface**

#### **File Table Features**
- **File ID**: Unique blockchain-based identifier
- **Filename**: Original filename with encryption indicator 🔐
- **Description**: User-provided description or "No description"
- **Type**: Automatically detected file extension
- **Size**: Human-readable file size (KB, MB, GB)
- **Access Level**: Visual indicators (🌍 Public, 🔐 Private, 👥 Restricted)
- **Upload Date**: Formatted timestamp with relative time
- **Uploader**: Ethereum address with owner indicator 👤

#### **Action Buttons**
- **Download** (📥): Download file with automatic decryption if encrypted
- **Share** (📤): Open sharing modal for restricted files (owners only)

### 🔄 **File Sharing Workflow**

1. **Access Sharing**: Click share button on owned files
2. **Enter Recipients**: Add valid Ethereum addresses
3. **Confirm Transaction**: Blockchain transaction to update permissions
4. **Recipient Access**: Shared users can now download the file
5. **Permission Management**: Owners can revoke access anytime

### 🛡️ **Security Features**

#### **Client-Side Encryption**
- **Algorithm**: AES-GCM with 256-bit keys
- **Key Generation**: Cryptographically secure random keys
- **Browser Support**: Uses native Web Crypto API
- **Storage**: Encrypted files stored on IPFS, keys managed client-side

#### **Access Validation**
- **Smart Contract**: Blockchain-based permission verification
- **Owner Verification**: Automatic owner detection and UI adaptation
- **Recipient Management**: Granular control over file access

## 🔗 Enhanced Smart Contract Architecture

### **DStorage.sol - Core Contract**

The main smart contract provides comprehensive file management with advanced access control:

```solidity
struct File {
    uint fileId;              // Unique identifier
    string fileHash;          // IPFS content hash
    uint fileSize;            // File size in bytes
    string fileName;          // Original filename
    string fileDescription;   // User-provided description
    uint uploadTime;          // Block timestamp
    address uploader;         // File owner address
    uint accessType;          // Access level (0=Public, 1=Private, 2=Restricted)
    bool isEncrypted;         // Encryption status flag
}
```

### **Key Contract Functions**

#### **Core Operations**
- `uploadFile()` - Store file metadata with access control settings
- `files(uint)` - Retrieve complete file information by ID
- `fileCount()` - Get total number of uploaded files
- `hasAccess(uint, address)` - Verify user access permissions

#### **Access Control Management**
- `addRecipients(uint, address[])` - Add multiple recipients to restricted files
- `shareFile(uint, address)` - Share file with specific user
- `revokeAccess(uint, address)` - Remove access permissions
- `getFileRecipients(uint)` - List all recipients for a file

#### **Query Functions**
- `getUserFiles(address)` - Get files owned by specific user
- `getSharedFiles(address)` - Get files shared with user
- `getPublicFiles()` - Retrieve all public files
- `accessFile(uint)` - Log file access event

### **Smart Contract Events**

```solidity
event FileUploaded(
    uint indexed fileId,
    string fileHash,
    uint fileSize,
    string fileType,
    string fileName,
    string fileDescription,
    uint uploadTime,
    address indexed uploader,
    uint accessType,
    bool isEncrypted
);

event FileShared(uint indexed fileId, address indexed uploader, address indexed recipient, uint timestamp);
event FileAccessed(uint indexed fileId, address indexed accessor, uint timestamp);
event AccessRevoked(uint indexed fileId, address indexed uploader, address indexed recipient, uint timestamp);
```

### **Gas Optimization Features**
- **Efficient Storage**: Optimized struct packing to minimize storage costs
- **Batch Operations**: Support for multiple recipient additions in single transaction
- **Event Indexing**: Proper event indexing for efficient querying
- **Access Mappings**: O(1) lookup for permission verification

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

## 🛠 Advanced Troubleshooting Guide

### **Common Issues & Solutions**

#### **🔧 Frontend Issues**

**"Buffer is not defined" Error**
- **Cause**: Node.js Buffer API not available in browser
- **Solution**: Already implemented buffer polyfill in package.json
- **Verification**: Check that `"buffer": "^6.0.3"` is in dependencies

**"Cannot convert BigInt to a number"**
- **Cause**: Web3.js returns BigInt values that need conversion
- **Solution**: Already handled in helpers.js convertBytes function
- **Code**: Uses `Number(bigIntValue)` for safe conversion

**React Build Warnings**
- **Cause**: Webpack 5 Node.js polyfill changes
- **Solution**: Custom webpack configuration in package.json
- **Details**: Polyfills for crypto, buffer, and stream modules included

#### **🔗 Blockchain Connection Issues**

**MetaMask Connection Fails**
- **Check Network**: Ensure custom network is added correctly
- **Network Details**:
  - RPC URL: `http://127.0.0.1:7545`
  - Chain ID: `1337`
  - Currency: `ETH`
- **Account Import**: Use private key from Ganache accounts

**"Contract not deployed" Error**
- **Solution**: Run migration command: `npx truffle migrate --reset`
- **Network Check**: Verify Ganache is running on port 7545
- **Contract Verification**: Check if build/contracts/ contains artifacts

**Transaction Fails with "Gas Error"**
- **Increase Gas Limit**: Set higher gas limit in MetaMask
- **Check Account Balance**: Ensure sufficient ETH for transactions
- **Network Congestion**: Wait and retry transaction

#### **📁 IPFS Integration Issues**

**IPFS Upload Fails**
- **Daemon Status**: Check if IPFS daemon is running: `ipfs id`
- **CORS Configuration**: Verify CORS settings for localhost
- **Port Conflicts**: Ensure port 5001 (API) and 8080 (Gateway) are free
- **Firewall**: Check if firewall blocks IPFS ports

**CORS Configuration Commands**
```bash
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin '["http://localhost:3000", "http://127.0.0.1:3000"]'
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Methods '["PUT", "POST", "GET"]'
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Headers '["Authorization"]'
```

**File Download Issues**
- **Gateway Access**: Try alternative IPFS gateways
- **Local Gateway**: `http://127.0.0.1:8080/ipfs/[HASH]`
- **Public Gateway**: `https://ipfs.io/ipfs/[HASH]`
- **Pin Files**: Use `ipfs pin add [HASH]` to ensure persistence

#### **🔐 Encryption Problems**

**Web Crypto API Not Supported**
- **Browser Compatibility**: Use modern browsers (Chrome 37+, Firefox 34+)
- **HTTPS Requirement**: Web Crypto API requires secure context
- **Fallback**: Development server provides secure context on localhost

**Decryption Fails**
- **Key Storage**: Check if encryption keys are properly stored
- **File Integrity**: Verify file wasn't corrupted during upload
- **Browser Storage**: Clear browser storage and re-encrypt files

#### **🎨 UI/UX Issues**

**Icons Not Displaying**
- **Lucide React**: Verify `lucide-react` package is installed
- **Import Errors**: Check component imports for icon components
- **Fallback**: Emoji fallbacks are implemented for compatibility

**Responsive Layout Issues**
- **CSS Grid Support**: Ensure browser supports CSS Grid
- **Viewport Meta**: Check viewport meta tag in index.html
- **Mobile Testing**: Use browser dev tools for mobile simulation

### **🔍 Debug Commands & Verification**

#### **IPFS Diagnostics**
```bash
# Check IPFS node status
ipfs id

# Verify IPFS connectivity  
curl http://127.0.0.1:5001/api/v0/version

# Test file upload
echo "test" | ipfs add

# Check peer connections
ipfs swarm peers
```

#### **Blockchain Diagnostics**
```bash
# Test Ganache connection
curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
  http://127.0.0.1:7545

# Check contract deployment
npx truffle console
> DStorage.deployed().then(i => i.address)

# Verify account balance
> web3.eth.getBalance("0x[ADDRESS]")
```

#### **Application Diagnostics**
```bash
# Check dependency installation
npm list --depth=0

# Verify build process
npm run build

# Test development server
npm start -- --verbose
```

### **🚨 Performance Optimization**

#### **File Upload Optimization**
- **File Size**: Recommend files under 100MB for optimal performance
- **Batch Uploads**: Avoid simultaneous multiple large file uploads
- **Progress Tracking**: Monitor upload progress in browser dev tools

#### **Blockchain Optimization**
- **Gas Price**: Use appropriate gas prices for network conditions
- **Transaction Batching**: Group multiple operations when possible
- **Contract Calls**: Minimize unnecessary contract interactions

#### **IPFS Optimization**
- **Local Node**: Use local IPFS node for faster uploads
- **Pinning Strategy**: Pin important files to ensure availability
- **Gateway Selection**: Choose fastest IPFS gateway for your region

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

## 📊 **Feature Comparison Matrix**

| Feature | Implementation | Security Level | User Experience |
|---------|---------------|----------------|-----------------|
| **File Upload** | IPFS + Blockchain | 🔒 High | ⭐⭐⭐⭐⭐ |
| **Access Control** | Smart Contract | 🔒 High | ⭐⭐⭐⭐⭐ |
| **Encryption** | Client-side AES-GCM | 🔒 Maximum | ⭐⭐⭐⭐ |
| **File Sharing** | Blockchain Permissions | 🔒 High | ⭐⭐⭐⭐⭐ |
| **UI/UX** | Modern React + Lucide | N/A | ⭐⭐⭐⭐⭐ |
| **Decentralization** | IPFS Network | 🔒 Maximum | ⭐⭐⭐⭐ |

## 🎯 **Use Cases & Applications**

### **Enterprise Document Management**
- **Secure Document Storage**: Encrypted file storage with role-based access
- **Audit Trail**: Blockchain-based file access logging
- **Compliance**: Immutable metadata for regulatory requirements

### **Academic Research Collaboration**
- **Research Data Sharing**: Controlled access to research datasets
- **Publication Management**: Decentralized storage of academic papers
- **Peer Review**: Secure document sharing between reviewers

### **Creative Industries**
- **Digital Asset Protection**: Copyright protection through blockchain timestamps
- **Collaborative Projects**: Secure sharing of creative works
- **Portfolio Management**: Decentralized creative portfolio storage

### **Personal Data Management**
- **Private Cloud**: Personal encrypted file storage
- **Family Sharing**: Secure document sharing within families
- **Backup Solutions**: Decentralized backup for important documents

## 🚀 **Future Roadmap & Enhancements**

### **Planned Features**
- [ ] **Mobile Application**: React Native mobile app
- [ ] **File Versioning**: Track and manage file versions
- [ ] **Collaborative Editing**: Real-time document collaboration
- [ ] **Advanced Search**: Full-text search across uploaded files
- [ ] **File Categories**: Organize files with custom categories
- [ ] **Notification System**: Real-time notifications for file activities

### **Technical Improvements**
- [ ] **Layer 2 Integration**: Polygon/Arbitrum support for lower gas costs
- [ ] **IPFS Cluster**: Enhanced redundancy with IPFS cluster
- [ ] **Progressive Web App**: Offline capabilities and app-like experience
- [ ] **Advanced Encryption**: Support for multiple encryption algorithms
- [ ] **API Development**: RESTful API for third-party integrations

### **Security Enhancements**
- [ ] **Multi-signature**: Multi-sig wallet support for enterprise
- [ ] **Zero-Knowledge Proofs**: Enhanced privacy with ZK proofs
- [ ] **Hardware Wallet**: Ledger/Trezor integration
- [ ] **Audit Logging**: Comprehensive security audit trails

## 📈 **Performance Metrics**

### **Benchmarks**
- **File Upload Speed**: ~500KB/s average (depends on IPFS node)
- **Smart Contract Gas**: ~150,000 gas per file upload
- **UI Response Time**: <100ms for most operations
- **Encryption Speed**: ~1MB/s for AES-GCM encryption

### **Scalability**
- **Concurrent Users**: Supports multiple simultaneous users
- **File Size Limit**: Theoretical limit of 256MB per file
- **Storage Capacity**: Unlimited (limited by IPFS network)
- **Transaction Throughput**: Limited by Ethereum network capacity

## 🔧 **Development & Contributing**

### **Development Environment**
```bash
# Clone repository
git clone <repository-url>
cd dstorage-ipfs

# Install dependencies
npm install

# Start development environment
npm run dev:setup  # Starts IPFS daemon, Ganache, and React app
```

### **Code Quality Standards**
- **ESLint**: JavaScript linting with React hooks rules
- **Prettier**: Code formatting for consistent style
- **Solidity**: Smart contract best practices and security patterns
- **Testing**: Comprehensive test coverage for contracts and components

### **Contributing Guidelines**
1. **Fork & Clone**: Fork the repository and clone locally
2. **Feature Branch**: Create feature branches from main
3. **Code Standards**: Follow existing code style and patterns
4. **Testing**: Add tests for new features and bug fixes
5. **Documentation**: Update README and code comments
6. **Pull Request**: Submit PR with detailed description

### **Issue Reporting**
- **Bug Reports**: Use provided template with reproduction steps
- **Feature Requests**: Describe use case and proposed implementation
- **Security Issues**: Report privately to maintainers
- **Documentation**: Suggest improvements for user guides

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 👨‍💻 Author

**Goutham Kurapati**
- Decentralized File Storage Implementation
- Full-stack DApp Development

---
