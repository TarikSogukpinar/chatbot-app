# Use the official Node.js image as a base image
FROM node:20-alpine

# Set the working directory
WORKDIR /usr/src/app

# Copy the package files
COPY package*.json ./

# Install dependencies using npm
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the Next.js application
RUN npm run build

# Set environment variables
ENV NODE_ENV=development

# Expose port and define command to run the app
EXPOSE 3025
CMD ["npm", "start"]