#!/usr/bin/env python3
import os

# Base directory for the Vue project
base_dir = "/mnt/c/dev/_ITLA2025C2/P2Saturdays/DenounceBeasts2025C2Saturdays/client-vue"

# List of directories to create
directories = [
    "src/components",
    "src/views", 
    "src/services",
    "src/stores",
    "src/types",
    "src/assets/css",
    "src/assets/js",
    "public"
]

# Create directories
for dir_path in directories:
    full_path = os.path.join(base_dir, dir_path)
    os.makedirs(full_path, exist_ok=True)
    print(f"Created: {dir_path}")

print(f"\nVue 3 project structure created successfully in {base_dir}")