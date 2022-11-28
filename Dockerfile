FROM node:18-alpine
COPY package.json package.json
RUN npm install

COPY . .

CMD ["node", "dist/src/app.js"]