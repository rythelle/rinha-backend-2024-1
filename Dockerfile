FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci --silent

COPY . .

RUN npm run build

# CMD ["npm", "run", "start:prod"]