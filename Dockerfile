# 1단계: Node.js 애플리케이션을 빌드합니다.
FROM node:20-alpine as build
RUN mkdir -p /usr/app
WORKDIR /usr/app

# Install dependencies based on the preferred package manager
COPY ./ ./

RUN yarn install
RUN yarn build

EXPOSE 8083

CMD ["yarn", "start"]
