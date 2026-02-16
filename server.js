import express from "express";
import cors from "cors";
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const PORT = process.env.PORT || 3000;

// MySQL Connection Pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10
});

// Test connection on startup
pool.getConnection()
  .then(connection => {
    console.log('✅ MySQL connected successfully');
    connection.release();
  })
  .catch(err => {
    console.error('❌ MySQL connection error:', err.message);
  });

/**
 * POST /api/clients
 * Get customers with pagination
 */
app.post("/api/clients", async (req, res) => {
  try {
    const { segment, customerId, limit = 10, offset = 0 } = req.body;

    console.log('📥 Search request:', { segment, customerId, limit, offset });

    // Sanitize limit/offset
    const safeLimit = Math.min(Math.max(parseInt(limit) || 10, 1), 1000);
    const safeOffset = Math.max(parseInt(offset) || 0, 0);

    // Build query
    let query = "SELECT * FROM rfm_customers WHERE 1=1";
    const params = [];

    if (segment) {
      query += " AND Segment = ?";
      params.push(segment);
    }

    if (customerId) {
      query += " AND CustomerID = ?";
      params.push(customerId);
    }

    // Add LIMIT and OFFSET
    query += ` LIMIT ${safeLimit} OFFSET ${safeOffset}`;

    console.log('🔍 Query:', query);
    console.log('📝 Params:', params);

    const [rows] = await pool.execute(query, params);

    console.log(`✅ Found ${rows.length} rows`);

    res.json({
      success: true,
      data: rows,
      meta: {
        limit: safeLimit,
        offset: safeOffset,
        rowCount: rows.length
      }
    });

  } catch (error) {
    console.error("❌ API Error:", error.message);
    res.status(500).json({
      error: error.message,
      code: "QUERY_EXECUTION_ERROR"
    });
  }
});

/**
 * POST /api/clients/count
 * Get total count of customers (for pagination)
 */
app.post("/api/clients/count", async (req, res) => {
  try {
    const { segment, customerId } = req.body;

    console.log('📊 Count request:', { segment, customerId });

    // Build count query
    let query = "SELECT COUNT(*) as total FROM rfm_customers WHERE 1=1";
    const params = [];

    if (segment) {
      query += " AND Segment = ?";
      params.push(segment);
    }

    if (customerId) {
      query += " AND CustomerID = ?";
      params.push(customerId);
    }

    const [rows] = await pool.execute(query, params);
    const total = rows[0].total;

    console.log(`✅ Total count: ${total}`);

    res.json({
      success: true,
      total: total
    });

  } catch (error) {
    console.error("❌ Count Error:", error.message);
    res.status(500).json({
      error: error.message,
      code: "COUNT_ERROR"
    });
  }
});

/**
 * GET /api/segments
 */
app.get("/api/segments", async (req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT DISTINCT Segment FROM rfm_customers ORDER BY Segment"
    );

    const segments = rows.map(r => r.Segment);

    res.json({
      success: true,
      segments
    });

  } catch (error) {
    console.error("❌ Error fetching segments:", error.message);
    res.status(500).json({
      error: error.message,
      code: "FETCH_SEGMENTS_ERROR"
    });
  }
});

/**
 * GET /api/statistics
 */
app.get("/api/statistics", async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        Segment,
        COUNT(*) as customer_count,
        AVG(Recency) as avg_recency,
        AVG(Frequency) as avg_frequency,
        AVG(MonetaryValue) as avg_monetary
      FROM rfm_customers
      GROUP BY Segment
      ORDER BY customer_count DESC
    `);

    console.log('✅ Statistics fetched successfully');

    res.json({
      success: true,
      statistics: rows
    });

  } catch (error) {
    console.error("❌ Error fetching statistics:", error.message);
    res.status(500).json({
      error: error.message,
      code: "FETCH_STATISTICS_ERROR"
    });
  }
});

/**
 * GET /api/health
 */
app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({
      status: "healthy",
      database: "connected",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      database: "disconnected"
    });
  }
});

app.get('/api/customers/:customerId/products', async (req, res) => {
  try {
    const { customerId } = req.params;

    const [rows] = await pool.query(
    'SELECT product_name, quantity, price, image_url FROM products WHERE customer_id = ?',
    [customerId]
);


    res.json({
      success: true,
      products: rows
    });

  } catch (error) {
    console.error("❌ Products Error:", error.message);
    res.status(500).json({
      success: false,
      error: "Failed to fetch products"
    });
  }
});


app.listen(PORT, () => {
  console.log('\n' + '='.repeat(50));
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`🐬 MySQL configured`);
  console.log('='.repeat(50) + '\n');
});

// ===== AJOUTEZ CES ENDPOINTS À VOTRE server.js =====

/**
 * GET /api/products
 * Get all products with pagination
 */
app.get("/api/products", async (req, res) => {
  try {
    const { limit = 100, offset = 0 } = req.query;

    const safeLimit = Math.min(Math.max(parseInt(limit) || 100, 1), 1000);
    const safeOffset = Math.max(parseInt(offset) || 0, 0);

    const query = `
      SELECT 
        id,
        customer_id,
        product_name,
        quantity,
        price,
        image_url,
        created_at
      FROM products
      ORDER BY created_at DESC
      LIMIT ${safeLimit} OFFSET ${safeOffset}
    `;

    const [rows] = await pool.execute(query);

    console.log(`✅ Fetched ${rows.length} products`);

    res.json({
      success: true,
      products: rows
    });

  } catch (error) {
    console.error("❌ Error fetching products:", error.message);
    res.status(500).json({
      error: error.message,
      code: "FETCH_PRODUCTS_ERROR"
    });
  }
});

/**
 * GET /api/customers/:customerId/products
 * Get products for a specific customer
 */
app.get("/api/customers/:customerId/products", async (req, res) => {
  try {
    const { customerId } = req.params;

    const query = `
      SELECT 
        id,
        customer_id,
        product_name,
        quantity,
        price,
        image_url,
        created_at
      FROM products
      WHERE customer_id = ?
      ORDER BY created_at DESC
    `;

    const [rows] = await pool.execute(query, [customerId]);

    console.log(`✅ Found ${rows.length} products for customer ${customerId}`);

    // Calculate total
    const total = rows.reduce((sum, product) => {
      return sum + (product.price * product.quantity);
    }, 0);

    res.json({
      success: true,
      customer_id: customerId,
      products: rows,
      total: total
    });

  } catch (error) {
    console.error("❌ Error fetching customer products:", error.message);
    res.status(500).json({
      error: error.message,
      code: "FETCH_CUSTOMER_PRODUCTS_ERROR"
    });
  }
});

/**
 * GET /api/products/statistics
 * Get product statistics
 */
app.get("/api/products/statistics", async (req, res) => {
  try {
    const [stats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_products,
        SUM(quantity) as total_quantity,
        AVG(price) as avg_price,
        SUM(price * quantity) as total_revenue
      FROM products
    `);

    const [topProducts] = await pool.execute(`
      SELECT 
        product_name,
        SUM(quantity) as total_sold,
        SUM(price * quantity) as revenue
      FROM products
      GROUP BY product_name
      ORDER BY total_sold DESC
      LIMIT 10
    `);

    console.log('✅ Product statistics fetched');

    res.json({
      success: true,
      statistics: stats[0],
      top_products: topProducts
    });

  } catch (error) {
    console.error("❌ Error fetching product statistics:", error.message);
    res.status(500).json({
      error: error.message,
      code: "FETCH_PRODUCT_STATS_ERROR"
    });
  }
});