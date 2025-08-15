#!/bin/bash
echo "🚀 Starte Deployment..."
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p backups/$DATE
cp -r * backups/$DATE/
echo "Backup erstellt unter backups/$DATE"
echo "Deployment abgeschlossen."
