#!/bin/bash

# Arogya Clinical Management System - Startup Script
# This script sets up and starts the ACMS application

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
PORT=8000
VENV_DIR="venv"
LOG_FILE="server.log"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Arogya Clinical Management System${NC}"
echo -e "${BLUE}  Startup Script${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if port is in use
port_in_use() {
    lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1
}

# Function to kill process on port
kill_port() {
    if port_in_use; then
        echo -e "${YELLOW}Port $PORT is already in use. Attempting to free it...${NC}"
        lsof -ti:$PORT | xargs kill -9 2>/dev/null || true
        sleep 2
    fi
}

# Function to setup Python virtual environment
setup_venv() {
    if [ ! -d "$VENV_DIR" ]; then
        echo -e "${BLUE}Creating Python virtual environment...${NC}"
        python3 -m venv $VENV_DIR
        echo -e "${GREEN}✓ Virtual environment created${NC}"
    else
        echo -e "${GREEN}✓ Virtual environment already exists${NC}"
    fi
    
    echo -e "${BLUE}Activating virtual environment...${NC}"
    source $VENV_DIR/bin/activate
    
    # Install any Python dependencies if requirements.txt exists
    if [ -f "requirements.txt" ]; then
        echo -e "${BLUE}Installing Python dependencies...${NC}"
        pip install -q --upgrade pip
        pip install -q -r requirements.txt
        echo -e "${GREEN}✓ Dependencies installed${NC}"
    fi
}

# Function to start Python HTTP server
start_python_server() {
    echo -e "${BLUE}Starting Python HTTP server on port $PORT...${NC}"
    
    # Kill any existing process on the port
    kill_port
    
    # Start server in background
    python3 -m http.server $PORT > $LOG_FILE 2>&1 &
    SERVER_PID=$!
    
    echo $SERVER_PID > server.pid
    echo -e "${GREEN}✓ Server started (PID: $SERVER_PID)${NC}"
    echo -e "${GREEN}✓ Server log: $LOG_FILE${NC}"
}

# Function to start backend server
start_backend_server() {
    echo -e "${BLUE}Installing dependencies...${NC}"
    if [ ! -d "node_modules" ]; then
        npm install
    fi
    
    echo -e "${BLUE}Starting backend server on port $PORT...${NC}"
    
    # Kill any existing process on the port
    kill_port
    
    # Create .env if it doesn't exist
    if [ ! -f ".env" ]; then
        if [ -f ".env.example" ]; then
            cp .env.example .env
            echo -e "${YELLOW}Created .env file from .env.example${NC}"
        fi
    fi
    
    # Start server in background
    npm start > $LOG_FILE 2>&1 &
    SERVER_PID=$!
    
    echo $SERVER_PID > server.pid
    echo -e "${GREEN}✓ Backend server started (PID: $SERVER_PID)${NC}"
    echo -e "${GREEN}✓ Server log: $LOG_FILE${NC}"
}

# Function to start Node.js HTTP server (fallback)
start_node_server() {
    if ! command_exists http-server; then
        echo -e "${YELLOW}http-server not found. Installing globally...${NC}"
        npm install -g http-server
    fi
    
    echo -e "${BLUE}Starting Node.js HTTP server on port $PORT...${NC}"
    
    # Kill any existing process on the port
    kill_port
    
    # Start server in background
    http-server -p $PORT -s > $LOG_FILE 2>&1 &
    SERVER_PID=$!
    
    echo $SERVER_PID > server.pid
    echo -e "${GREEN}✓ Server started (PID: $SERVER_PID)${NC}"
    echo -e "${GREEN}✓ Server log: $LOG_FILE${NC}"
}

# Function to open browser
open_browser() {
    sleep 2  # Wait for server to start
    
    URL="http://localhost:$PORT/login.html"
    echo -e "${BLUE}Opening browser...${NC}"
    
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        open $URL
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        if command_exists xdg-open; then
            xdg-open $URL
        elif command_exists gnome-open; then
            gnome-open $URL
        else
            echo -e "${YELLOW}Please open $URL manually${NC}"
        fi
    elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
        # Windows
        start $URL
    else
        echo -e "${YELLOW}Please open $URL manually${NC}"
    fi
}

# Function to show server info
show_info() {
    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}  Server is running!${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
    echo -e "  ${BLUE}URL:${NC} http://localhost:$PORT/login.html"
    echo -e "  ${BLUE}Log:${NC} $LOG_FILE"
    echo -e "  ${BLUE}PID:${NC} $(cat server.pid 2>/dev/null || echo 'N/A')"
    echo ""
    echo -e "${YELLOW}Login Credentials:${NC}"
    echo -e "  Admin:        admin / admin123"
    echo -e "  Reception:    reception / reception123"
    echo -e "  Nurse:        nurse / nurse123"
    echo -e "  Counselor:    counselor / counselor123"
    echo -e "  Doctor:       doctor / doctor123"
    echo -e "  Embryologist: embryologist / embryo123"
    echo ""
    echo -e "${YELLOW}To stop the server:${NC}"
    echo -e "  ./stop.sh"
    echo -e "  or: kill \$(cat server.pid)"
    echo ""
}

# Function to cleanup on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}Shutting down server...${NC}"
    if [ -f server.pid ]; then
        kill $(cat server.pid) 2>/dev/null || true
        rm server.pid
    fi
    echo -e "${GREEN}✓ Server stopped${NC}"
}

# Trap Ctrl+C
trap cleanup EXIT INT TERM

# Main execution
main() {
    # Check for Python or Node.js
    if command_exists python3; then
        SERVER_TYPE="python"
    elif command_exists python; then
        SERVER_TYPE="python"
        python3() { python "$@"; }
    elif command_exists node && command_exists npm; then
        SERVER_TYPE="node"
    else
        echo -e "${RED}Error: Neither Python 3 nor Node.js found!${NC}"
        echo -e "${YELLOW}Please install Python 3 or Node.js to run the server.${NC}"
        exit 1
    fi
    
    echo -e "${BLUE}Detected server: $SERVER_TYPE${NC}"
    echo ""
    
    # Setup virtual environment (optional, for future Python dependencies)
    if [ "$SERVER_TYPE" == "python" ]; then
        setup_venv
        echo ""
    fi
    
    # Check if Node.js backend should be used
    if [ -f "package.json" ] && command_exists node && command_exists npm; then
        echo -e "${BLUE}Node.js backend detected. Starting backend server...${NC}"
        start_backend_server
    elif [ "$SERVER_TYPE" == "python" ]; then
        start_python_server
    else
        start_node_server
    fi
    
    # Open browser
    open_browser
    
    # Show info
    show_info
    
    # Keep script running
    echo -e "${BLUE}Press Ctrl+C to stop the server${NC}"
    wait
}

# Run main function
main

