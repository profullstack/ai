#!/bin/bash

# AI Agent Installation Script
echo "🤖 Installing @profullstack/ai..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "📦 pnpm not found. Installing pnpm..."
    npm install -g pnpm
fi

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Make CLI executable
echo "🔧 Setting up CLI..."
chmod +x bin/cli.js

# Run tests
echo "🧪 Running tests..."
pnpm test

echo "✅ Installation complete!"
echo ""
echo "🚀 You can now use the AI agent:"
echo "  ./bin/cli.js                    # Start interactive mode"
echo "  ./bin/cli.js ask 'Hello!'       # Ask a single question"
echo "  ./bin/cli.js config --show      # Show configuration"
echo ""
echo "📖 For more information, see README.md"