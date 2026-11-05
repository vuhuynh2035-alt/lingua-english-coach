#!/bin/bash
set -e

echo "=== Pulling latest changes from Git ==="
git pull origin main

echo "=== Building and restarting Docker container ==="
docker compose up -d --build

echo "=== Deployment status ==="
docker compose ps
