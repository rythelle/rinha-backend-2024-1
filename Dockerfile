FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci --silent

# For hyper-express
RUN apk add --no-cache libc6-compat
# RUN ln -s /lib/libc.musl-x86_64.so.1 /lib/ld-linux-x86-64.so.2

COPY . .

# RUN npm run build

# CMD ["npm", "run", "start:prod"]