# 🎯 RFM Customer Segmentation Platform

> Modern customer analytics dashboard with RFM (Recency, Frequency, Monetary) segmentation analysis and K-Means ML clustering

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![Node.js](https://img.shields.io/badge/Node.js-14%2B-green.svg)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express-4.18-blue.svg)](https://expressjs.com/)


---

## 🚀 Features

### Core Functionality
- **Real-time Customer Search** - Search by segment or customer ID with instant results
- **RFM Segmentation** - Champions, Loyal, At Risk, Lost, Potential Loyalist, Need Attention
- **Statistics Dashboard** - Live customer metrics and KPIs with interactive charts
- **Product Tracking** - View customer purchase history with images and totals
- **Data Export** - Export search results to CSV for external analysis
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile

### Technical Features
- **Flexible Backend** - Works with MySQL, Databricks, or cloud databases
- **K-Means ML Clustering** - Automated customer segmentation
- **Error Handling** - Comprehensive error handling and user feedback
- **Loading States** - Visual feedback during data fetching
- **Modern UI/UX** - Clean, professional interface with Chart.js visualizations
- **Security** - Environment variables for sensitive credentials

---

## 🌐 Alternative API Usage

### Can I Use This Without Databricks?

**YES! Absolutely!** 🎉 This application is **flexible** and can work with multiple backend options:

#### Option 1: Local MySQL (Recommended for Development) ✅
```env
# Simple local setup - NO Databricks needed
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=rfm_dashboard
PORT=3000

# Leave Databricks variables empty or remove them
# DATABRICKS_URL=
# DATABRICKS_TOKEN=
# WAREHOUSE_ID=
```

The application automatically uses MySQL if Databricks credentials are not provided.

#### Option 2: Free Cloud Databases (No Installation Required)

**Railway MySQL** (Free Tier - Recommended)
```bash
1. Visit: https://railway.app
2. Create new project → Add MySQL
3. Copy connection details
4. Update .env with Railway credentials
5. Deploy with one click!
```

**PlanetScale** (Free Tier - Serverless MySQL)
```bash
1. Visit: https://planetscale.com
2. Create free database
3. Get connection string
4. Update .env
5. Enjoy serverless MySQL!
```

**Clever Cloud MySQL** (Free Tier)
```bash
1. Visit: https://clever-cloud.com
2. Create MySQL add-on
3. Copy credentials to .env
4. Start using cloud database
```

**Supabase** (Free Tier - PostgreSQL)
```bash
1. Visit: https://supabase.com
2. Create project
3. Use built-in PostgreSQL
4. Get connection string
5. Adapt code for PostgreSQL (minor changes)
```

#### Option 3: Azure Databricks (Production Scale)
```env
# Full Databricks integration
DATABRICKS_URL=https://your-workspace.azuredatabricks.net/api/2.0/sql/statements
DATABRICKS_TOKEN=your_access_token
WAREHOUSE_ID=your_warehouse_id
```

### Online APIs for ML Processing

**Don't have Databricks for ML? No problem!** Here are FREE alternatives:

#### Google Colab (100% Free)
```python
# Run K-Means clustering in Google Colab
# 1. Upload your data CSV
# 2. Run clustering script
# 3. Download results CSV
# 4. Import into MySQL

# Free GPU/TPU access
# No installation needed
# Share notebooks easily
```

**Example Colab Notebook:**
```python
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler

# Upload your transactions.csv
df = pd.read_csv('transactions.csv')

# Calculate RFM
rfm = df.groupby('CustomerID').agg({
    'InvoiceDate': lambda x: (pd.Timestamp.now() - pd.to_datetime(x).max()).days,
    'Invoice': 'nunique',
    'TotalAmount': 'sum'
})

# K-Means clustering
scaler = StandardScaler()
rfm_scaled = scaler.fit_transform(rfm)
kmeans = KMeans(n_clusters=4, random_state=42)
rfm['Segment'] = kmeans.fit_predict(rfm_scaled)

# Download results
rfm.to_csv('rfm_results.csv')
```

#### Kaggle Notebooks (Free with Datasets)
```
✅ Free GPU/TPU
✅ Pre-loaded datasets
✅ Direct MySQL connection possible
✅ Public notebooks for portfolio
```

#### Local Python Script (No Cloud Needed)
```bash
# Install locally
pip install pandas scikit-learn mysql-connector-python

# Run clustering
python ml_pipeline.py

# Results auto-inserted to MySQL
```

**Example Local Script:**
```python
# ml_pipeline.py
import pandas as pd
import mysql.connector
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler

# Connect to MySQL (or Railway, PlanetScale, etc.)
conn = mysql.connector.connect(
    host="localhost",  # or Railway URL
    user="root",
    password="password",
    database="rfm_dashboard"
)

# Read data
df = pd.read_sql("SELECT * FROM transactions", conn)

# Calculate RFM
rfm = df.groupby('CustomerID').agg({
    'InvoiceDate': lambda x: (pd.Timestamp.now() - x.max()).days,
    'Invoice': 'nunique', 
    'TotalAmount': 'sum'
}).reset_index()

rfm.columns = ['CustomerID', 'Recency', 'Frequency', 'Monetary']

# Normalize
scaler = StandardScaler()
rfm_scaled = scaler.fit_transform(rfm[['Recency', 'Frequency', 'Monetary']])

# K-Means
kmeans = KMeans(n_clusters=4, random_state=42)
rfm['Cluster'] = kmeans.fit_predict(rfm_scaled)

# Map clusters to business segments
segment_map = {0: 'Champions', 1: 'Loyal', 2: 'At Risk', 3: 'Lost'}
rfm['Segment'] = rfm['Cluster'].map(segment_map)

# Save to MySQL
cursor = conn.cursor()
for _, row in rfm.iterrows():
    cursor.execute("""
        INSERT INTO rfm_customers (CustomerID, Segment, Recency, Frequency, MonetaryValue)
        VALUES (%s, %s, %s, %s, %s)
        ON DUPLICATE KEY UPDATE Segment=VALUES(Segment), Recency=VALUES(Recency)
    """, (row['CustomerID'], row['Segment'], row['Recency'], row['Frequency'], row['Monetary']))

conn.commit()
print(f"✅ Processed {len(rfm)} customers")
```

### Quick Start Without Any Setup

**Use Railway (Fastest):**
```bash
1. Fork this repository on GitHub
2. Go to railway.app
3. Click "New Project" → "Deploy from GitHub"
4. Select your fork
5. Add MySQL plugin
6. Click "Deploy"
7. Done! ✅ Live in 2 minutes
```

### API Integration Examples

**Want to add external APIs?** Easy!

```javascript
// In server.js - Example: Add weather API
app.get('/api/weather', async (req, res) => {
    const response = await fetch('https://api.openweathermap.org/data/2.5/weather?q=London&appid=YOUR_KEY');
    const data = await response.json();
    res.json(data);
});

// Example: Add currency conversion API
app.get('/api/convert', async (req, res) => {
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    const data = await response.json();
    res.json(data);
});

// Example: Add email service (SendGrid)
const sgMail = require('@sendgrid/mail');
app.post('/api/send-email', async (req, res) => {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    await sgMail.send({
        to: 'customer@example.com',
        from: 'noreply@yourapp.com',
        subject: 'RFM Segment Update',
        text: 'Your segment changed to Champions!'
    });
});
```

**Free API Services You Can Use:**
- 🌤️ Weather: OpenWeatherMap (free tier)
- 💱 Currency: ExchangeRate-API (free)
- 📧 Email: SendGrid (100/day free), Mailgun
- 📊 Charts: Chart.js (already included)
- 🗺️ Maps: Mapbox (50k views/month free)
- 📱 SMS: Twilio (trial credit)

### Database Hosting Comparison

| Service | Free Tier | Pros | Best For |
|---------|-----------|------|----------|
| **Railway** | 500h/month | Easy deploy, auto-scaling | Quick start |
| **PlanetScale** | 5GB storage | Serverless, fast | Production |
| **Clever Cloud** | 256MB RAM | European servers | EU users |
| **Supabase** | 500MB DB | Real-time features | Modern apps |
| **Local MySQL** | Unlimited | Full control, private | Development |

### Summary: Your Options

```
┌─────────────────────────────────────────┐
│  Choose Your Setup:                     │
├─────────────────────────────────────────┤
│                                         │
│  🏠 Local Development                   │
│     → MySQL on localhost                │
│     → Quick start, full control         │
│                                         │
│  ☁️ Cloud (Free)                        │
│     → Railway / PlanetScale             │
│     → No installation, auto-scaling     │
│                                         │
│  🧠 ML Processing                       │
│     → Google Colab (free)               │
│     → Kaggle Notebooks                  │
│     → Local Python script               │
│                                         │
│  🚀 Production                          │
│     → Azure Databricks (optional)       │
│     → Railway + Auto deploy             │
│                                         │
└─────────────────────────────────────────┘
```

**Bottom line:** You can run this project with **ZERO cost** using free tiers! 🎉

---

## 📋 Prerequisites

- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **npm** or **yarn**
- **Database** (choose one):
  - MySQL 8.0+ (local) OR
  - Railway/PlanetScale (cloud free tier) OR
  - Azure Databricks (optional for production)

---

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone https://github.com/salaheddineshq/rfm-customer-segmentation.git
cd rfm-customer-segmentation
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

**Option A: Local MySQL (Simple Setup)**
```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=rfm_dashboard
DB_PORT=3306

# Server Configuration
PORT=3000
NODE_ENV=development
```

**Option B: With Databricks (Advanced)**
```env
# Database Configuration (MySQL)
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=rfm_dashboard

# Databricks Configuration (Optional)
DATABRICKS_URL=https://your-workspace.azuredatabricks.net/api/2.0/sql/statements
DATABRICKS_TOKEN=your_personal_access_token
WAREHOUSE_ID=your_warehouse_id

# Server Configuration
PORT=3000
```

### 4. Set Up Database

**For MySQL:**
```sql
CREATE DATABASE rfm_dashboard;
USE rfm_dashboard;

CREATE TABLE rfm_customers (
    CustomerID VARCHAR(50) PRIMARY KEY,
    Segment VARCHAR(50) NOT NULL,
    Recency INT NOT NULL,
    Frequency INT NOT NULL,
    MonetaryValue DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_segment (Segment),
    INDEX idx_recency (Recency),
    INDEX idx_frequency (Frequency)
);

CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id VARCHAR(20),
    product_name VARCHAR(255),
    quantity INT,
    price DECIMAL(10,2),
    image_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES rfm_customers(CustomerID)
);
```

**For Databricks:**
- Table: `testprojet.default.rfm_customers`
- Ensure SQL Warehouse is running

### 5. Start the Server

```bash
npm start
```

### 6. Access the Application

Open your browser:
```
http://localhost:3000/dashboard.html
```

---

## 📁 Project Structure

```
rfm-customer-segmentation/
├── server.js                    # Express server with API routes
├── package.json                 # Dependencies and scripts
├── .env.example                 # Environment variables template
├── .gitignore                   # Git ignore rules
├── README.md                    # This file
└── public/
    ├── dashboard.html           # Main analytics dashboard
    ├── customers.html           # Customer search interface
    ├── products.html            # Product catalog
    ├── documentation.html       # Technical documentation
    ├── help.html               # User guide and FAQ
    ├── index.html              # Landing page
    ├── app.js                  # Core JavaScript logic
    ├── dashboard.js            # Dashboard functionality
    ├── customers.js            # Customer search logic
    ├── products.js             # Product management
    ├── login.js                # Authentication
    └── styles.css              # Global stylesheets
```

---

## 📡 API Endpoints

### Customer Endpoints

#### `POST /api/clients`
Search for customers by segment and/or customer ID

**Request Body:**
```json
{
  "segment": "Champions",
  "customerId": "CL12345",
  "limit": 100,
  "offset": 0
}
```

**Response:**
```json
{
  "success": true,
  "data": [...],
  "meta": {
    "limit": 100,
    "offset": 0,
    "rowCount": 50
  }
}
```

#### `POST /api/clients/count`
Get total count of filtered customers

#### `GET /api/statistics`
Get customer statistics by segment

**Response:**
```json
{
  "success": true,
  "statistics": [
    {
      "Segment": "Champions",
      "CustomerCount": 10,
      "AvgRecency": 8.5,
      "AvgFrequency": 48.2,
      "AvgMonetary": 14250.00
    }
  ]
}
```

#### `GET /api/segments`
Get list of available customer segments

**Response:**
```json
{
  "success": true,
  "segments": ["Champions", "Loyal", "At Risk", "Lost", "Potential Loyalist", "Need Attention"]
}
```

### Product Endpoints

#### `GET /api/customers/:id/products`
Get products for a specific customer with total calculation

#### `GET /api/products`
Get all products with pagination

### System Endpoints

#### `GET /api/health`
Health check endpoint

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-02-16T12:00:00.000Z",
  "databricks": {
    "configured": true
  },
  "database": "connected"
}
```

---

## 🎨 Customer Segments

| Segment | Description | RFM Profile | Action |
|---------|-------------|-------------|---------|
| **Champions** | Best customers | High R, F, M | Reward, VIP treatment |
| **Loyal** | Regular customers | Good R, F, M | Upsell, cross-sell |
| **Potential Loyalist** | Recent customers | High R, Low F | Nurture, engage |
| **At Risk** | Declining customers | Low R, High F, M | Win-back campaigns |
| **Need Attention** | Below average | Medium R, F, M | Re-engagement |
| **Lost** | Churned customers | Very Low R | Aggressive win-back |

---

## 🔒 Security Best Practices

1. **Never commit `.env` file** - Already in `.gitignore`
2. **Use environment variables** - Don't hardcode credentials
3. **Rotate tokens regularly** - Update access tokens periodically
4. **Limit token permissions** - Use minimum required permissions
5. **Use HTTPS in production** - Secure data transmission
6. **Implement rate limiting** - Prevent API abuse
7. **Validate all inputs** - Prevent SQL injection
8. **Use prepared statements** - Already implemented

---

## 🐛 Troubleshooting

### Common Issues

#### 1. Connection Error
```
Error: ER_ACCESS_DENIED_ERROR
```
**Solution:** Check DB_USER and DB_PASSWORD in `.env`

#### 2. Databricks Connection Failed
- Verify Databricks URL and token are correct
- Check if SQL Warehouse is running
- Ensure network connectivity

#### 3. Port Already in Use
```
Error: listen EADDRINUSE :::3000
```
**Solution:** Change PORT in `.env` or kill the process:
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill
```

#### 4. No Data Returned
- Verify table exists: `rfm_customers`
- Check segment values match database
- Review SQL query in server logs
- Ensure you have sample data in the database

#### 5. Dependencies Installation Failed
```bash
# Delete and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## 📈 Performance Optimization

- **Query Optimization**: Indexed columns (Segment, Recency, Frequency)
- **Caching**: Consider Redis for frequently accessed data
- **Pagination**: Server-side pagination (10-100 items per page)
- **Connection Pooling**: Reuse database connections
- **Compression**: Enable gzip compression for API responses
- **CDN**: Use CDN for static assets in production

---

## 🚀 Deployment

### Production Checklist

- [ ] Set `NODE_ENV=production` in `.env`
- [ ] Use strong database passwords
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS properly
- [ ] Set up database backups
- [ ] Implement rate limiting
- [ ] Use process manager (PM2)
- [ ] Set up monitoring (New Relic, DataDog)
- [ ] Configure logging
- [ ] Set up reverse proxy (nginx)

### Deploy with PM2

```bash
# Install PM2 globally
npm install -g pm2

# Start application
pm2 start server.js --name rfm-analytics

# Save configuration
pm2 save

# Auto-restart on boot
pm2 startup
```

### Deploy to Railway

1. Push code to GitHub
2. Go to railway.app
3. New Project → Deploy from GitHub
4. Select repository
5. Add MySQL plugin
6. Set environment variables
7. Deploy automatically ✅

### Deploy to Heroku

```bash
# Login
heroku login

# Create app
heroku create rfm-customer-segmentation

# Add MySQL addon
heroku addons:create jawsdb:kitefin

# Set env vars
heroku config:set NODE_ENV=production

# Deploy
git push heroku main

# Open
heroku open
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Make your changes
4. Test thoroughly
5. Commit (`git commit -m 'Add AmazingFeature'`)
6. Push (`git push origin feature/AmazingFeature`)
7. Open a Pull Request

---

## 📝 License

This project is licensed under the **ISC License**.

---



**Project -  2025-2026**


---

## 🔄 Version History

### Version 2.0.0 (Current) - February 2026
- ✨ Complete K-Means ML clustering pipeline
- 🎨 Modern responsive UI with Chart.js
- 📦 Product tracking and purchase history
- 📊 Real-time analytics dashboard
- 🔒 Enhanced security
- 📚 Complete technical documentation
- 🌐 Multiple database options (MySQL, Databricks, Cloud)

### Version 1.0.0 - January 2026
- 🎯 Basic RFM segmentation
- 👥 Customer search
- 📈 Simple statistics

---

## 🙏 Acknowledgments

- **Databricks** for the powerful analytics platform
- **Express.js** community
- **Chart.js** for visualization library
- **Boxicons** for icon set
- **MySQL** team
- All contributors and testers

---

## 📞 Support

For questions and support:

- **GitHub Issues**: [Create an issue](https://github.com/salaheddineshq/rfm-customer-segmentation/issues)
- **Documentation**: Check [documentation.html](public/documentation.html)
- **Email**: Contact your team members

---

<div align="center">

**Made with ❤️ using Node.js, Express, MySQL & Azure Databricks**

⭐ **Star this repository if you found it helpful!**

[Report Bug](https://github.com/salaheddineshq/rfm-customer-segmentation/issues) • [Request Feature](https://github.com/salaheddineshq/rfm-customer-segmentation/issues) • [View Demo](http://localhost:3000)

</div>
