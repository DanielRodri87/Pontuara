FROM node:20-alpine

WORKDIR /app

ENV CHOKIDAR_USEPOLLING=true

COPY package*.json ./

RUN if [ -f package-lock.json ]; then \
      npm ci; \
    elif [ -f package.json ]; then \
      npm install; \
    fi

COPY . /app

EXPOSE 3000

CMD ["npm", "run", "dev"]
