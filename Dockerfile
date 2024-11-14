# 1단계: Node.js 애플리케이션을 빌드합니다.
FROM node:20-alpine AS build
WORKDIR /usr/app

# 의존성만 복사하고 설치 (캐싱 활용)
COPY package.json yarn.lock ./
RUN yarn install

# 나머지 소스 복사 및 빌드
COPY ./ ./
RUN yarn build

# 2단계: 런타임 이미지를 생성합니다.
FROM node:20-alpine AS production
WORKDIR /usr/app

# 빌드된 파일만 복사
COPY --from=build /usr/app /usr/app

# 의존성 설치 (prod only)
RUN yarn install --production

# 포트 노출
EXPOSE 8083

# 애플리케이션 실행
CMD ["yarn", "start"]
