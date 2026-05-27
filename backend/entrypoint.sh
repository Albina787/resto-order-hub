#!/bin/sh
# Copy seed images to uploads volume only if it's empty (first run)
if [ -z "$(ls -A /app/uploads/images 2>/dev/null)" ]; then
  echo "Uploads volume is empty — copying seed images..."
  cp -r /app/uploads-seed/. /app/uploads/
  echo "Seed images copied successfully."
else
  echo "Uploads volume already has files — skipping seed copy."
fi

exec java -jar app.jar
