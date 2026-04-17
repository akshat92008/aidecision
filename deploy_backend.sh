#!/bin/bash

# Nexus OS - Backend Deployment Utility
# This script uses environment variables for security.
# Ensure GROQ_API_KEY is set in your environment.

if [[ -z "$GROQ_API_KEY" ]]; then
    echo "❌ Error: GROQ_API_KEY is not set. Run 'export GROQ_API_KEY=your_key' first."
    exit 1
fi

echo "🚀 Deploying Nexus OS Strategic Modules (Backend)..."

cd nexus-runway-guardian

gcloud run deploy nexus-runway-guardian \
  --source . \
  --project ai-decision-machine \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars="GCP_PROJECT_ID=ai-decision-machine,GCP_LOCATION=us-central1,GROQ_API_KEY=$GROQ_API_KEY"

echo "✅ Backend Core Live!"
