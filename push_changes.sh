#!/bin/bash
cd /Users/tyler/cost-anomaly
echo "=== Git Status ==="
git status
echo ""
echo "=== Staging changes ==="
git add -A
git status --short
echo ""
echo "=== Committing ==="
git commit -m "Update cost anomaly details: improved chart with centered today's date, projection trend, better visibility"
echo ""
echo "=== Latest commit ==="
git log --oneline -1
echo ""
echo "=== Pushing to GitHub ==="
git push origin main
echo ""
echo "=== Push status ==="
git status

