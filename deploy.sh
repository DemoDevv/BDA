#!/bin/bash

# Check if Docker container named 'bda' exists
container_exists=$(docker ps -a | grep bda | wc -l)

# Check if Docker image named 'bda-image' exists
image_exists=$(docker images | grep bda-image | wc -l)

# Remove container and image if both exist
if [ $container_exists -gt 0 ] && [ $image_exists -gt 0 ]; then
  echo "Removing container 'bda' and image 'bda-image'..."
  docker rm -f bda
  docker rmi bda-image
else
  echo "Container or image doesn't exist. Skipping removal."
fi

mkdir data
chmod 756 data
docker build --pull -t bda-image .
docker run --name bda -v ./data:/usr/src/app/data bda-image
