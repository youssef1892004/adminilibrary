# iLibrary Dashboard - Docker Guide

## متطلبات التشغيل

- Docker
- Docker Compose

## بناء وتشغيل التطبيق باستخدام Docker

### 1. بناء صورة Docker

```bash
docker build -t ilibrary-dashboard .
```

### 2. تشغيل التطبيق باستخدام Docker

```bash
docker run -p 5000:5000 -e NODE_ENV=production ilibrary-dashboard
```

### 3. تشغيل التطبيق باستخدام Docker Compose

```bash
docker-compose up -d
```

## متغيرات البيئة

- `NODE_ENV`: بيئة التشغيل (development أو production)
- `HASURA_ADMIN_SECRET`: مفتاح الوصول لـ Hasura GraphQL API

## الوصول للتطبيق

بعد تشغيل التطبيق، يمكنك الوصول إليه من خلال المتصفح على العنوان التالي:

```
http://localhost:5000
```

## إيقاف التطبيق

### إيقاف حاوية Docker

```bash
docker stop <container_id>
```

### إيقاف التطبيق باستخدام Docker Compose

```bash
docker-compose down
```

## ملاحظات هامة

- يتم تعيين المنفذ 5000 كمنفذ افتراضي للتطبيق
- يتم استخدام Node.js 20 Alpine كصورة أساسية للتطبيق
- يتم بناء التطبيق في مرحلتين لتقليل حجم الصورة النهائية
- يتم تجاهل الملفات غير الضرورية باستخدام .dockerignore