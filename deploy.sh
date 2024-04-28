mkdir data
docker build --pull -t bda-image .
docker run -d -v ./data:/usr/src/app/data bda-image
