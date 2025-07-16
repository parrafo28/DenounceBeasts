#!/bin/bash

# Script to create Vue 3 project folder structure

BASE_DIR="/mnt/c/dev/_ITLA2025C2/P2Saturdays/DenounceBeasts2025C2Saturdays/client-vue"

# Create the main directories
mkdir -p "$BASE_DIR/src/components"
mkdir -p "$BASE_DIR/src/views"
mkdir -p "$BASE_DIR/src/services"
mkdir -p "$BASE_DIR/src/stores"
mkdir -p "$BASE_DIR/src/types"
mkdir -p "$BASE_DIR/src/assets/css"
mkdir -p "$BASE_DIR/src/assets/js"
mkdir -p "$BASE_DIR/public"

echo "Vue 3 project folder structure created successfully!"
echo "Created directories:"
echo "- src/components"
echo "- src/views"
echo "- src/services"
echo "- src/stores"
echo "- src/types"
echo "- src/assets/css"
echo "- src/assets/js"
echo "- public"