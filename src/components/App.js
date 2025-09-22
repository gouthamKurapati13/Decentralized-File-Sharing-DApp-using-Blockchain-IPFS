import DStorage from '../abis/DStorage.json'
import React, { Component } from 'react';
import Navbar from './Navbar'
import Main from './Main'
import Web3 from 'web3';
import './App.css';
import { create } from 'ipfs-http-client';
import { Buffer } from 'buffer';
import NotificationToast from './NotificationToast';
import { FileEncryption } from './encryption';

// IPFS configuration
// For development, you need to run a local IPFS node or use a service like Pinata
const ipfs = create({
  host: 'localhost',
  port: 5001,
  protocol: 'http'
})

class App extends Component {

  async componentDidMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

  async loadWeb3() {
    if (window.ethereum) {
      try {
        // Force MetaMask connection and provider sync
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        // Create Web3 instance with current provider
        window.web3 = new Web3(window.ethereum)
        
        // Force provider to use current MetaMask network
        if (window.ethereum.networkVersion) {
          console.log('MetaMask network version:', window.ethereum.networkVersion)
        }
        
        // Listen for network changes
        window.ethereum.on('chainChanged', (chainId) => {
          console.log('Network changed to:', chainId)
          window.location.reload()
        })
        
        console.log('Web3 initialized with MetaMask provider')
      } catch (error) {
        console.error("Error setting up Web3:", error)
      }
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
      console.log('Web3 initialized with legacy provider')
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
      this.showNotification('Non-Ethereum browser detected. Please install MetaMask!', 'error')
      return
    }
    
    // Force a small delay to ensure provider is ready
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Debug: Check what network Web3 thinks we're on
    try {
      const networkId = await window.web3.eth.net.getId()
      console.log('Web3 network check after setup:', networkId)
    } catch (error) {
      console.error('Error checking network:', error)
    }
  }

  async loadBlockchainData() {
    const web3 = window.web3
    
    // Multiple methods to detect network ID
    let networkId = null
    let metamaskChainId = null
    
    console.log('=== Network Detection Debug ===')
    
    // Method 1: MetaMask ethereum.chainId
    if (window.ethereum && window.ethereum.chainId) {
      metamaskChainId = parseInt(window.ethereum.chainId, 16)
      console.log('Method 1 - ethereum.chainId:', window.ethereum.chainId, '→', metamaskChainId)
    }
    
    // Method 2: MetaMask networkVersion
    if (window.ethereum && window.ethereum.networkVersion) {
      console.log('Method 2 - ethereum.networkVersion:', window.ethereum.networkVersion)
    }
    
    // Method 3: Direct MetaMask request
    if (window.ethereum) {
      try {
        const chainId = await window.ethereum.request({ method: 'eth_chainId' })
        const chainIdDecimal = parseInt(chainId, 16)
        console.log('Method 3 - eth_chainId request:', chainId, '→', chainIdDecimal)
        if (!metamaskChainId) metamaskChainId = chainIdDecimal
      } catch (error) {
        console.error('Method 3 failed:', error)
      }
    }
    
    // Method 4: Web3 network ID
    try {
      const web3NetworkId = await web3.eth.net.getId()
      console.log('Method 4 - web3.eth.net.getId():', web3NetworkId, typeof web3NetworkId)
      networkId = web3NetworkId
    } catch (error) {
      console.error('Method 4 failed:', error)
    }
    
    // Method 5: Force use MetaMask chain ID if Web3 gives wrong result
    if (networkId === 1 && metamaskChainId && metamaskChainId !== 1) {
      console.log('🔄 Web3 detected mainnet but MetaMask shows different network, using MetaMask')
      networkId = metamaskChainId
    } else if (!networkId && metamaskChainId) {
      console.log('🔄 Using MetaMask chain ID as fallback')
      networkId = metamaskChainId
    }
    
    // Method 6: Final fallback - if we're still on mainnet, try common Ganache IDs
    if (networkId === 1) {
      console.log('🚨 Still detecting mainnet, trying Ganache defaults...')
      if (DStorage.networks['1337']) {
        console.log('📍 Forcing network to 1337 (found in contracts)')
        networkId = 1337
      } else if (DStorage.networks['5777']) {
        console.log('📍 Forcing network to 5777 (found in contracts)')
        networkId = 5777
      }
    }
    
    console.log('🎯 Final Network ID:', networkId)
    console.log('📋 Available networks in DStorage:', Object.keys(DStorage.networks))
    console.log('=== End Network Detection ===')
    
    // Load account
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })
    console.log('Connected account:', accounts[0])
    
    // Convert networkId to string to match the keys in DStorage.networks
    const networkIdString = networkId.toString()
    const networkData = DStorage.networks[networkIdString]
    
    console.log('Looking for network:', networkIdString)
    console.log('Network data found:', !!networkData)
    
    if(networkData) {
      console.log('✅ Contract address:', networkData.address)
      // Assign contract
      const dstorage = new web3.eth.Contract(DStorage.abi, networkData.address)
      this.setState({ dstorage })
      
      try {
        // Get files amount
        const filesCount = await dstorage.methods.fileCount().call()
        this.setState({ filesCount })
        console.log('✅ Files count:', filesCount)
        
        // Load accessible files for current user
        await this.loadAccessibleFiles(dstorage, accounts[0])
        
        console.log('✅ DStorage loaded successfully!')
        this.showNotification('Connected to blockchain successfully!', 'success')
      } catch (contractError) {
        console.error('❌ Error calling contract methods:', contractError)
        window.alert('Contract found but unable to call methods. Check if you\'re connected to the right network and account has permissions.')
      }
    } else {
      console.error('❌ No network data found for network ID:', networkIdString)
      console.error('Available networks:', Object.keys(DStorage.networks))
      
      // More specific error message
      const commonNets = Object.keys(DStorage.networks).filter(id => ['1337', '5777'].includes(id))
      if (commonNets.length > 0) {
        window.alert(`❌ Network mismatch!\n\nDetected: ${networkIdString}\nNeeded: ${commonNets.join(' or ')}\n\nPlease:\n1. Check MetaMask is on network ${commonNets.join(' or ')}\n2. Refresh the page\n3. Make sure the site is connected to MetaMask`)
      } else {
        window.alert(`DStorage contract not deployed to detected network ID: ${networkIdString}.\n\nAvailable networks: ${Object.keys(DStorage.networks).join(', ')}`)
      }
    }
  }

  async loadAccessibleFiles(dstorage, account) {
    try {
      // Get user's owned and shared files
      const ownedFileIds = await dstorage.methods.getUserFiles(account).call()
      const sharedFileIds = await dstorage.methods.getSharedFiles(account).call()
      const publicFileIds = await dstorage.methods.getPublicFiles().call()
      
      // Combine all file IDs, avoiding duplicates
      const allFileIds = [...new Set([...ownedFileIds, ...sharedFileIds, ...publicFileIds])]
      
      const files = []
      
      // Get stored encryption keys
      const encryptionKeys = JSON.parse(localStorage.getItem('encryptionKeys') || '{}')
      
      for (let fileId of allFileIds) {
        if (fileId > 0) { // Skip empty entries
          const file = await dstorage.methods.files(fileId).call()
          const hasAccess = await dstorage.methods.hasAccess(fileId, account).call()
          
          // Convert BigInt values to regular numbers for compatibility
          const processedFile = {
            ...file,
            fileSize: typeof file.fileSize === 'bigint' ? Number(file.fileSize) : file.fileSize,
            uploadTime: typeof file.uploadTime === 'bigint' ? Number(file.uploadTime) : file.uploadTime,
            fileId: typeof file.fileId === 'bigint' ? Number(file.fileId) : file.fileId,
            hasAccess: hasAccess,
            isOwner: file.uploader.toLowerCase() === account.toLowerCase(),
            encryptionKey: encryptionKeys[fileId] || null // Add encryption key from localStorage
          }
          
          files.push(processedFile)
        }
      }
      
      // Sort by newest first
      files.sort((a, b) => b.uploadTime - a.uploadTime)
      
      this.setState({ files })
      console.log('Loaded accessible files:', files.length)
    } catch (error) {
      console.error('Error loading accessible files:', error)
      // Fallback to loading all files (for backward compatibility)
      await this.loadAllFiles(dstorage)
    }
  }

  async loadAllFiles(dstorage) {
    try {
      const filesCount = await dstorage.methods.fileCount().call()
      const files = []
      
      // Load files & sort by the newest
      for (var i = filesCount; i >= 1; i--) {
        const file = await dstorage.methods.files(i).call()
        
        // Convert BigInt values to regular numbers for compatibility
        const processedFile = {
          ...file,
          fileSize: typeof file.fileSize === 'bigint' ? Number(file.fileSize) : file.fileSize,
          uploadTime: typeof file.uploadTime === 'bigint' ? Number(file.uploadTime) : file.uploadTime,
          fileId: typeof file.fileId === 'bigint' ? Number(file.fileId) : file.fileId,
          hasAccess: true, // Assume access for backward compatibility
          isOwner: file.uploader.toLowerCase() === this.state.account.toLowerCase()
        }
        
        files.push(processedFile)
      }
      
      this.setState({ files })
    } catch (error) {
      console.error('Error loading all files:', error)
    }
  }

  // Get file from user
  captureFile = event => {
    event.preventDefault()

    const file = event.target.files[0]
    if (!file) return

    // Check file size (limit to 50MB for demo)
    if (file.size > 50 * 1024 * 1024) {
      alert('File too large. Maximum size is 50MB.')
      return
    }

    const reader = new window.FileReader()
    reader.readAsArrayBuffer(file)
    reader.onloadend = () => {
      this.setState({
        buffer: Buffer.from(reader.result),
        file: file,
        type: file.type,
        name: file.name
      })
      console.log('File captured:', file.name, 'Size:', file.size)
    }
  }

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
        console.log('Starting file encryption...');
        if (!FileEncryption.isSupported()) {
          throw new Error('Web Crypto API is not supported in this browser');
        }
        if (!this.state.file) {
          throw new Error('No file selected for encryption');
        }
        const encryptedData = await FileEncryption.encryptFileForUpload(this.state.file);
        fileBuffer = encryptedData.encryptedBuffer;
        encryptionKey = `${encryptedData.keyData}:${encryptedData.iv}`;
        console.log('File encrypted successfully');
      }

      // Add file to IPFS
      const result = await ipfs.add(fileBuffer);
      const fileHash = result.path;
      console.log('File added to IPFS:', fileHash);

      // Validate and convert accessType
      let accessTypeInt;
      if (typeof accessType === 'string') {
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
          default:
            accessTypeInt = parseInt(accessType);
        }
      } else {
        accessTypeInt = parseInt(accessType);
      }
      
      if (isNaN(accessTypeInt) || accessTypeInt < 0 || accessTypeInt > 2) {
        throw new Error(`Invalid access type: ${accessType}. Must be PUBLIC, PRIVATE, RESTRICTED, or 0-2`);
      }

      console.log('Upload parameters:', {
        fileHash,
        fileSize: file.size,
        fileName: file.name,
        fileDescription: description,
        accessType: accessTypeInt,
        isEncrypted: encryptFile
      });

      // Upload to blockchain with description
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

      console.log('File uploaded to blockchain:', receipt);

      const fileId = receipt.events.FileUploaded.returnValues.fileId;

      // Add recipients if provided and not public
      if (recipients && recipients.length > 0 && accessTypeInt !== 0) {
        try {
          await this.state.dstorage.methods
            .addRecipients(fileId, recipients)
            .send({ from: this.state.account });
          console.log('Recipients added successfully');
        } catch (error) {
          console.warn('Error adding recipients:', error);
        }
      }

      // Store encryption key locally if file was encrypted
      if (encryptFile && encryptionKey) {
        const encryptionKeys = JSON.parse(localStorage.getItem('encryptionKeys') || '{}');
        encryptionKeys[fileId] = encryptionKey;
        localStorage.setItem('encryptionKeys', JSON.stringify(encryptionKeys));
      }

      // Refresh files list
      await this.loadBlockchainData();
      
      this.setState({ 
        uploading: false,
        file: null,
        buffer: null 
      });

      // Reset the form in Main component
      if (this.mainComponent && this.mainComponent.resetForm) {
        this.mainComponent.resetForm();
      }

      this.showNotification('File uploaded successfully!', 'success');
    } catch (error) {
      console.error('Error uploading file:', error);
      this.setState({ 
        uploading: false,
        file: null,
        buffer: null 
      });
      this.showNotification('Error uploading file: ' + error.message, 'error');
    }
  };

  // Download and decrypt file
  downloadFile = async (file) => {
    try {
      console.log('Downloading file:', file.fileName)
      this.showNotification('📥 Downloading file...', 'info')
      
      // Check access first
      const hasAccess = await this.state.dstorage.methods.hasAccess(file.fileId, this.state.account).call()
      if (!hasAccess) {
        this.showNotification('❌ Access denied to this file', 'error')
        return
      }
      
      // Log access
      await this.state.dstorage.methods.accessFile(file.fileId).send({ from: this.state.account })
      
      // Fetch file from IPFS
      const chunks = []
      for await (const chunk of ipfs.cat(file.fileHash)) {
        chunks.push(chunk)
      }
      
      let fileData = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0))
      let offset = 0
      for (const chunk of chunks) {
        fileData.set(chunk, offset)
        offset += chunk.length
      }
      
      // Handle decryption if file is encrypted
      if (file.isEncrypted) {
        if (!FileEncryption.isSupported()) {
          this.showNotification('❌ Cannot decrypt: Web Crypto API not supported', 'error')
          return
        }
        
        if (!file.encryptionKey) {
          this.showNotification('❌ Cannot decrypt: Encryption key not found. File may have been uploaded from a different browser.', 'error')
          return
        }
        
        try {
          this.showNotification('🔓 Decrypting file...', 'info')
          
          const keyParts = file.encryptionKey.split(':')
          if (keyParts.length !== 2) {
            throw new Error('Invalid encryption key format')
          }
          
          const [keyData, ivData] = keyParts
          fileData = new Uint8Array(await FileEncryption.decryptFileFromDownload(
            fileData.buffer, 
            keyData, 
            ivData
          ))
        } catch (decryptError) {
          console.error('Decryption failed:', decryptError)
          this.showNotification('❌ Failed to decrypt file. You may not have access.', 'error')
          return
        }
      }
      
      // Create download
      const blob = new Blob([fileData], { type: file.fileType })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = file.fileName
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      this.showNotification(`✅ Downloaded "${file.fileName}"`, 'success')
      
    } catch (error) {
      console.error('Download error:', error)
      this.showNotification('❌ Failed to download file: ' + error.message, 'error')
    }
  }

  // Share file with additional recipients
  shareFile = async (fileId, recipientAddress) => {
    try {
      this.showNotification('🔗 Sharing file...', 'info')
      
      await this.state.dstorage.methods.shareFile(fileId, recipientAddress).send({ 
        from: this.state.account 
      })
      
      this.showNotification(`✅ File shared with ${recipientAddress}`, 'success')
      
      // Reload files to update UI
      await this.loadAccessibleFiles(this.state.dstorage, this.state.account)
      
    } catch (error) {
      console.error('Share error:', error)
      this.showNotification('❌ Failed to share file: ' + error.message, 'error')
    }
  }

  // Revoke access from recipient
  revokeAccess = async (fileId, recipientAddress) => {
    try {
      this.showNotification('🚫 Revoking access...', 'info')
      
      await this.state.dstorage.methods.revokeAccess(fileId, recipientAddress).send({ 
        from: this.state.account 
      })
      
      this.showNotification(`✅ Access revoked from ${recipientAddress}`, 'success')
      
      // Reload files to update UI
      await this.loadAccessibleFiles(this.state.dstorage, this.state.account)
      
    } catch (error) {
      console.error('Revoke error:', error)
      this.showNotification('❌ Failed to revoke access: ' + error.message, 'error')
    }
  }

  // Show notification
  showNotification = (message, type = 'info') => {
    this.setState({ 
      notification: { message, type, id: Date.now() }
    })
  }

  // Hide notification
  hideNotification = () => {
    this.setState({ notification: null })
  }

  constructor(props) {
    super(props)
    this.state = {
      account: '',
      dstorage: null,
      files: [],
      loading: false,
      type: null,
      name: null,
      file: null,
      buffer: null,
      notification: null
    }
    this.uploadFile = this.uploadFile.bind(this)
    this.captureFile = this.captureFile.bind(this)
    this.downloadFile = this.downloadFile.bind(this)
    this.shareFile = this.shareFile.bind(this)
    this.revokeAccess = this.revokeAccess.bind(this)
  }

  render() {
    return (
      <div className="app">
        <Navbar account={this.state.account} />
        <div className="app-container">
          { this.state.loading
            ? <div className="loading-container">
                <div className="loading-spinner large"></div>
                <p className="loading-text">Processing your request...</p>
              </div>
            : <Main
                ref={(main) => { this.mainComponent = main }}
                files={this.state.files}
                captureFile={this.captureFile}
                uploadFile={this.uploadFile}
                downloadFile={this.downloadFile}
                shareFile={this.shareFile}
                revokeAccess={this.revokeAccess}
                loading={this.state.loading}
                currentAccount={this.state.account}
              />
          }
        </div>
        
        {this.state.notification && (
          <NotificationToast
            message={this.state.notification.message}
            type={this.state.notification.type}
            onClose={this.hideNotification}
          />
        )}
      </div>
    );
  }
}

export default App;