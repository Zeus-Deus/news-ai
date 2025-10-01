#!/bin/bash
set -e

echo "🚀 Starting News AI Container..."

# Give services a moment to start
echo "⏳ Giving services time to start..."
until curl -s http://prefect:4200/api/health > /dev/null; do
  echo "Waiting for Prefect API..."
  sleep 5
done
echo "✅ Prefect API is ready!"
sleep 10
echo "✅ Services should be ready now!"

# Run the news collection flow once immediately
echo "📡 Running initial news collection..."
if python -m app_flows; then
    echo "✅ Initial news collection completed successfully!"
else
    echo "⚠️  Initial news collection failed, but container will continue"
fi

# Deploy the scheduled flow (runs every 15 minutes)
echo "📅 Deploying scheduled news pipeline (every 15 minutes)..."
if python app_flows/deploy_scheduled_flow.py; then
    echo "✅ Scheduled deployment created successfully!"
else
    echo "⚠️  Deployment creation failed"
fi

echo "📊 Prefect UI: https://prefect.maltem.site"
echo "🗄️  PgAdmin: https://pgadmin.maltem.site"
echo "🌐 Frontend: https://maltem.site"
echo ""
echo "🔄 Starting Prefect worker to process scheduled flows..."

# Start Prefect worker to execute scheduled flows
exec prefect worker start --pool default-agent-pool --type process
