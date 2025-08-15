#!/bin/bash
echo "♻️ Starte Wiederherstellung..."
LATEST_BACKUP=$(ls -td backups/* | head -1)
if [ -d "$LATEST_BACKUP" ]; then
    cp -r $LATEST_BACKUP/* ./
    echo "Backup von $LATEST_BACKUP wiederhergestellt."
else
    echo "❌ Kein Backup gefunden."
fi
