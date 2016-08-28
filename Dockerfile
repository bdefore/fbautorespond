FROM node:6.4.0
ADD package.json .
RUN npm install
ADD main.js .
ENTRYPOINT ["node", "main.js"]
