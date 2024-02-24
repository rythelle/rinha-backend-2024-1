FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci --production --silent

# For hyper-express
RUN apk add --no-cache libc6-compat

COPY . .

# EXPOSE 3000

# CMD ["npm", "run", "start"]