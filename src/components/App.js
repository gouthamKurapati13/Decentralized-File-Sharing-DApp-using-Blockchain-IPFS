import DStorage from '../abis/DStorage.json'
import React, { Component } from 'react';
import Navbar from './Navbar'
import Main from './Main'
import Web3 from 'web3';
import './App.css';
import { create } from 'ipfs-http-client';
import { Buffer } from 'buffer';
import NotificationToast from './NotificationToast';

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
        // Load files&sort by the newest
        for (var i = filesCount; i >= 1; i--) {
          const file = await dstorage.methods.files(i).call()
          
          // Convert BigInt values to regular numbers for compatibility
          const processedFile = {
            ...file,
            fileSize: typeof file.fileSize === 'bigint' ? Number(file.fileSize) : file.fileSize,
            uploadTime: typeof file.uploadTime === 'bigint' ? Number(file.uploadTime) : file.uploadTime,
            fileId: typeof file.fileId === 'bigint' ? Number(file.fileId) : file.fileId
          }
          
          this.setState({
            files: [...this.state.files, processedFile]
          })
        }
        console.log('✅ DStorage loaded successfully!')
        this.showNotification('✅ Connected to blockchain successfully!', 'success')
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

  // Get file from user
  captureFile = event => {
    event.preventDefault()

    const file = event.target.files[0]
    const reader = new window.FileReader()

    reader.readAsArrayBuffer(file)
    reader.onloadend = () => {
      this.setState({
        buffer: Buffer.from(reader.result),
        type: file.type,
        name: file.name
      })
      console.log('buffer', this.state.buffer)
    }
  }

  uploadFile = async description => {
    console.log("Submitting file to IPFS...")

    try {
      // Add file to the IPFS
      const result = await ipfs.add(this.state.buffer)
      console.log('IPFS result', result)
      
      this.setState({ loading: true })
      // Assign value for the file without extension
      if(this.state.type === ''){
        this.setState({type: 'none'})
      }
      
      // Use the path instead of cid.toString() for newer IPFS versions
      const fileHash = result.path || result.cid.toString()
      
      this.state.dstorage.methods.uploadFile(fileHash, result.size, this.state.type, this.state.name, description).send({ from: this.state.account }).on('transactionHash', (hash) => {
        this.setState({
         loading: false,
         type: null,
         name: null
       })
       this.showNotification(`🎉 File "${this.state.name}" uploaded successfully!`, 'success')
       window.location.reload()
      }).on('error', (e) =>{
        this.showNotification('Failed to save file to blockchain', 'error')
        this.setState({loading: false})
      })
    } catch(error) {
      console.error('IPFS error:', error)
      let errorMessage = 'Error uploading to IPFS'
      
      if (error.message && error.message.includes('fetch')) {
        errorMessage = 'Cannot connect to IPFS node. Please make sure IPFS is running locally on port 5001.'
      } else if (error.message && error.message.includes('401')) {
        errorMessage = 'IPFS authentication error. Please check your IPFS configuration.'
      } else if (error.message && error.message.includes('project id required')) {
        errorMessage = 'IPFS API requires authentication. Please set up a local IPFS node or configure API keys.'
      }
      
      this.showNotification(errorMessage, 'error')
      this.setState({loading: false})
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
      notification: null
    }
    this.uploadFile = this.uploadFile.bind(this)
    this.captureFile = this.captureFile.bind(this)
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
                files={this.state.files}
                captureFile={this.captureFile}
                uploadFile={this.uploadFile}
                loading={this.state.loading}
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