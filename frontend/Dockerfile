# Stage 0, "build-stage", based on Node.js, to build and compile the frontend
FROM node:20 as build-stage

WORKDIR /app

COPY package*.json /app/

RUN npm install

RUN npm install @types/node --save-dev

COPY ./ /app/

ARG VITE_API_URL=${VITE_API_URL}

RUN npm run build


# Stage 1, based on Nginx, to have only the compiled app, ready for production with Nginx
FROM nginx:1

COPY --from=build-stage /app/dist/ /usr/share/nginx/html


COPY ./ARSMDBE3142ACSL.pem /etc/nginx/ssl/ARSMDBE3142ACSL.pem
COPY ./USDAroot.cer /etc/nginx/ssl/USDAroot.cer
COPY ./ARSMDBE3142ACSL-2026-2-certnew.p7b /etc/nginx/ssl/ARSMDBE3142ACSL-2026-2-certnew.p7b
COPY ./ARSMDBE3142ACSL.key /etc/nginx/ssl/ARSMDBE3142ACSL.key

COPY ./nginx.conf /etc/nginx/conf.d/default.conf
COPY ./nginx-backend-not-found.conf /etc/nginx/extra-conf.d/backend-not-found.conf
