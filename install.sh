mkdir data
docker build --pull -t bda-image .
docker run -v ./data:/usr/src/app/data bda-image
