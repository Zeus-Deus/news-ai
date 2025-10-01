"""
Deploy the complete news pipeline with a schedule to run every 15 minutes.
"""
import sys
sys.path.insert(0, '/usr/src/app')

from dotenv import load_dotenv
load_dotenv(dotenv_path="/usr/src/app/.env")

from prefect.deployments import Deployment
from prefect.server.schemas.schedules import IntervalSchedule
from datetime import timedelta
from app_flows.flows.complete_news_pipeline_flow import complete_news_pipeline_flow

# Create deployment with 15-minute interval
deployment = Deployment.build_from_flow(
    flow=complete_news_pipeline_flow,
    name="scheduled-news-pipeline",
    schedules=[IntervalSchedule(interval=timedelta(minutes=15))],
    work_queue_name="default",
    is_schedule_active=True,
    description="Automatically collects and processes news articles every 15 minutes"
)

if __name__ == "__main__":
    # Apply the deployment
    deployment_id = deployment.apply()
    print(f"✅ Deployment created with ID: {deployment_id}")
    print(f"📅 Schedule: Every 15 minutes")
    print(f"🚀 The pipeline will now run automatically!")

