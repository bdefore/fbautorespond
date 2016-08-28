FROM node:6.4.0
ADD package.json .
RUN npm install
ADD fbautorespond.js .
ENTRYPOINT ["node", "fbautorespond.js"]
