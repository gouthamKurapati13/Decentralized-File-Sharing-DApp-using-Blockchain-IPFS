# IPFS Setup Instructions

Your application requires a local IPFS node to upload files. Here's how to set it up:

## Option 1: Install IPFS Desktop (Recommended for beginners)

1. Download IPFS Desktop from: https://github.com/ipfs/ipfs-desktop/releases
2. Install and run the application
3. IPFS Desktop will automatically start the daemon on port 5001

## Option 2: Install IPFS CLI

### On Ubuntu/Debian:
```bash
# Download and install IPFS
wget https://dist.ipfs.io/kubo/v0.22.0/kubo_v0.22.0_linux-amd64.tar.gz
tar -xvzf kubo_v0.22.0_linux-amd64.tar.gz
cd kubo
sudo bash install.sh

# Initialize IPFS
ipfs init

# Start the daemon
ipfs daemon
```

### On macOS:
```bash
# Using Homebrew
brew install ipfs

# Initialize IPFS
ipfs init

# Start the daemon
ipfs daemon
```

## Configure CORS (Required for web applications)

After installing IPFS, you need to configure CORS to allow your web application to connect:

```bash
# Stop the daemon if running (Ctrl+C)

# Configure CORS
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin '["http://localhost:3000", "http://127.0.0.1:3000"]'
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Methods '["PUT", "POST", "GET"]'

# Start the daemon again
ipfs daemon
```

## Verify Installation

Once IPFS is running, you can verify it's working by:

1. Opening http://localhost:5001/webui in your browser
2. The IPFS web UI should load successfully

## Alternative: Use Pinata (Cloud IPFS Service)

If you prefer not to run a local IPFS node, you can use Pinata:

1. Sign up at https://pinata.cloud
2. Get your API keys
3. Update the IPFS configuration in App.js to use Pinata's API

## Troubleshooting

- Make sure no other service is using port 5001
- If you get permission errors, try running with sudo
- Check firewall settings if connection fails
