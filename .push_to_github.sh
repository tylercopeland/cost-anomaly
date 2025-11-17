#!/bin/bash
set -e
cd /Users/tyler/cost-anomaly

echo "Step 1: Updating pnpm lockfile..."
pnpm install || npm install

echo "Step 2: Staging all changes..."
git add -A

echo "Step 3: Committing changes..."
git commit -m "Update pnpm lockfile and cost anomaly details: improved chart with centered today's date, projection trend, better visibility" || echo "Nothing to commit"

echo "Step 4: Pushing to GitHub..."
git push origin main

echo "Step 5: Verifying..."
git log --oneline -1
git status

echo "Done!"

