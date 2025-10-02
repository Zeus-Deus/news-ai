"""
Deploy the complete news pipeline with a schedule to run every 15 minutes.
"""
import os
import sys

# Use relative paths instead of hardcoded Docker paths
script_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(script_dir)
sys.path.insert(0, project_root)

from dotenv import load_dotenv
load_dotenv(dotenv_path=os.path.join(project_root, ".env"))

from prefect.deployments import Deployment
from prefect.filesystems import LocalFileSystem
from prefect.client.schemas.schedules import IntervalSchedule
from datetime import timedelta
from app_flows.flows.complete_news_pipeline_flow import complete_news_pipeline_flow

async def delete_existing_deployment():
    """Delete existing deployment if it exists."""
    try:
        from prefect import get_client
        async with get_client() as client:
            deployments = await client.read_deployments()
            for deployment in deployments:
                if deployment.name == "scheduled-news-pipeline":
                    print(f"🗑️ Deleting existing deployment: {deployment.name}")
                    await client.delete_deployment(deployment.id)
                    print("✅ Existing deployment deleted")
                    return True
        return False
    except Exception as e:
        print(f"⚠️ Warning: Could not delete existing deployment: {e}")
        return False

def deploy_scheduled_flow():
    """Deploy the scheduled news pipeline flow."""
    try:
        # First, try to delete any existing deployment
        import asyncio
        asyncio.run(delete_existing_deployment())

        print(f"📂 Project root: {project_root}")
        print(f"📂 Flow file location: {os.path.abspath(__file__)}")

        # For agents with volume-mounted code, use LocalFileSystem storage
        # Agents handle volume mounts better than workers for local development
        storage = LocalFileSystem(basepath=project_root)
        
        deployment = Deployment.build_from_flow(
            flow=complete_news_pipeline_flow,
            name="scheduled-news-pipeline",
            schedules=[IntervalSchedule(interval=timedelta(minutes=15))],
            work_queue_name="default",  # Use work queue for agents
            storage=storage,  # Tell agent where code is located
            is_schedule_active=True,
            description="Automatically collects and processes news articles every 15 minutes",
            path="/usr/src/app",  # Explicit working directory
            entrypoint="app_flows/flows/complete_news_pipeline_flow.py:complete_news_pipeline_flow",
        )

        # Apply the deployment
        deployment_id = deployment.apply()
        print(f"✅ Deployment created with ID: {deployment_id}")
        print(f"📅 Schedule: Every 15 minutes")
        print(f"🚀 Code location: {project_root} (via volume mount)")
        print(f"🚀 The pipeline will now run automatically!")

        return deployment_id

    except Exception as e:
        print(f"❌ Error creating deployment: {e}")
        import traceback
        traceback.print_exc()
        return None

if __name__ == "__main__":
    deploy_scheduled_flow()

