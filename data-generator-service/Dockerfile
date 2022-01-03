FROM node:16
WORKDIR /usr/app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 4000
WORKDIR ./dist
CMD ["node", "index.js"]

