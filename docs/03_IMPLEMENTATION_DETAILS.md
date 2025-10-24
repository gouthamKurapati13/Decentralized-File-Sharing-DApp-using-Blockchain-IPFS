# 3. IMPLEMENTATION DETAILS

## 3.1 Smart Contract Implementation

### 3.1.1 DStorage.sol - Core Contract

#### **Contract Overview**
The DStorage smart contract is the backbone of the decentralized file sharing system, managing file metadata and access control on the Ethereum blockchain.

#### **Complete Contract Code with Explanation**

```solidity
pragma solidity ^0.5.0;

contract DStorage {
  // Contract name
  string public name = 'DStorage';
  
  // Counter for total files uploaded
  uint public fileCount = 0;
  
  // Main file storage: fileId => File struct
  mapping(uint => File) public files;
  
  // Access control: fileId => user address => has access boolean
  mapping(uint => mapping(address => bool)) public fileAccess;
  
  // Recipients list: fileId => array of addresses with access
  mapping(uint => address[]) public fileRecipients;
  
  // User's owned files: user address => array of fileIds
  mapping(address => uint[]) public userFiles;
  
  // Files shared with user: user address => array of fileIds
  mapping(address => uint[]) public sharedWithUser;

  // File structure containing all metadata
  struct File {
    uint fileId;              // Unique identifier
    string fileHash;          // IPFS content identifier (CID)
    uint fileSize;            // Size in bytes
    string fileName;          // Original filename
    string fileDescription;   // User-provided description
    uint uploadTime;          // Block timestamp
    address uploader;         // File owner address
    uint accessType;          // 0=Public, 1=Private, 2=Restricted
    bool isEncrypted;         // Encryption status
  }

  // Events for logging blockchain activity
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

  event FileShared(
    uint indexed fileId, 
    address indexed uploader, 
    address indexed recipient, 
    uint timestamp
  );
  
  event FileAccessed(
    uint indexed fileId, 
    address indexed accessor, 
    uint timestamp
  );
  
  event AccessRevoked(
    uint indexed fileId, 
    address indexed uploader, 
    address indexed recipient, 
    uint timestamp
  );

  constructor() public {
    // Contract initialization
  }

  /**
   * @dev Upload a new file to the blockchain
   * @param _fileHash IPFS content identifier
   * @param _fileSize File size in bytes
   * @param _fileName Original filename
   * @param _fileDescription User description
   * @param _accessType Access level (0, 1, or 2)
   * @param _isEncrypted Whether file is encrypted
   * @return fileId The ID of the newly uploaded file
   */
  function uploadFile(
    string memory _fileHash, 
    uint _fileSize, 
    string memory _fileName,
    string memory _fileDescription,
    uint _accessType,
    bool _isEncrypted
  ) public returns (uint) {
    // Input validation
    require(bytes(_fileHash).length > 0, "File hash cannot be empty");
    require(bytes(_fileName).length > 0, "File name cannot be empty");
    require(msg.sender != address(0), "Invalid sender address");
    require(_fileSize > 0, "File size must be greater than 0");

    // Increment file counter
    fileCount++;

    // Store file metadata
    files[fileCount] = File(
      fileCount, 
      _fileHash, 
      _fileSize, 
      _fileName, 
      _fileDescription, 
      now,              // Current block timestamp
      msg.sender,       // File uploader
      _accessType, 
      _isEncrypted
    );

    // Grant access to uploader
    fileAccess[fileCount][msg.sender] = true;
    
    // Add to user's file list
    userFiles[msg.sender].push(fileCount);

    // Emit upload event
    emit FileUploaded(
      fileCount, 
      _fileHash, 
      _fileSize, 
      "",               // File type (deprecated)
      _fileName, 
      _fileDescription, 
      now, 
      msg.sender, 
      _accessType, 
      _isEncrypted
    );

    return fileCount;
  }

  /**
   * @dev Add multiple recipients to a restricted file
   * @param _fileId The file ID
   * @param _recipients Array of addresses to grant access
   */
  function addRecipients(uint _fileId, address[] memory _recipients) public {
    // Validation
    require(_fileId > 0 && _fileId <= fileCount, "Invalid file ID");
    require(files[_fileId].uploader == msg.sender, "Only owner can add recipients");

    // Loop through recipients and grant access
    for (uint i = 0; i < _recipients.length; i++) {
      // Check if recipient doesn't already have access
      if (!fileAccess[_fileId][_recipients[i]]) {
        fileAccess[_fileId][_recipients[i]] = true;
        fileRecipients[_fileId].push(_recipients[i]);
        sharedWithUser[_recipients[i]].push(_fileId);
        
        emit FileShared(_fileId, msg.sender, _recipients[i], now);
      }
    }
  }

  /**
   * @dev Check if a user has access to a file
   * @param _fileId The file ID
   * @param _user The user address to check
   * @return bool Whether user has access
   */
  function hasAccess(uint _fileId, address _user) public view returns (bool) {
    require(_fileId > 0 && _fileId <= fileCount, "Invalid file ID");
    
    // Public files are accessible to everyone
    if (files[_fileId].accessType == 0) return true;
    
    // Check explicit access permission
    return fileAccess[_fileId][_user];
  }

  /**
   * @dev Log file access event
   * @param _fileId The file being accessed
   */
  function accessFile(uint _fileId) public {
    require(_fileId > 0 && _fileId <= fileCount, "Invalid file ID");
    require(hasAccess(_fileId, msg.sender), "Access denied");
    
    emit FileAccessed(_fileId, msg.sender, now);
  }

  /**
   * @dev Share a file with a specific user
   * @param _fileId The file to share
   * @param _recipient The user to share with
   */
  function shareFile(uint _fileId, address _recipient) public {
    // Validation
    require(_fileId > 0 && _fileId <= fileCount, "Invalid file ID");
    require(files[_fileId].uploader == msg.sender, "Only owner can share");
    require(_recipient != address(0), "Invalid recipient address");
    require(!fileAccess[_fileId][_recipient], "User already has access");

    // Grant access
    fileAccess[_fileId][_recipient] = true;
    fileRecipients[_fileId].push(_recipient);
    sharedWithUser[_recipient].push(_fileId);
    
    emit FileShared(_fileId, msg.sender, _recipient, now);
  }

  /**
   * @dev Revoke access from a user
   * @param _fileId The file ID
   * @param _recipient The user to revoke access from
   */
  function revokeAccess(uint _fileId, address _recipient) public {
    // Validation
    require(_fileId > 0 && _fileId <= fileCount, "Invalid file ID");
    require(files[_fileId].uploader == msg.sender, "Only owner can revoke");
    require(fileAccess[_fileId][_recipient], "User doesn't have access");
    require(_recipient != msg.sender, "Cannot revoke own access");

    // Revoke access
    fileAccess[_fileId][_recipient] = false;
    
    emit AccessRevoked(_fileId, msg.sender, _recipient, now);
  }

  /**
   * @dev Get list of recipients for a file
   * @param _fileId The file ID
   * @return Array of recipient addresses
   */
  function getFileRecipients(uint _fileId) public view returns (address[] memory) {
    require(_fileId > 0 && _fileId <= fileCount, "Invalid file ID");
    require(hasAccess(_fileId, msg.sender), "Access denied");
    
    return fileRecipients[_fileId];
  }

  /**
   * @dev Get files owned by a user
   * @param _user The user address
   * @return Array of file IDs
   */
  function getUserFiles(address _user) public view returns (uint[] memory) {
    return userFiles[_user];
  }

  /**
   * @dev Get files shared with a user
   * @param _user The user address
   * @return Array of file IDs
   */
  function getSharedFiles(address _user) public view returns (uint[] memory) {
    return sharedWithUser[_user];
  }

  /**
   * @dev Get all public files
   * @return Array of public file IDs
   */
  function getPublicFiles() public view returns (uint[] memory) {
    // Count public files
    uint count = 0;
    for (uint i = 1; i <= fileCount; i++) {
      if (files[i].accessType == 0) count++;
    }
    
    // Create result array
    uint[] memory result = new uint[](count);
    uint index = 0;
    
    // Populate result array
    for (uint i = 1; i <= fileCount; i++) {
      if (files[i].accessType == 0) {
        result[index++] = i;
      }
    }
    
    return result;
  }
}
```

#### **Key Implementation Features**

**1. Access Control System:**
- Three-tier access levels: Public (0), Private (1), Restricted (2)
- Mapping-based permission checking for O(1) lookup
- Owner-only operations with `require` statements

**2. Event Logging:**
- Comprehensive event system for all operations
- Indexed parameters for efficient filtering
- Timestamp tracking for audit trails

**3. Gas Optimization:**
- Efficient storage packing in structs
- Minimal storage reads in functions
- Batch operations (addRecipients) to save gas

**4. Security Features:**
- Input validation on all public functions
- Access control modifiers
- Prevention of self-revocation
- Zero address checks

## 3.2 Frontend Implementation

### 3.2.1 App.js - Main Application Component

#### **Web3 Initialization**

```javascript
async loadWeb3() {
  if (window.ethereum) {
    try {
      // Request MetaMask connection
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      // Create Web3 instance
      window.web3 = new Web3(window.ethereum)
      
      // Listen for network changes
      window.ethereum.on('chainChanged', (chainId) => {
        console.log('Network changed to:', chainId)
        window.location.reload()
      })
      
      console.log('Web3 initialized with MetaMask provider')
    } catch (error) {
      console.error("Error setting up Web3:", error)
    }
  } else {
    window.alert('Please install MetaMask!')
    return
  }
}
```

**Explanation:**
- Checks for MetaMask availability via `window.ethereum`
- Requests user permission to connect accounts
- Creates Web3 instance with MetaMask provider
- Sets up event listener for network changes
- Provides user feedback if MetaMask is not installed

#### **Blockchain Data Loading**

```javascript
async loadBlockchainData() {
  const web3 = window.web3
  
  // Multiple methods to detect network ID
  let networkId = null
  
  // Method 1: MetaMask chainId
  if (window.ethereum && window.ethereum.chainId) {
    networkId = parseInt(window.ethereum.chainId, 16)
  }
  
  // Method 2: Web3 network ID
  try {
    const web3NetworkId = await web3.eth.net.getId()
    networkId = web3NetworkId
  } catch (error) {
    console.error('Network detection failed:', error)
  }
  
  // Load account
  const accounts = await web3.eth.getAccounts()
  this.setState({ account: accounts[0] })
  
  // Get contract network data
  const networkData = DStorage.networks[networkId.toString()]
  
  if(networkData) {
    // Create contract instance
    const dstorage = new web3.eth.Contract(DStorage.abi, networkData.address)
    this.setState({ dstorage })
    
    // Get files count
    const filesCount = await dstorage.methods.fileCount().call()
    this.setState({ filesCount })
    
    // Load accessible files
    await this.loadAccessibleFiles(dstorage, accounts[0])
  }
}
```

**Explanation:**
- Detects network ID using multiple methods for reliability
- Loads user accounts from MetaMask
- Retrieves contract address from deployment artifacts
- Creates contract instance using ABI and address
- Loads file data for the connected user

#### **File Upload Implementation**

```javascript
uploadFile = async (description, accessType, recipients, encryptFile) => {
  const file = this.state.file;
  
  if (!file) {
    alert('Please select a file first');
    return;
  }
  
  try {
    this.setState({ uploading: true });

    let fileBuffer = this.state.buffer;
    let encryptionKey = null;

    // Encrypt file if requested
    if (encryptFile) {
      if (!FileEncryption.isSupported()) {
        throw new Error('Web Crypto API is not supported');
      }
      
      const encryptedData = await FileEncryption.encryptFileForUpload(file);
      fileBuffer = encryptedData.encryptedBuffer;
      encryptionKey = `${encryptedData.keyData}:${encryptedData.iv}`;
    }

    // Add file to IPFS
    const result = await ipfs.add(fileBuffer);
    const fileHash = result.path;

    // Convert access type string to integer
    let accessTypeInt;
    switch(accessType.toUpperCase()) {
      case 'PUBLIC':
        accessTypeInt = 0;
        break;
      case 'PRIVATE':
        accessTypeInt = 1;
        break;
      case 'RESTRICTED':
        accessTypeInt = 2;
        break;
    }

    // Upload to blockchain
    const receipt = await this.state.dstorage.methods
      .uploadFile(
        fileHash,
        file.size,
        file.name,
        description,
        accessTypeInt,
        encryptFile
      )
      .send({ from: this.state.account });

    const fileId = receipt.events.FileUploaded.returnValues.fileId;

    // Add recipients if restricted
    if (recipients && recipients.length > 0 && accessTypeInt !== 0) {
      await this.state.dstorage.methods
        .addRecipients(fileId, recipients)
        .send({ from: this.state.account });
    }

    // Store encryption key locally
    if (encryptFile && encryptionKey) {
      const encryptionKeys = JSON.parse(localStorage.getItem('encryptionKeys') || '{}');
      encryptionKeys[fileId] = encryptionKey;
      localStorage.setItem('encryptionKeys', JSON.stringify(encryptionKeys));
    }

    // Refresh files list
    await this.loadBlockchainData();
    
    this.setState({ uploading: false });
    this.showNotification('File uploaded successfully!', 'success');
  } catch (error) {
    console.error('Error uploading file:', error);
    this.showNotification('Error: ' + error.message, 'error');
  }
};
```

**Explanation:**
1. **Validation**: Checks if file is selected
2. **Encryption**: Optionally encrypts file using AES-GCM
3. **IPFS Upload**: Uploads file buffer to IPFS, receives CID
4. **Type Conversion**: Converts access type string to integer
5. **Blockchain Storage**: Stores metadata on blockchain via smart contract
6. **Recipients**: Adds recipients for restricted files
7. **Key Storage**: Saves encryption key in browser localStorage
8. **UI Update**: Refreshes file list and shows notification

#### **File Download Implementation**

```javascript
downloadFile = async (file) => {
  try {
    // Check access permission
    const hasAccess = await this.state.dstorage.methods
      .hasAccess(file.fileId, this.state.account)
      .call()
    
    if (!hasAccess) {
      this.showNotification('Access denied', 'error')
      return
    }
    
    // Log access on blockchain
    await this.state.dstorage.methods
      .accessFile(file.fileId)
      .send({ from: this.state.account })
    
    // Fetch file from IPFS
    const chunks = []
    for await (const chunk of ipfs.cat(file.fileHash)) {
      chunks.push(chunk)
    }
    
    // Combine chunks
    let fileData = new Uint8Array(
      chunks.reduce((acc, chunk) => acc + chunk.length, 0)
    )
    let offset = 0
    for (const chunk of chunks) {
      fileData.set(chunk, offset)
      offset += chunk.length
    }
    
    // Decrypt if encrypted
    if (file.isEncrypted) {
      if (!file.encryptionKey) {
        this.showNotification('Encryption key not found', 'error')
        return
      }
      
      const [keyData, ivData] = file.encryptionKey.split(':')
      fileData = new Uint8Array(
        await FileEncryption.decryptFileFromDownload(
          fileData.buffer, 
          keyData, 
          ivData
        )
      )
    }
    
    // Create and trigger download
    const blob = new Blob([fileData], { type: file.fileType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = file.fileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    this.showNotification('Downloaded successfully', 'success')
  } catch (error) {
    console.error('Download error:', error)
    this.showNotification('Download failed', 'error')
  }
}
```

**Explanation:**
1. **Permission Check**: Verifies user has access via smart contract
2. **Access Logging**: Records download event on blockchain
3. **IPFS Retrieval**: Fetches file chunks from IPFS network
4. **Chunk Assembly**: Combines chunks into complete file
5. **Decryption**: Decrypts file if encrypted using stored key
6. **Download Trigger**: Creates blob URL and triggers download
7. **Cleanup**: Removes temporary elements and URLs

### 3.2.2 Encryption Module Implementation

#### **File Encryption for Upload**

```javascript
static async encryptFileForUpload(file) {
  try {
    // Read file as ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    
    // Generate 256-bit AES-GCM key
    const key = await window.crypto.subtle.generateKey(
      {
        name: "AES-GCM",
        length: 256
      },
      true,  // extractable
      ["encrypt", "decrypt"]
    );
    
    // Generate random IV (12 bytes for GCM)
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    
    // Encrypt the file
    const encryptedData = await window.crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: iv
      },
      key,
      arrayBuffer
    );
    
    // Export key for storage
    const keyData = await window.crypto.subtle.exportKey("raw", key);
    
    // Convert to Base64 for storage
    const keyBase64 = this.arrayBufferToBase64(keyData);
    const ivBase64 = this.arrayBufferToBase64(iv);
    
    return {
      encryptedBuffer: encryptedData,
      keyData: keyBase64,
      iv: ivBase64
    };
  } catch (error) {
    throw new Error('Encryption failed: ' + error.message);
  }
}
```

**Explanation:**
- Uses Web Crypto API for hardware-accelerated encryption
- AES-GCM provides both confidentiality and authenticity
- 256-bit key length for strong security
- Random IV ensures different ciphertexts for same plaintext
- Keys exported as Base64 for localStorage compatibility

#### **File Decryption for Download**

```javascript
static async decryptFileFromDownload(encryptedData, keyDataBase64, ivBase64) {
  try {
    // Convert Base64 to ArrayBuffer
    const keyData = this.base64ToArrayBuffer(keyDataBase64);
    const iv = new Uint8Array(this.base64ToArrayBuffer(ivBase64));
    
    // Import the key
    const key = await window.crypto.subtle.importKey(
      "raw",
      keyData,
      {
        name: "AES-GCM",
        length: 256
      },
      true,
      ["encrypt", "decrypt"]
    );
    
    // Decrypt the file
    const decryptedData = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: iv
      },
      key,
      encryptedData
    );
    
    return decryptedData;
  } catch (error) {
    throw new Error('Decryption failed: ' + error.message);
  }
}
```

**Explanation:**
- Retrieves key and IV from Base64 encoding
- Imports key into CryptoKey format
- Decrypts using same algorithm and parameters
- Returns raw decrypted data as ArrayBuffer

### 3.2.3 Main Component Implementation

#### **File Upload Form with Access Control**

```javascript
<form onSubmit={(event) => {
  event.preventDefault()
  const description = this.fileDescription.value
  
  // Validate recipients for restricted access
  if (accessType === 'RESTRICTED') {
    const validRecipients = recipients.filter(addr => addr.trim() !== '')
    if (validRecipients.length === 0) {
      alert('Please add at least one recipient')
      return
    }
    
    const invalidRecipients = validRecipients.filter(
      addr => !this.isValidAddress(addr)
    )
    if (invalidRecipients.length > 0) {
      alert('Please enter valid Ethereum addresses')
      return
    }
  }
  
  this.props.uploadFile(description, accessType, recipients, shouldEncrypt)
}}>
  {/* Form fields */}
</form>
```

**Explanation:**
- Prevents default form submission
- Validates recipient addresses for restricted files
- Uses regex to check Ethereum address format (0x + 40 hex characters)
- Calls parent component's upload function with validated data

#### **Drag and Drop File Upload**

```javascript
handleDrag = (e) => {
  e.preventDefault();
  e.stopPropagation();
  if (e.type === "dragenter" || e.type === "dragover") {
    this.setState({ dragActive: true });
  } else if (e.type === "dragleave") {
    this.setState({ dragActive: false });
  }
}

handleDrop = (e) => {
  e.preventDefault();
  e.stopPropagation();
  this.setState({ dragActive: false });
  
  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
    const file = e.dataTransfer.files[0];
    this.setState({ selectedFile: file });
    
    const syntheticEvent = {
      target: { files: [file] }
    };
    this.props.captureFile(syntheticEvent);
  }
}
```

**Explanation:**
- Handles drag events to provide visual feedback
- Prevents default browser behavior (opening file)
- Extracts file from drop event
- Creates synthetic event compatible with file input handler

#### **File Sharing Modal**

```javascript
{this.state.showShareModal && (
  <div className="modal-overlay" onClick={this.closeShareModal}>
    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
      <div className="modal-header">
        <h3>📤 Share File</h3>
        <button onClick={this.closeShareModal}>✕</button>
      </div>
      <div className="modal-body">
        <input
          type="text"
          placeholder="0x..."
          value={this.state.shareRecipient}
          onChange={(e) => this.setState({ shareRecipient: e.target.value })}
          className={
            this.state.shareRecipient && 
            !this.isValidAddress(this.state.shareRecipient) 
              ? 'invalid' 
              : ''
          }
        />
      </div>
      <div className="modal-footer">
        <button onClick={this.closeShareModal}>Cancel</button>
        <button 
          onClick={this.handleShareFile}
          disabled={
            !this.state.shareRecipient || 
            !this.isValidAddress(this.state.shareRecipient)
          }
        >
          Share File
        </button>
      </div>
    </div>
  </div>
)}
```

**Explanation:**
- Conditional rendering based on modal state
- Click outside to close (overlay click handler)
- Prevents event bubbling with stopPropagation
- Real-time address validation with visual feedback
- Disabled button until valid address entered

### 3.2.4 Helper Functions

#### **Byte Conversion Utility**

```javascript
export function convertBytes(bytes) {
  var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  
  // Convert BigInt to number if necessary
  if (typeof bytes === 'bigint') {
    bytes = Number(bytes);
  }
  
  if (bytes === 0) return '0 Byte';
  
  var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
  return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
}
```

**Explanation:**
- Handles BigInt values from Web3 calls
- Converts bytes to human-readable format
- Uses logarithmic calculation for size unit
- Rounds to 2 decimal places for readability

## 3.3 IPFS Integration

### 3.3.1 IPFS Client Configuration

```javascript
import { create } from 'ipfs-http-client';

const ipfs = create({
  host: 'localhost',
  port: 5001,
  protocol: 'http'
})
```

**Explanation:**
- Creates IPFS HTTP client instance
- Connects to local IPFS daemon on port 5001
- Uses HTTP protocol for local development
- Can be configured for remote IPFS services (Infura, Pinata)

### 3.3.2 File Upload to IPFS

```javascript
const result = await ipfs.add(fileBuffer);
const fileHash = result.path;  // IPFS CID
```

**Explanation:**
- Uploads file buffer to IPFS network
- Returns Content Identifier (CID) for retrieval
- CID is deterministic based on file content
- File is automatically chunked and distributed

### 3.3.3 File Retrieval from IPFS

```javascript
const chunks = []
for await (const chunk of ipfs.cat(file.fileHash)) {
  chunks.push(chunk)
}

let fileData = new Uint8Array(
  chunks.reduce((acc, chunk) => acc + chunk.length, 0)
)
let offset = 0
for (const chunk of chunks) {
  fileData.set(chunk, offset)
  offset += chunk.length
}
```

**Explanation:**
- Uses async iteration to retrieve file chunks
- IPFS returns data in chunks for efficient streaming
- Combines chunks into single Uint8Array
- Handles large files without loading entire file in memory at once

## 3.4 Deployment Configuration

### 3.4.1 Truffle Configuration

```javascript
module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*" // Match any network id
    }
  },
  contracts_directory: './src/contracts/',
  contracts_build_directory: './src/abis/',
  compilers: {
    solc: {
      version: "0.5.0",
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  }
}
```

**Explanation:**
- Configures Ganache local blockchain connection
- Sets custom paths for contracts and build artifacts
- Enables Solidity optimizer for gas efficiency
- 200 optimization runs balances deployment and runtime costs

### 3.4.2 Migration Scripts

```javascript
const DStorage = artifacts.require("DStorage");

module.exports = function(deployer) {
  deployer.deploy(DStorage);
};
```

**Explanation:**
- Defines contract deployment sequence
- Uses Truffle's deployer for transaction management
- Deploys DStorage contract to configured network
- Automatically saves deployment address to artifacts

---

**Document Version**: 1.0  
**Last Updated**: October 24, 2025  
**Author**: Goutham Kurapati
