# Install native dependencies on the same architecture as the runtime image.
FROM node:24-alpine AS dependencies
WORKDIR /usr/app
ENV NEXT_TELEMETRY_DISABLED=1

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --non-interactive --network-timeout 100000

FROM dependencies AS build
COPY ./ ./
ARG NEXT_PUBLIC_SERVER_URL
ARG NEXT_PUBLIC_IMAGE_SERVER_URL
ARG NEXT_PUBLIC_BUILD_STATIC_EXPORT=false
ENV NEXT_PUBLIC_SERVER_URL=$NEXT_PUBLIC_SERVER_URL
ENV NEXT_PUBLIC_IMAGE_SERVER_URL=$NEXT_PUBLIC_IMAGE_SERVER_URL
ENV NEXT_PUBLIC_BUILD_STATIC_EXPORT=$NEXT_PUBLIC_BUILD_STATIC_EXPORT
RUN yarn build

# Standalone output contains the runtime dependencies; no second install is needed.
FROM node:24-alpine AS production
WORKDIR /usr/app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=8083 \
    HOSTNAME=0.0.0.0

COPY --from=build --chown=node:node /usr/app/.next/standalone ./
COPY --from=build --chown=node:node /usr/app/.next/static ./.next/static
COPY --from=build --chown=node:node /usr/app/public ./public

USER node
EXPOSE 8083
CMD ["node", "server.js"]
