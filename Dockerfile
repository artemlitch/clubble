FROM mhart/alpine-node:6.2.1

RUN mkdir -p /app
WORKDIR /app
RUN apk add -U git && npm i -g bower

ADD package.json /app
RUN npm install

RUN mkdir -p /app/public
WORKDIR /app/public
ADD public/bower.json /app/public
RUN bower install --allow-root
WORKDIR /app

ADD . /app

CMD ["node", "bin/www"]
