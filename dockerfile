# مرحلة البناء
FROM node:20-bullseye AS build
WORKDIR /app

# نسخ ملفات package
COPY package*.json ./

# تثبيت أدوات البناء لحل مشاكل Rollup native
RUN apt-get update && apt-get install -y build-essential python3

# تثبيت الحزم
RUN npm ci --legacy-peer-deps

# نسخ باقي المشروع
COPY . .

# بناء Vite
RUN npx vite build

# مرحلة الخادم
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]