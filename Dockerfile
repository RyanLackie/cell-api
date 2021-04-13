FROM node:14
# Create app directory
WORKDIR /api
# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json /api/
RUN npm install
# Bundle app source
COPY . /api
EXPOSE 8000
CMD [ "node", "index.js" ]
