#!/bin/bash
cd /home/kavia/workspace/code-generation/wavelog-104976-96b1e6ae/surf_sync_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

