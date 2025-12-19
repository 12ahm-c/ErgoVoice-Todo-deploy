# ==========================
# المرحلة 1: البناء
# ==========================
FROM node:20-bullseye AS build

# تحديد مجلد العمل داخل الحاوية
WORKDIR /app

# نسخ ملفات package.json و package-lock.json فقط لتسريع البناء
COPY package*.json ./

# تثبيت الحزم بشكل نظيف ومتوافق مع peer dependencies
RUN npm ci --legacy-peer-deps

# نسخ باقي ملفات المشروع
COPY . .

# استخدام npx لتشغيل Vite بدون الحاجة لتثبيت global
RUN npx vite build

# ==========================
# المرحلة 2: الخادم (Nginx)
# ==========================
FROM nginx:alpine

# نسخ الملفات الناتجة من البناء إلى مجلد Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# تحديد المنفذ الذي سيستمع له Nginx
EXPOSE 3000

# تشغيل Nginx في foreground
CMD ["nginx", "-g", "daemon off;"]