# Base image
FROM node:22-alpine

# Create app directory
WORKDIR /usr/src/app

# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

# Install app dependencies
RUN npm install --omit=dev

# Bundle app source
COPY . .

# Prisma generate
RUN npm run prisma:generate

# Creates a "dist" folder with the production build
RUN npm run build

# Start the server using the production build
CMD [ "node", "npm", "start:prod" ]
