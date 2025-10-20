FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production


COPY . .

EXPOSE 3000

# Start the app
CMD ["node", "--dns-result-order=ipv4first", "app.js"]