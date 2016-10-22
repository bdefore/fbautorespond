FROM node:6.9.1
ADD package.json .
RUN npm install
ADD fbautorespond.js .
ENTRYPOINT ["node", "fbautorespond.js"]
