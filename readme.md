# Build image

docker build -t oyt-backend .

# Run container in detach mode

docker run -p 3000:3000 -d oyt-backend

# Stop container

docker stop CONTAINER_ID

# Get container logs

docker logs CONTAINER_ID


# Update dependencies

npx npm-upgrade