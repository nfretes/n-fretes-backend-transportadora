FROM public.ecr.aws/docker/library/node:20-alpine3.21 AS builder

RUN apk update
RUN apk add --no-cache git build-base gcc abuild make bash

RUN apk add --no-cache tini

USER root

RUN mkdir -p /home/node/app && chown root:root /home/node/app

WORKDIR /home/node/app

COPY ./package*.json ./
RUN yarn install

COPY . .

RUN yarn build

ARG NODE_ENV=development
ENV NODE_ENV $NODE_ENV

ENV DEBIAN_FRONTEND noninteractive

ARG PORT=80
ENV PORT $PORT
EXPOSE $PORT 9229 9230

ENTRYPOINT ["/sbin/tini", "--"]

FROM public.ecr.aws/docker/library/node:20-alpine3.21 AS production 

RUN apk update
RUN apk add --no-cache make

# Add Tini
RUN apk add --no-cache tini

RUN mkdir -p /home/node/app && chown root:root /home/node/app

USER root

WORKDIR /home/node/app

ARG NODE_ENV=production
ENV NODE_ENV $NODE_ENV

COPY --from=builder /home/node/app/package*.json ./
COPY --from=builder /home/node/app/node_modules ./node_modules/
COPY --from=builder /home/node/app/dist ./dist
COPY --from=builder /home/node/app/src ./src

ENTRYPOINT ["/sbin/tini", "--"]

CMD ["yarn", "start:prod"]


