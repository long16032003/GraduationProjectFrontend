# 📋 Order API Documentation

## 🚀 Overview
API endpoints để quản lý orders và order dishes trong hệ thống nhà hàng.

## 📍 Base URL
```
/api/orders
```

## 🔗 Endpoints

### 1. Tạo Order mới (POST /api/orders)

**Request Body:**
```json
{
  "bill_id": 123,
  "note": "Không cay, ít đường",
  "status": "pending",
  "order_dishes": [
    {
      "dish_id": 1,
      "quantity": 2,
      "price_at_order_time": 65000
    },
    {
      "dish_id": 3,
      "quantity": 1,
      "price_at_order_time": 45000
    }
  ]
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 456,
    "bill_id": 123,
    "creator_id": 1,
    "note": "Không cay, ít đường",
    "status": "pending",
    "order_time": "2024-01-15T10:30:00.000000Z",
    "created_at": "2024-01-15T10:30:00.000000Z",
    "updated_at": "2024-01-15T10:30:00.000000Z",
    "bill": {
      "id": 123,
      "table_id": 5,
      "customer_name": "Nguyễn Văn A",
      "total_amount": 175000
    },
    "order_dishes": [
      {
        "id": 789,
        "order_id": 456,
        "dish_id": 1,
        "quantity": 2,
        "price_at_order_time": 65000,
        "dish": {
          "id": 1,
          "name": "Phở bò tái",
          "price": 65000
        }
      }
    ]
  },
  "message": "Order created successfully",
  "order_total": 175000
}
```

### 2. Lấy danh sách Orders (GET /api/orders)

**Query Parameters:**
- `bill_id` (optional): Filter theo bill ID
- `status` (optional): Filter theo status

**Examples:**
```
GET /api/orders
GET /api/orders?bill_id=123
GET /api/orders?status=pending
GET /api/orders?bill_id=123&status=pending
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 456,
      "bill_id": 123,
      "status": "pending",
      "order_time": "2024-01-15T10:30:00.000000Z",
      "bill": { ... },
      "order_dishes": [ ... ]
    }
  ],
  "message": "Orders retrieved successfully"
}
```

### 3. Lấy Order cụ thể (GET /api/orders/{id})

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 456,
    "bill_id": 123,
    "status": "pending",
    "note": "Không cay",
    "order_time": "2024-01-15T10:30:00.000000Z",
    "bill": { ... },
    "order_dishes": [ ... ]
  },
  "message": "Order retrieved successfully"
}
```

### 4. Cập nhật trạng thái Order (PATCH /api/orders/{id}/status)

**Request Body:**
```json
{
  "status": "preparing",
  "note": "Đang chuẩn bị"
}
```

**Allowed Status Values:**
- `pending` - Chờ xử lý
- `preparing` - Đang chuẩn bị  
- `ready` - Sẵn sàng phục vụ
- `served` - Đã phục vụ
- `cancelled` - Đã hủy

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 456,
    "status": "preparing",
    "note": "Đang chuẩn bị",
    // ... other fields
  },
  "message": "Order status updated successfully"
}
```

### 5. Lấy Orders cho bếp (GET /api/orders/kitchen/pending)

Lấy tất cả orders có status `pending` hoặc `preparing` để hiển thị cho bếp.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 456,
      "bill_id": 123,
      "status": "pending",
      "order_time": "2024-01-15T10:30:00.000000Z",
      "bill": {
        "table_id": 5,
        "customer_name": "Nguyễn Văn A"
      },
      "order_dishes": [
        {
          "dish_id": 1,
          "quantity": 2,
          "dish": {
            "name": "Phở bò tái"
          }
        }
      ]
    }
  ],
  "message": "Kitchen orders retrieved successfully"
}
```

## 🚨 Error Responses

### Validation Error (422):
```json
{
  "success": false,
  "message": "The given data was invalid.",
  "errors": {
    "bill_id": ["The selected bill does not exist"],
    "order_dishes.0.quantity": ["Quantity must be at least 1"]
  }
}
```

### Not Found (404):
```json
{
  "success": false,
  "message": "Bill or Dish not found",
  "error": "No query results for model [App\\Models\\Bill] 123"
}
```

### Server Error (500):
```json
{
  "success": false,
  "message": "Failed to create order",
  "error": "Database connection failed"
}
```

## 📝 Validation Rules

### Order Creation:
- `bill_id`: Required, must exist in bills table
- `note`: Optional, max 500 characters
- `status`: Optional, must be one of: pending, preparing, ready, served, cancelled
- `order_dishes`: Required array, minimum 1 item

### Order Dishes:
- `dish_id`: Required, must exist in dishes table
- `quantity`: Required, integer, 1-99
- `price_at_order_time`: Optional, numeric, ≥ 0

## 🔧 Integration Example (JavaScript)

```javascript
// Tạo order mới
const createOrder = async (orderData) => {
  try {
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(orderData)
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('Order created:', result.data);
      return result.data;
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

// Sử dụng
const orderData = {
  bill_id: 123,
  note: "Không cay",
  order_dishes: [
    {
      dish_id: 1,
      quantity: 2,
      price_at_order_time: 65000
    }
  ]
};

createOrder(orderData);
```

## 🔐 Authentication
Hiện tại API không yêu cầu authentication, nhưng có thể thêm middleware auth nếu cần:

```php
Route::middleware('auth:sanctum')->group(function () {
    // Protected routes
});
```

## 📊 Database Schema

### orders table:
- `id` (bigint, primary key)
- `bill_id` (bigint, foreign key)
- `creator_id` (bigint, foreign key)
- `note` (text, nullable)
- `status` (enum: pending, preparing, ready, served, cancelled)
- `order_time` (timestamp)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### order_dishes table:
- `dish_id` (bigint, foreign key)
- `order_id` (bigint, foreign key)
- `quantity` (integer)
- `price_at_order_time` (decimal)
- Primary key: (dish_id, order_id) 