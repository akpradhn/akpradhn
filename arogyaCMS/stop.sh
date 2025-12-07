#!/bin/bash

# Arogya Clinical Management System - Stop Script

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

PORT=8000

echo -e "${YELLOW}Stopping ACMS server...${NC}"

# Kill process from PID file
if [ -f server.pid ]; then
    PID=$(cat server.pid)
    if ps -p $PID > /dev/null 2>&1; then
        kill $PID 2>/dev/null
        echo -e "${GREEN}✓ Server stopped (PID: $PID)${NC}"
    else
        echo -e "${YELLOW}Process not found, may already be stopped${NC}"
    fi
    rm server.pid
else
    echo -e "${YELLOW}No PID file found${NC}"
fi

# Kill any process on port 8000
if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
    lsof -ti:$PORT | xargs kill -9 2>/dev/null
    echo -e "${GREEN}✓ Freed port $PORT${NC}"
fi

echo -e "${GREEN}Done!${NC}"


