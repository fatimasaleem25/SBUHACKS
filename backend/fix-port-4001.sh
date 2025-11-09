#!/bin/bash

# Fix port to 4001

echo "🔧 Fixing port configuration to 4001..."

cd "$(dirname "$0")"

# Kill process on port 4000
echo "Stopping any process on port 4000..."
lsof -ti:4000 2>/dev/null | xargs kill -9 2>/dev/null && echo "✅ Killed process on port 4000" || echo "No process on port 4000"

# Update backend .env
if [ -f .env ]; then
  # Backup .env
  cp .env .env.backup
  # Update or add PORT=4001
  if grep -q "^PORT=" .env; then
    sed -i '' 's/^PORT=.*/PORT=4001/' .env
    echo "✅ Updated PORT in backend/.env to 4001"
  else
    echo "PORT=4001" >> .env
    echo "✅ Added PORT=4001 to backend/.env"
  fi
else
  echo "PORT=4001" > .env
  echo "✅ Created backend/.env with PORT=4001"
fi

# Update frontend .env
cd ../frontend
if [ -f .env ]; then
  # Backup .env
  cp .env .env.backup 2>/dev/null || true
  # Update or add VITE_API_URL
  if grep -q "^VITE_API_URL=" .env; then
    sed -i '' 's|^VITE_API_URL=.*|VITE_API_URL=http://localhost:4001|' .env
    echo "✅ Updated VITE_API_URL in frontend/.env to http://localhost:4001"
  else
    echo "VITE_API_URL=http://localhost:4001" >> .env
    echo "✅ Added VITE_API_URL to frontend/.env"
  fi
else
  echo "VITE_API_URL=http://localhost:4001" > .env
  echo "✅ Created frontend/.env with VITE_API_URL=http://localhost:4001"
fi

echo ""
echo "✅ Port configuration updated to 4001!"
echo ""
echo "Next steps:"
echo "1. Restart backend: cd /Users/fatima/mindmesh/backend && npm run dev"
echo "2. Restart frontend: cd /Users/fatima/mindmesh/frontend && npm run dev"
echo "3. Verify: curl http://localhost:4001/api/health"

