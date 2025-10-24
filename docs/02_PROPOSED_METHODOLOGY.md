# 2. PROPOSED METHODOLOGY

## 2.1 System Architecture Overview

The Decentralized File Sharing DApp employs a three-tier architecture combining blockchain, distributed storage, and a modern web frontend. This architecture ensures decentralization, security, and user-friendliness.

### 2.1.1 Architecture Layers

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                        │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         React Frontend Application                    │   │
│  │  - UI Components (Navbar, Main, Modals)             │   │
│  │  - State Management                                  │   │
│  │  - Web3 Integration                                  │   │
│  │  - Client-Side Encryption                            │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                   BLOCKCHAIN LAYER                           │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         Ethereum Smart Contracts                      │   │
│  │  - DStorage.sol (Access Control & Metadata)          │   │
│  │  - Event System                                      │   │
│  │  - Permission Management                             │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         Web3.js Communication                         │   │
│  │  - Contract Interaction                              │   │
│  │  - Transaction Management                            │   │
│  │  - MetaMask Integration                              │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                   STORAGE LAYER                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         IPFS Distributed Network                      │   │
│  │  - File Storage                                      │   │
│  │  - Content Addressing                                │   │
│  │  - Peer-to-Peer Network                              │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 2.1.2 Detailed Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────┐
│                          USER INTERFACE                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐    │
│  │   Navbar     │  │   Main       │  │  Modals & Dialogs    │    │
│  │  Component   │  │  Component   │  │  - Upload Modal      │    │
│  │              │  │              │  │  - Share Modal       │    │
│  │ - Account    │  │ - File List  │  │  - Notifications     │    │
│  │ - Network    │  │ - Upload     │  └──────────────────────┘    │
│  └──────────────┘  └──────────────┘                               │
└────────────────────────────────────────────────────────────────────┘
                            ↓
┌────────────────────────────────────────────────────────────────────┐
│                       APPLICATION LOGIC                             │
│  ┌──────────────────────┐      ┌──────────────────────┐           │
│  │   App.js (Main)      │      │   Helper Modules     │           │
│  │                      │      │                      │           │
│  │ - State Management   │◄────►│ - encryption.js      │           │
│  │ - Web3 Initialization│      │ - helpers.js         │           │
│  │ - IPFS Setup         │      │ - Conversion Utils   │           │
│  │ - Contract Loading   │      └──────────────────────┘           │
│  └──────────────────────┘                                          │
└────────────────────────────────────────────────────────────────────┘
                            ↓
┌────────────────────────────────────────────────────────────────────┐
│                    WEB3 & BLOCKCHAIN LAYER                          │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │                    MetaMask Wallet                            │ │
│  │  - User Authentication                                        │ │
│  │  - Transaction Signing                                        │ │
│  │  - Network Management                                         │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                            ↓                                        │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │                 Ethereum Blockchain                           │ │
│  │  ┌────────────────────────────────────────────────────────┐  │ │
│  │  │  DStorage Smart Contract                               │  │ │
│  │  │                                                        │  │ │
│  │  │  Storage:                    Functions:               │  │ │
│  │  │  - files mapping             - uploadFile()           │  │ │
│  │  │  - fileAccess mapping        - shareFile()            │  │ │
│  │  │  - userFiles mapping         - revokeAccess()         │  │ │
│  │  │  - fileRecipients mapping    - hasAccess()            │  │ │
│  │  │                              - getUserFiles()         │  │ │
│  │  │  Events:                     - getSharedFiles()       │  │ │
│  │  │  - FileUploaded              - getPublicFiles()       │  │ │
│  │  │  - FileShared                - addRecipients()        │  │ │
│  │  │  - FileAccessed                                       │  │ │
│  │  │  - AccessRevoked                                      │  │ │
│  │  └────────────────────────────────────────────────────────┘  │ │
│  └──────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────┘
                            ↓
┌────────────────────────────────────────────────────────────────────┐
│                    DISTRIBUTED STORAGE LAYER                        │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │                      IPFS Network                             │ │
│  │  ┌────────────┐   ┌────────────┐   ┌────────────┐          │ │
│  │  │  IPFS Node │   │  IPFS Node │   │  IPFS Node │          │ │
│  │  │     #1     │───│     #2     │───│     #3     │   ...    │ │
│  │  └────────────┘   └────────────┘   └────────────┘          │ │
│  │                                                              │ │
│  │  Features:                                                   │ │
│  │  - Content Addressing (CID)                                 │ │
│  │  - Distributed Hash Table (DHT)                             │ │
│  │  - Peer-to-Peer File Transfer                               │ │
│  │  - Data Redundancy                                          │ │
│  └──────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────┘
```

## 2.2 System Components and Modules

### 2.2.1 Frontend Components

#### **App.js - Main Application Component**
**Purpose**: Root component managing application state and blockchain connectivity

**Responsibilities:**
- Web3 initialization and MetaMask connection
- Smart contract loading and instance management
- IPFS client configuration
- Global state management
- User authentication handling
- File operations coordination

**Key Methods:**
- `loadWeb3()`: Initialize Web3 and connect to MetaMask
- `loadBlockchainData()`: Load smart contract and user data
- `uploadFile()`: Handle file upload to IPFS and blockchain
- `downloadFile()`: Retrieve and decrypt files
- `shareFile()`: Share files with other users
- `revokeAccess()`: Remove user permissions

#### **Main.js - File Management Interface**
**Purpose**: User interface for file operations and display

**Responsibilities:**
- File upload form with drag-and-drop
- File list display and management
- Access control configuration
- Recipient management for restricted files
- Modal dialogs for user interactions
- File type detection and display

**Key Features:**
- Drag-and-drop file upload
- Access level selection (Public/Private/Restricted)
- Recipient address management
- Encryption toggle
- File actions (download, share)
- Share modal for permission management

#### **Navbar.js - Navigation Component**
**Purpose**: Top navigation bar with user information

**Responsibilities:**
- Display connected wallet address
- Show network information
- Provide branding and navigation
- Visual feedback for connection status

#### **encryption.js - Encryption Module**
**Purpose**: Client-side encryption/decryption utilities

**Responsibilities:**
- AES-GCM encryption implementation
- Key generation and management
- File encryption for upload
- File decryption for download
- Base64 encoding/decoding
- Encryption key storage in localStorage

**Key Methods:**
- `generateKey()`: Generate AES-256 key
- `encryptFileForUpload()`: Encrypt file before IPFS upload
- `decryptFileFromDownload()`: Decrypt downloaded file
- `arrayBufferToBase64()`: Convert binary to string
- `base64ToArrayBuffer()`: Convert string to binary

#### **helpers.js - Utility Functions**
**Purpose**: Common utility functions

**Responsibilities:**
- Byte conversion (Bytes, KB, MB, GB)
- BigInt to Number conversion
- Data formatting helpers

### 2.2.2 Backend Components (Smart Contracts)

#### **DStorage.sol - Main Storage Contract**
**Purpose**: Manage file metadata and access control on blockchain

**Data Structures:**
```solidity
struct File {
    uint fileId;              // Unique identifier
    string fileHash;          // IPFS CID
    uint fileSize;            // File size in bytes
    string fileName;          // Original filename
    string fileDescription;   // User description
    uint uploadTime;          // Timestamp
    address uploader;         // Owner address
    uint accessType;          // 0=Public, 1=Private, 2=Restricted
    bool isEncrypted;         // Encryption flag
}
```

**Storage Mappings:**
- `files`: Main file storage (fileId → File)
- `fileAccess`: Access permissions (fileId → address → bool)
- `fileRecipients`: List of recipients (fileId → address[])
- `userFiles`: User's owned files (address → uint[])
- `sharedWithUser`: Files shared with user (address → uint[])

**Core Functions:**
- `uploadFile()`: Store file metadata
- `shareFile()`: Grant access to specific user
- `revokeAccess()`: Remove user access
- `hasAccess()`: Check user permissions
- `addRecipients()`: Add multiple recipients
- `getUserFiles()`: Get user's files
- `getSharedFiles()`: Get files shared with user
- `getPublicFiles()`: Get all public files

## 2.3 Data Flow Diagrams

### 2.3.1 File Upload Flow

```
┌─────────┐
│  USER   │
└────┬────┘
     │ 1. Select file & configure access
     ↓
┌────────────────────────────┐
│   React Frontend (Main)    │
│  - Capture file            │
│  - Get description         │
│  - Get access settings     │
└────┬───────────────────────┘
     │ 2. File selected
     ↓
┌────────────────────────────┐
│    App.js uploadFile()     │
│  - Check if encryption     │
└────┬───────────────────────┘
     │
     ├──→ IF ENCRYPTED
     │    ┌────────────────────────────┐
     │    │  encryption.js             │
     │    │  - Generate key            │
     │    │  - Encrypt file            │
     │    │  - Store key in localStorage│
     │    └────┬───────────────────────┘
     │         │ 3. Encrypted buffer
     ↓         ↓
┌────────────────────────────┐
│      IPFS Client           │
│  ipfs.add(buffer)          │
└────┬───────────────────────┘
     │ 4. Returns IPFS hash (CID)
     ↓
┌────────────────────────────┐
│   DStorage Smart Contract  │
│  uploadFile()              │
│  - Store metadata          │
│  - Set permissions         │
│  - Emit FileUploaded event │
└────┬───────────────────────┘
     │ 5. Transaction receipt
     ↓
┌────────────────────────────┐
│  IF RESTRICTED ACCESS      │
│  addRecipients()           │
│  - Grant access to users   │
│  - Emit FileShared events  │
└────┬───────────────────────┘
     │ 6. Success notification
     ↓
┌────────────────────────────┐
│   Update UI                │
│  - Refresh file list       │
│  - Show notification       │
│  - Reset form              │
└────────────────────────────┘
```

### 2.3.2 File Download Flow

```
┌─────────┐
│  USER   │
└────┬────┘
     │ 1. Click download button
     ↓
┌────────────────────────────┐
│   App.js downloadFile()    │
└────┬───────────────────────┘
     │ 2. Check access permission
     ↓
┌────────────────────────────┐
│   DStorage Smart Contract  │
│  hasAccess(fileId, user)   │
└────┬───────────────────────┘
     │ 3. Permission verified
     ↓
┌────────────────────────────┐
│   Log access event         │
│  accessFile(fileId)        │
│  - Emit FileAccessed       │
└────┬───────────────────────┘
     │ 4. Fetch from IPFS
     ↓
┌────────────────────────────┐
│      IPFS Network          │
│  ipfs.cat(fileHash)        │
└────┬───────────────────────┘
     │ 5. File data chunks
     ↓
┌────────────────────────────┐
│   Combine chunks           │
│  Create Uint8Array         │
└────┬───────────────────────┘
     │
     ├──→ IF ENCRYPTED
     │    ┌────────────────────────────┐
     │    │  encryption.js             │
     │    │  - Get key from localStorage│
     │    │  - Decrypt file            │
     │    └────┬───────────────────────┘
     │         │ 6. Decrypted data
     ↓         ↓
┌────────────────────────────┐
│   Create download blob     │
│  - Create blob URL         │
│  - Trigger download        │
│  - Clean up URL            │
└────┬───────────────────────┘
     │ 7. File downloaded
     ↓
┌─────────┐
│  USER   │
└─────────┘
```

### 2.3.3 File Sharing Flow

```
┌─────────┐
│  OWNER  │
└────┬────┘
     │ 1. Click share button
     ↓
┌────────────────────────────┐
│   Main.js                  │
│  openShareModal(fileId)    │
└────┬───────────────────────┘
     │ 2. Show modal
     ↓
┌────────────────────────────┐
│   User enters address      │
│  - Validate Ethereum addr  │
└────┬───────────────────────┘
     │ 3. Confirm share
     ↓
┌────────────────────────────┐
│   App.js shareFile()       │
└────┬───────────────────────┘
     │ 4. Call smart contract
     ↓
┌────────────────────────────┐
│   DStorage Smart Contract  │
│  shareFile(fileId, addr)   │
│  - Update fileAccess       │
│  - Add to fileRecipients   │
│  - Add to sharedWithUser   │
│  - Emit FileShared event   │
└────┬───────────────────────┘
     │ 5. Transaction confirmed
     ↓
┌────────────────────────────┐
│   Update UI                │
│  - Refresh file list       │
│  - Show notification       │
│  - Close modal             │
└────┬───────────────────────┘
     │ 6. Notification
     ↓
┌──────────┐
│ RECIPIENT│
│ can now  │
│ download │
└──────────┘
```

## 2.4 Technology Stack and Rationale

### 2.4.1 Frontend Technologies

#### **React 18.2.0**
**Rationale:**
- Component-based architecture for modular development
- Virtual DOM for efficient rendering
- Hooks for state management without classes
- Large ecosystem and community support
- Excellent developer tools and documentation

#### **Web3.js 4.2.2**
**Rationale:**
- Industry-standard Ethereum JavaScript library
- Comprehensive API for smart contract interaction
- MetaMask integration support
- Promise-based async operations
- Active maintenance and updates

#### **IPFS HTTP Client 60.0.1**
**Rationale:**
- Official IPFS JavaScript client library
- Simple API for file operations
- Browser and Node.js compatibility
- Supports modern IPFS features
- Well-documented and maintained

#### **Lucide React**
**Rationale:**
- Modern, clean icon library
- Optimized SVG icons
- Tree-shakable for smaller bundle size
- Consistent design language
- Easy to use as React components

### 2.4.2 Blockchain Technologies

#### **Solidity ^0.5.0**
**Rationale:**
- Most widely used smart contract language
- Ethereum native language
- Strong typing for security
- Extensive tooling support
- Large developer community

#### **Truffle 5.11.5**
**Rationale:**
- Complete development framework
- Built-in smart contract compilation
- Automated testing framework
- Migration system for deployment
- Console for contract interaction

#### **Ganache**
**Rationale:**
- Personal blockchain for development
- Instant transaction mining
- Deterministic accounts for testing
- GUI and CLI options
- Visual transaction inspection

### 2.4.3 Security Technologies

#### **Web Crypto API**
**Rationale:**
- Native browser cryptography support
- Hardware-accelerated operations
- Secure random number generation
- Standard-compliant algorithms
- No external dependencies required

#### **AES-GCM Encryption**
**Rationale:**
- Industry-standard encryption
- Authenticated encryption mode
- 256-bit key strength
- Fast performance
- Resistant to tampering

## 2.5 Design Patterns and Principles

### 2.5.1 Smart Contract Design Patterns

#### **Access Control Pattern**
```solidity
// Role-based access control
mapping(uint => mapping(address => bool)) public fileAccess;

modifier hasFileAccess(uint _fileId) {
    require(hasAccess(_fileId, msg.sender));
    _;
}
```

#### **Event Logging Pattern**
```solidity
event FileShared(
    uint indexed fileId, 
    address indexed uploader, 
    address indexed recipient, 
    uint timestamp
);
```

#### **Withdrawal Pattern**
- Avoid push payments to prevent reentrancy attacks
- Users explicitly download files they have access to

### 2.5.2 Frontend Design Patterns

#### **Component Composition**
- Small, reusable components
- Props for data flow
- Callbacks for event handling

#### **State Management**
- Centralized state in App.js
- Props drilling for simple state
- React hooks for local component state

#### **Separation of Concerns**
- Components for UI
- Helpers for utilities
- Encryption module for security

### 2.5.3 Security Principles

#### **Principle of Least Privilege**
- Users only access files they own or are granted access to
- Smart contract functions restricted to file owners

#### **Defense in Depth**
- Client-side encryption
- Blockchain access control
- Input validation at multiple layers

#### **Fail-Safe Defaults**
- Default to most restrictive access (private)
- Require explicit permissions for access

## 2.6 Development Methodology

### 2.6.1 Agile Approach
- Iterative development cycles
- Continuous testing and integration
- Regular code reviews
- Documentation alongside development

### 2.6.2 Version Control
- Git for source code management
- Semantic versioning for releases
- Feature branches for development
- Main branch for stable releases

### 2.6.3 Testing Strategy
- Unit tests for smart contracts
- Integration tests for Web3 interactions
- Manual testing for UI/UX
- Security audits for contract code

---

**Document Version**: 1.0  
**Last Updated**: October 24, 2025  
**Author**: Goutham Kurapati
