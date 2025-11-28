# 构建阶段
FROM node:20-slim AS build-stage
WORKDIR /app
COPY . .
RUN npm config set registry https://registry.npmmirror.com && \
    npm install && \
    npm run build

# 生产阶段
FROM nginx:alpine
COPY --from=build-stage /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

# vite 会在打包构建时自动读取 .env.production，无需额外手动指定。
# 各种环境的不同环境变量 开发环境 生产环境 测试环境

