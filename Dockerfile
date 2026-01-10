FROM node:20-alpine

WORKDIR /

COPY package* ./
RUN npm install --production

COPY . .

EXPOSE 3000

CMD ["node", "server.js"]
