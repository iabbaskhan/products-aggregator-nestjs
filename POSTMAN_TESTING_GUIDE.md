# Product Aggregator API - Postman Testing Guide

This guide provides comprehensive instructions for testing the Product Aggregator API using the provided Postman collection.

## 📋 Prerequisites

1. **Postman** installed on your machine
2. **Product Aggregator Service** running on `http://localhost:3060`
3. **Database** set up and seeded with initial data

## 🚀 Quick Setup

### 1. Import the Collection

1. Open Postman
2. Click **Import** button
3. Select the `Product_Aggregator_API.postman_collection.json` file
4. The collection will be imported with all endpoints and authentication configured

### 2. Generate JWT Token

You have two options to get a JWT token:

#### Option A: Use Pre-generated Token (Quick Start)
The collection comes with a pre-generated token that should work for testing:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFQSSBVc2VyIiwiZW1haWwiOiJhcGlAcHJvZHVjdGFnZ3JlZ2F0b3IuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzU5MzMzMDY4LCJleHAiOjE3OTA4NjkwNjgsImlzcyI6InByb2R1Y3QtYWdncmVnYXRvci1hcGkiLCJhdWQiOiJwcm9kdWN0LWFnZ3JlZ2F0b3ItY2xpZW50In0.0J4ZnO_7qGc1QaL5g96F8vPtiRkGVpUL3FMlydZLu30
```

#### Option B: Generate Your Own Token
1. Run the token generator: `node generate_jwt_token.js`
2. Copy the generated token
3. Update the `jwt_token` variable in Postman collection

### 3. Configure Environment Variables

The collection includes these pre-configured variables:
- `base_url`: `http://localhost:3060`
- `api_key`: `secret-api-key`
- `jwt_token`: Pre-generated JWT token

## 🔐 Authentication

The API uses **dual authentication**:
1. **API Key**: Required in `X-API-Key` header
2. **JWT Token**: Required in `Authorization: Bearer <token>` header

Both are automatically included in all requests via the collection's authentication settings.

## 📚 API Endpoints Overview

### 🏠 Products Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/products` | GET | Get all products with filtering and pagination |
| `/api/products/search` | GET | Search products by name or description |
| `/api/products/statistics` | GET | Get product statistics |
| `/api/products/stale` | GET | Get stale products |
| `/api/products/changes` | GET | Get products with recent changes |
| `/api/products/:id` | GET | Get specific product by ID |
| `/api/products/:id/price-history` | GET | Get price history for a product |

### 🔄 Real-time Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/products/changes/stream` | GET | SSE stream for real-time changes |

### 📊 Visualization Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/visualization` | GET | HTML visualization page |

### 📖 Documentation Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api` | GET | Swagger UI documentation |

## 🧪 Testing Scenarios

### 1. Basic Product Operations

**Test the main product endpoints:**

1. **Get All Products**
   - Endpoint: `GET /api/products`
   - Expected: List of products with pagination info

2. **Search Products**
   - Endpoint: `GET /api/products/search?q=wireless`
   - Expected: Products matching the search term

3. **Get Product Statistics**
   - Endpoint: `GET /api/products/statistics`
   - Expected: Statistics about total products, availability, price ranges

### 2. Advanced Filtering

**Test product filtering capabilities:**

1. **Filter by Price Range**
   ```
   GET /api/products?minPrice=50&maxPrice=200
   ```

2. **Filter by Availability**
   ```
   GET /api/products?availability=true
   ```

3. **Filter by Currency**
   ```
   GET /api/products?currency=USD
   ```

4. **Combined Filters**
   ```
   GET /api/products?name=headphones&minPrice=50&maxPrice=200&availability=true
   ```

### 3. Data Freshness Testing

**Test stale data detection:**

1. **Get Stale Products**
   - Endpoint: `GET /api/products/stale`
   - Expected: Products that haven't been updated recently

2. **Get Recent Changes**
   - Endpoint: `GET /api/products/changes?startDate=2024-01-01T00:00:00Z&endDate=2024-12-31T23:59:59Z`
   - Expected: Products with price/availability changes

### 4. Real-time Features

**Test real-time capabilities:**

1. **SSE Stream**
   - Endpoint: `GET /api/products/changes/stream`
   - Expected: Continuous stream of product changes
   - Note: This will keep the connection open

2. **Visualization Page**
   - Endpoint: `GET /api/visualization`
   - Expected: HTML page with real-time monitoring

### 5. Individual Product Details

**Test product-specific endpoints:**

1. **Get Product by ID**
   - First get a product ID from the products list
   - Then use: `GET /api/products/{product_id}`

2. **Get Price History**
   - Use: `GET /api/products/{product_id}/price-history`

## 🔍 Expected Response Formats

### Products List Response
```json
{
  "items": [
    {
      "id": "product_id",
      "externalId": "external_id",
      "name": "Product Name",
      "description": "Product Description",
      "price": 99.99,
      "currency": "USD",
      "availability": true,
      "lastUpdated": "2024-01-01T00:00:00Z",
      "provider": {
        "id": "provider_id",
        "name": "provider_name"
      }
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 20
}
```

### Statistics Response
```json
{
  "totalProducts": 100,
  "availableProducts": 85,
  "unavailableProducts": 15,
  "providersCount": 3,
  "averagePrice": 125.50,
  "priceRange": {
    "min": 10.00,
    "max": 500.00
  }
}
```

### Price Changes Response
```json
[
  {
    "productId": "product_id",
    "productName": "Product Name",
    "providerName": "Provider Name",
    "oldPrice": 99.99,
    "newPrice": 89.99,
    "currency": "USD",
    "changePercentage": -10.01,
    "timestamp": "2024-01-01T00:00:00Z"
  }
]
```

## ⚠️ Common Issues & Solutions

### 1. Authentication Errors (401)
- **Problem**: Unauthorized access
- **Solution**: 
  - Verify API key is correct: `secret-api-key`
  - Check JWT token is valid and not expired
  - Ensure both headers are included

### 2. No Products Found
- **Problem**: Empty product list
- **Solution**:
  - Run the cron job to fetch data: Wait 30 seconds after starting the service
  - Check if providers are active
  - Verify database is seeded

### 3. SSE Stream Not Working
- **Problem**: No real-time updates
- **Solution**:
  - Ensure the service is running and fetching data
  - Check browser console for errors
  - Verify the stream endpoint is accessible

### 4. Invalid Date Format
- **Problem**: Date-related errors
- **Solution**:
  - Use ISO 8601 format: `2024-01-01T00:00:00Z`
  - Ensure start date is before end date

## 🎯 Testing Checklist

- [ ] Import Postman collection
- [ ] Configure authentication (API key + JWT token)
- [ ] Test basic product endpoints
- [ ] Test filtering and search
- [ ] Test real-time SSE stream
- [ ] Test visualization page
- [ ] Test error scenarios (invalid IDs, dates, etc.)
- [ ] Verify data freshness functionality
- [ ] Check Swagger documentation

## 📊 Performance Testing

For performance testing, you can:

1. **Load Testing**: Use Postman's Collection Runner with multiple iterations
2. **Concurrent Requests**: Test multiple simultaneous requests
3. **Large Data Sets**: Test with high limit values (up to 100 for products, 1000 for changes)

## 🔧 Customization

### Adding New Requests
1. Right-click on a folder in the collection
2. Select "Add Request"
3. Configure method, URL, headers, and body
4. Use collection variables: `{{base_url}}`, `{{api_key}}`, `{{jwt_token}}`

### Environment Variables
Create different environments for:
- **Development**: `http://localhost:3000`
- **Staging**: `http://staging.example.com`
- **Production**: `http://api.example.com`

## 📞 Support

If you encounter issues:
1. Check the service logs
2. Verify database connectivity
3. Ensure all environment variables are set
4. Check the Swagger documentation at `/api`

---

**Happy Testing! 🚀**
