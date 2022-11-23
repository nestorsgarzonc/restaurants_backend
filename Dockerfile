FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
COPY .envProd .env
EXPOSE 3000
CMD ["npm", "start"]