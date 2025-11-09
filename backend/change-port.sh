#!/bin/bash

# Script to change backend port from 4000 to 4001

echo "🔄 Changing backend port from 4000 to 4001..."

# Backend .env
BACKEND_ENV="/Users/fatima/mindmesh/backend/.env"
if [ -f "$BACKEND_ENV" ]; then
  # Update or add PORT=4001
  if grep -q "^PORT=" "$BACKEND_ENV"; then
    sed -i.bak 's/^PORT=.*/PORT=4001/' "$BACKEND_ENV"
    echo "✅ Updated PORT in backend/.env to 4001"
  else
    echo "PORT=4001" >> "$BACKEND_ENV"
    echo "✅ Added PORT=4001 to backend/.env"
  fi
else
  echo "PORT=4001" > "$BACKEND_ENV"
  echo "✅ Created backend/.env with PORT=4001"
fi

# Frontend .env
FRONTEND_ENV="/Users/fatima/mindmesh/frontend/.env"
if [ -f "$FRONTEND_ENV" ]; then
  # Update or add VITE_API_URL
  if grep -q "^VITE_API_URL=" "$FRONTEND_ENV"; then
    sed -i.bak 's|^VITE_API_URL=.*|VITE_API_URL=http://localhost:4001|' "$FRONTEND_ENV"
    echo "✅ Updated VITE_API_URL in frontend/.env to http://localhost:4001"
  else
    echo "VITE_API_URL=http://localhost:4001" >> "$FRONTEND_ENV"
    echo "✅ Added VITE_API_URL to frontend/.env"
  fi
else
  echo "VITE_API_URL=http://localhost:4001" > "$FRONTEND_ENV"
  echo "✅ Created frontend/.env with VITE_API_URL=http://localhost:4001"
fi

echo ""
echo "✅ Port configuration updated!"
echo ""
echo "Next steps:"
echo "1. Restart backend server: cd /Users/fatima/mindmesh/backend && npm run dev"
echo "2. Restart frontend server: cd /Users/fatima/mindmesh/frontend && npm run dev"
echo "3. Verify: curl http://localhost:4001/api/health"

