# 🔄 Complete Reset Guide for DStorage DApp

This guide provides comprehensive instructions for resetting IPFS, blockchain, and the entire development environment when needed during development or troubleshooting.

## 📋 Table of Contents

- [Quick Reference](#quick-reference)
- [IPFS Reset](#ipfs-reset)
- [Blockchain Reset](#blockchain-reset)
- [Complete Project Reset](#complete-project-reset)
- [Selective Resets](#selective-resets)
- [Troubleshooting](#troubleshooting)
- [Best Practices](#best-practices)

## 🚀 Quick Reference

### Most Common Reset Commands

```bash
# Quick blockchain reset (most common during development)
npx truffle migrate --reset

# Quick IPFS content cleanup
ipfs repo gc

# Full environment reset
npm run reset:all  # (if script is added to package.json)
```

## 🌐 IPFS Reset

### 1. Complete IPFS Reset

**⚠️ Warning: This will delete all local IPFS data permanently**

```bash
# Step 1: Stop IPFS daemon
pkill ipfs
# Or if using systemd
sudo systemctl stop ipfs

# Step 2: Backup current IPFS data (optional)
mv ~/.ipfs ~/.ipfs.backup.$(date +%Y%m%d_%H%M%S)

# Step 3: Remove IPFS repository
rm -rf ~/.ipfs

# Step 4: Reinitialize IPFS
ipfs init

# Step 5: Reconfigure CORS for web application
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin '["http://localhost:3000", "http://127.0.0.1:3000"]'
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Methods '["PUT", "POST", "GET"]'
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Headers '["Authorization"]'

# Step 6: Start IPFS daemon
ipfs daemon
```

### 2. IPFS Content-Only Reset

**Keep IPFS configuration but remove all stored content:**

```bash
# Remove all pinned content
ipfs pin ls --type=recursive | cut -d' ' -f1 | xargs -n1 ipfs pin rm

# Garbage collect to free space
ipfs repo gc

# Verify cleanup
ipfs repo stat
```

### 3. IPFS Configuration Reset

**Reset only IPFS configuration:**

```bash
# Stop IPFS daemon
pkill ipfs

# Reset config to defaults
ipfs config replace ~/.ipfs/config.backup  # if you have a backup
# Or manually reconfigure
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin '["http://localhost:3000", "http://127.0.0.1:3000"]'
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Methods '["PUT", "POST", "GET"]'
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Headers '["Authorization"]'
```

## ⛓️ Blockchain Reset

### 1. Ganache CLI Reset

```bash
# Stop any running Ganache processes
pkill ganache
pkill ganache-cli

# Start fresh Ganache with deterministic accounts
npx ganache-cli -p 7545 -i 1337 --deterministic

# In another terminal, redeploy contracts
npx truffle migrate --reset
```

### 2. Ganache GUI Reset

1. **Close Ganache GUI** application completely
2. **Reopen Ganache GUI**
3. **Options:**
   - **Create New Workspace**: Start completely fresh
   - **Restart Workspace**: Reset existing workspace
4. **Verify Settings:**
   - RPC Server: `127.0.0.1:7545`
   - Network ID: `1337`
   - Gas Limit: `6721975`
5. **Save and Restart**

### 3. Smart Contract Reset Only

```bash
# Navigate to project directory
cd /home/goutham-kurapati/Desktop/Fall\ 2025/Projects/dstorage-ipfs

# Clean previous build artifacts
rm -rf build/

# Recompile contracts
npx truffle compile

# Deploy fresh contracts to blockchain
npx truffle migrate --reset

# Verify deployment
npx truffle console
> DStorage.deployed().then(i => i.address)
```

## 🏗️ Complete Project Reset

### Full Environment Reset Script

```bash
#!/bin/bash
# Complete DStorage DApp Reset Script

echo "🔄 Starting complete DStorage reset..."

# Navigate to project directory
cd /home/goutham-kurapati/Desktop/Fall\ 2025/Projects/dstorage-ipfs

echo "⏹️ Stopping all services..."
# Stop all services
pkill ipfs 2>/dev/null
pkill ganache 2>/dev/null
pkill node 2>/dev/null

echo "🌐 Resetting IPFS..."
# Reset IPFS
if [ -d ~/.ipfs ]; then
    mv ~/.ipfs ~/.ipfs.backup.$(date +%Y%m%d_%H%M%S)
    echo "   IPFS data backed up"
fi

ipfs init
echo "   IPFS reinitialized"

# Configure IPFS for web app
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin '["http://localhost:3000", "http://127.0.0.1:3000"]'
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Methods '["PUT", "POST", "GET"]'
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Headers '["Authorization"]'
echo "   IPFS CORS configured"

echo "🧹 Cleaning contract build artifacts..."
# Clean and rebuild contracts
rm -rf build/
npx truffle compile
echo "   Contracts recompiled"

echo "⛓️ Starting fresh blockchain..."
# Start fresh Ganache (background)
npx ganache-cli -p 7545 -i 1337 --deterministic > ganache.log 2>&1 &
GANACHE_PID=$!

# Wait for Ganache to start
echo "   Waiting for Ganache to start..."
sleep 5

echo "🚀 Deploying contracts..."
# Deploy contracts to fresh blockchain
npx truffle migrate --reset
echo "   Contracts deployed"

echo "🌐 Starting IPFS daemon..."
# Start IPFS daemon (background)
ipfs daemon > ipfs.log 2>&1 &
IPFS_PID=$!

echo "✅ Reset complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Reset MetaMask account (Settings → Advanced → Reset Account)"
echo "   2. Import Ganache accounts to MetaMask"
echo "   3. Clear browser local storage (F12 → Application → Storage → Clear Site Data)"
echo "   4. Start React app: npm start"
echo ""
echo "📄 Process IDs:"
echo "   Ganache PID: $GANACHE_PID"
echo "   IPFS PID: $IPFS_PID"
echo ""
echo "📝 Logs:"
echo "   Ganache: tail -f ganache.log"
echo "   IPFS: tail -f ipfs.log"
```

### Save and Run Reset Script

```bash
# Save the script
chmod +x reset-all.sh

# Run complete reset
./reset-all.sh
```

## 🎯 Selective Resets

### Reset Types by Use Case

| Scenario | Commands | Time | Data Loss |
|----------|----------|------|-----------|
| **Contract changes** | `npx truffle migrate --reset` | 30s | Blockchain only |
| **IPFS issues** | `ipfs repo gc` | 10s | None |
| **Network problems** | Restart Ganache + migrate | 1m | Blockchain only |
| **Corrupted state** | Full reset script | 3m | All local data |
| **Fresh development** | Full reset + clear browser | 5m | Everything |

### Quick Troubleshooting Resets

```bash
# Network connection issues
npx truffle migrate --reset

# IPFS upload failures
ipfs repo gc && ipfs daemon --init

# MetaMask transaction errors
# Reset MetaMask account via GUI

# Smart contract call failures
rm -rf build/ && npx truffle compile && npx truffle migrate --reset

# File encryption/decryption issues
# Clear browser storage: F12 → Application → Storage → Clear
```

## 🧹 Browser and MetaMask Reset

### Clear Browser Data

1. **Open Developer Tools**: `F12`
2. **Navigate to Application Tab**
3. **Storage Section**:
   - Clear **Local Storage**
   - Clear **Session Storage**
   - Clear **IndexedDB**
   - Clear **Cookies**
4. **Click "Clear Site Data"**

### Reset MetaMask

1. **Open MetaMask Extension**
2. **Settings** → **Advanced**
3. **Reset Account** (clears transaction history)
4. **Re-import Ganache Accounts**:
   - Copy private keys from Ganache
   - MetaMask → Import Account → Private Key

### Re-import Ganache Accounts

```bash
# Get Ganache account private keys
npx ganache-cli --deterministic | grep "Private Key"

# Copy these keys to import in MetaMask
```

## 🔧 Development Scripts

### Add to package.json

```json
{
  "scripts": {
    "reset:blockchain": "npx truffle migrate --reset",
    "reset:ipfs": "ipfs repo gc",
    "reset:contracts": "rm -rf build/ && npx truffle compile && npx truffle migrate --reset",
    "reset:all": "./reset-all.sh",
    "clean": "rm -rf build/ node_modules/ package-lock.json",
    "setup": "npm install && npx truffle compile && npx truffle migrate"
  }
}
```

### Usage

```bash
# Reset blockchain only
npm run reset:blockchain

# Reset contracts and redeploy
npm run reset:contracts

# Complete environment reset
npm run reset:all

# Clean install
npm run clean && npm run setup
```

## ⚠️ Important Warnings

### Data Loss Warnings

- **IPFS Reset**: All locally stored files will be **permanently deleted**
- **Blockchain Reset**: All transaction history and deployed contracts will be **lost**
- **Browser Reset**: All encryption keys stored in local storage will be **deleted**
- **MetaMask Reset**: Transaction history will be cleared

### Recovery Considerations

- **Encrypted Files**: Cannot be recovered without encryption keys from local storage
- **IPFS Files**: May still exist on global IPFS network but won't be pinned locally
- **Smart Contracts**: Must be redeployed with new addresses
- **MetaMask History**: Transaction history is cleared but funds remain

## 📋 Reset Checklist

### Before Reset

- [ ] **Backup important files** from IPFS
- [ ] **Export MetaMask private keys** if needed
- [ ] **Note deployed contract addresses** if required
- [ ] **Save any important encryption keys** from browser storage
- [ ] **Commit code changes** to git

### After Reset

- [ ] **Verify IPFS daemon** is running (`ipfs id`)
- [ ] **Verify Ganache** is running (check port 7545)
- [ ] **Verify contracts deployed** (`npx truffle console`)
- [ ] **Re-import MetaMask accounts** from Ganache
- [ ] **Clear browser storage** for clean slate
- [ ] **Test file upload/download** functionality
- [ ] **Test encryption/decryption** if used

## 🆘 Emergency Recovery

### If Reset Fails

```bash
# Nuclear option - completely clean slate
cd /home/goutham-kurapati/Desktop/Fall\ 2025/Projects/dstorage-ipfs

# Stop everything
sudo pkill -f ipfs
sudo pkill -f ganache
sudo pkill -f node

# Remove all data
rm -rf ~/.ipfs
rm -rf build/
rm -rf node_modules/

# Reinstall everything
npm install
ipfs init
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin '["*"]'
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Methods '["PUT", "POST", "GET"]'

# Start services
npx ganache-cli -p 7545 -i 1337 --deterministic &
ipfs daemon &

# Redeploy
npx truffle compile
npx truffle migrate --reset

# Start app
npm start
```

## 📞 Support Commands

### System Status Check

```bash
# Check if services are running
ps aux | grep ipfs
ps aux | grep ganache
netstat -tulpn | grep :7545  # Ganache
netstat -tulpn | grep :5001  # IPFS API
netstat -tulpn | grep :8080  # IPFS Gateway

# Check IPFS status
ipfs id
ipfs swarm peers | wc -l

# Check Ganache connection
curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
  http://127.0.0.1:7545
```

### Logs and Debugging

```bash
# IPFS logs
ipfs log tail

# Ganache logs (if using CLI)
tail -f ganache.log

# NPM/React logs
npm start > react.log 2>&1 &
tail -f react.log
```

---

## 📝 Notes

- **Backup Strategy**: Always backup important data before resetting
- **Development Workflow**: Use selective resets during development
- **Production Consideration**: These resets are for development only
- **Version Control**: Commit changes before major resets

**Last Updated**: September 22, 2025  
**Project**: DStorage - Decentralized File Sharing DApp  
**Author**: Goutham Kurapati
