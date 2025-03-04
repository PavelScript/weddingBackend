# Use an official Node runtime as a parent image
FROM node:18-slim

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Create database directory
RUN mkdir -p database

# Initialize database
RUN npm run init-db

# Expose the port the app runs on
EXPOSE 5000

# Command to run the application
CMD ["npm", "start"]