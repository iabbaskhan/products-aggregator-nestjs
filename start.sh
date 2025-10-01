#!/bin/sh

echo "🚀 Starting Product Aggregator Service..."

echo "🗄️  Setting up database..."
node dist/scripts/prisma-with-config.js db push

echo "🌱 Seeding database..."
node dist/scripts/prisma-with-config.js seed

echo "🎯 Starting application..."
node dist/src/main.js
