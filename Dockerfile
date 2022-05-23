#  Dockerfile for Node Express Backend api (development)
FROM node:current-alpine

# ARG NODE_ENV=development

# Create App Directory
# RUN mkdir -p /app
WORKDIR /app

# Install Dependencies
COPY package*.json ./

# Copy app source code
COPY ./ ./

RUN npm ci

# Exports
EXPOSE 5050

CMD ["npm", "run", "start"]
