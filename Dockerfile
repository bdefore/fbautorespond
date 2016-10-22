FROM node:6.9.1
ADD package.json .
ADD fbautorespond.js .
RUN npm install
ENTRYPOINT ["node", "fbautorespond.js"]
