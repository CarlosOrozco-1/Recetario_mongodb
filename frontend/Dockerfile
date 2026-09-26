FROM node:20-alpine
RUN npm install -g @angular/cli
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 4200
# Dentro de Docker el backend se llama "backend" en la red de compose,
# no localhost: por eso el arranque de contenedor usa su propio proxy.
CMD ["npm", "run", "start:docker"]
