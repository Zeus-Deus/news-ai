#!/bin/bash
set -e

echo "🚀 Starting News AI Container..."

# Wait for services to be ready (simple approach)
echo "⏳ Waiting for services to start up..."
sleep 10

echo "✅ Assuming services are ready (continuing)..."

# Run the news collection flow once
echo "📡 Running initial news collection..."
if python -m app_flows; then
    echo "✅ Initial news collection completed successfully!"
else
    echo "⚠️  Initial news collection failed, but container will continue running"
fi

# Keep container running for monitoring and manual runs
echo "🔄 Container ready for monitoring. Use 'docker compose exec app python -m app_flows' for manual runs."
echo "📊 Prefect UI: http://localhost:4200"
echo "🗄️  PgAdmin: http://localhost:5050"

# Keep running
tail -f /dev/null
