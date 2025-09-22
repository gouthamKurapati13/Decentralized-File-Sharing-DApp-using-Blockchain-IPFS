#!/bin/bash

# IPFS Installation Script for Linux

echo "Installing IPFS..."

# Download IPFS
cd /tmp
wget https://dist.ipfs.io/kubo/v0.22.0/kubo_v0.22.0_linux-amd64.tar.gz

# Extract and install
tar -xvzf kubo_v0.22.0_linux-amd64.tar.gz
cd kubo
sudo ./install.sh

# Initialize IPFS
echo "Initializing IPFS..."
ipfs init

# Configure CORS for web application
echo "Configuring CORS..."
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin '["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001"]'
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Methods '["PUT", "POST", "GET"]'

echo "IPFS installation complete!"
echo ""
echo "To start IPFS daemon, run:"
echo "ipfs daemon"
echo ""
echo "Then you can access the web UI at: http://localhost:5001/webui"
