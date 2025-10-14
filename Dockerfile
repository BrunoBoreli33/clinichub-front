# Stage 1 — build
FROM node:20-alpine AS build
WORKDIR /app

# Copia package*
COPY package.json package-lock.json* ./
# instala dependências
RUN npm ci --silent

# copia código e builda (use REACT_APP_API_URL ou VITE_ prefixed envs se precisar)
COPY . .
# se precisar passar env de API no build (opcional):
# ARG VITE_API_URL
# RUN VITE_API_URL=${VITE_API_URL} npm run build
RUN npm run build

# Stage 2 — serve com nginx
FROM nginx:stable-alpine
# remove default html
RUN rm -rf /usr/share/nginx/html/*

# copia build
COPY --from=build /app/dist /usr/share/nginx/html

# copia config nginx (SPA fallback)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# expose porta 80 dentro do container (será mapeada para host 9004)
EXPOSE 80

# start nginx em foreground
CMD ["nginx", "-g", "daemon off;"]
