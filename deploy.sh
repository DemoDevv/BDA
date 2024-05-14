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

volume_exists=$(docker volume ls | grep bda-data | wc -l)

if [ $volume_exists -gt 0 ]; then
  echo "volume 'bda-data' already exist."
else
  echo "Volume doesn't exist. Creating volume 'bda-data'... "
  docker volume create bda-data
fi

docker build --pull -t bda-image .
docker run --name bda -v bda-data:/usr/src/app/data bda-image
