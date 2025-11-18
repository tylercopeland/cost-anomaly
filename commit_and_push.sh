#!/bin/bash
set -e
cd /Users/tyler/cost-anomaly

echo "=== Step 1: Checking git status ==="
git status

echo ""
echo "=== Step 2: Installing npm dependencies ==="
npm install

echo ""
echo "=== Step 3: Removing pnpm lockfile ==="
git rm -f pnpm-lock.yaml 2>&1 || echo "pnpm-lock.yaml not found or already removed"

echo ""
echo "=== Step 4: Staging all changes ==="
git add -A
git status --short

echo ""
echo "=== Step 5: Committing changes ==="
git commit -m "Update cost anomaly details: improved chart with centered today's date, projection trend, switch to npm" || echo "Nothing to commit"

echo ""
echo "=== Step 6: Pushing to GitHub ==="
git push origin main

echo ""
echo "=== Step 7: Verifying ==="
git log --oneline -1
git status

echo ""
echo "=== Done! ==="


