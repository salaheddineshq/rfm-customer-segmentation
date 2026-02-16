# Quick Start Guide

Get up and running with the Databricks Customer Analytics Dashboard in 5 minutes!

## ⚡ Quick Setup (5 Minutes)

### 1. Install Dependencies (1 minute)
```bash
cd databricks-updated
npm install
```

### 2. Configure Databricks (2 minutes)

Create a `.env` file in the project root:

```env
DATABRICKS_URL=https://your-workspace.azuredatabricks.net/api/2.0/sql/statements
DATABRICKS_TOKEN=your_personal_access_token
WAREHOUSE_ID=your_warehouse_id
PORT=3000
```

**How to find these values:**

1. **Databricks URL**: 
   - Format: `https://adb-[workspace-id].[region].azuredatabricks.net/api/2.0/sql/statements`
   - Example: `https://adb-7405608390542724.4.azuredatabricks.net/api/2.0/sql/statements`

2. **Personal Access Token**:
   - Go to: Workspace → User Settings → Developer → Access Tokens
   - Click "Generate New Token"
   - Copy the token (starts with "dapi")

3. **Warehouse ID**:
   - Go to: SQL → SQL Warehouses
   - Click on your warehouse
   - Copy the ID from the URL or Details tab

### 3. Start the Server (1 minute)
```bash
npm start
```

You should see:
```
✅ Server running on http://localhost:3000
📊 Databricks endpoint: https://...
🔑 Token configured: Yes
```

### 4. Open the Application (1 minute)

Open your browser and navigate to:
```
http://localhost:3000/welcome.html
```

Click "Get Started" to access the dashboard!

## 🎯 First Steps

### Search for Customers

1. **By Segment:**
   - Select a segment from dropdown (e.g., "Champions")
   - Click "Search"
   - View results in the table

2. **By Customer ID:**
   - Enter a customer ID
   - Click "Search"
   - View individual customer details

3. **Combined Search:**
   - Select segment AND enter customer ID
   - Click "Search"
   - Get filtered results

### View Statistics

The dashboard automatically shows:
- Total Customers
- Champions count
- At Risk customers
- Lost customers

### Export Data

1. Click the menu icon (•••) next to "Customer Search"
2. Select "Export CSV"
3. Your data downloads as a CSV file

## 🔍 Common Use Cases

### Find Your Best Customers
```
1. Select "Champions" from dropdown
2. Click "Search"
3. Export results to CSV for marketing campaign
```

### Identify At-Risk Customers
```
1. Select "At Risk" from dropdown
2. Click "Search"
3. Review the list for retention campaign
```

### Look Up Specific Customer
```
1. Enter Customer ID (e.g., "12345")
2. Click "Search"
3. View customer's segment and RFM scores
```

## 📱 Interface Overview

### Top Navigation
- **Search Bar**: Quick customer search
- **Refresh Button**: Reload statistics
- **Help Button**: Jump to help section
- **Profile Menu**: Settings and logout

### Sidebar Menu
- **Dashboard**: Main analytics view
- **Customers**: Customer management
- **Statistics**: Detailed statistics
- **Reports**: Generate reports
- **Help**: Documentation

### Main Dashboard
- **Statistics Cards**: Key metrics at a glance
- **Search Filters**: Find specific customers
- **Results Table**: View search results
- **Help Section**: Quick reference guide

## 🎨 Tips & Tricks

### Keyboard Shortcuts
- Press **Enter** in Customer ID field to search
- Press **Escape** to clear filters (coming soon)

### Best Practices
1. **Start broad, then narrow**: Select segment first, then add customer ID if needed
2. **Use export feature**: Download data for offline analysis
3. **Check statistics regularly**: Monitor customer distribution
4. **Use help section**: Reference customer segment definitions

### Performance Tips
- Searches are limited to 100 results by default
- Use specific customer ID for faster lookups
- Statistics load once on page load

## ⚠️ Troubleshooting

### Can't Connect to Databricks
**Check:**
- Is your Databricks URL correct?
- Is your token valid and not expired?
- Is your warehouse running?

**Quick Fix:**
```bash
# Test health endpoint
curl http://localhost:3000/api/health
```

### No Results Found
**Check:**
- Does the table exist: `ismagiprojet.default.rfm_customers`?
- Are there customers in that segment?
- Is the segment name spelled correctly?

### Server Won't Start
**Check:**
- Is port 3000 available?
- Are dependencies installed?
- Is `.env` file present?

**Quick Fix:**
```bash
# Use different port
# In .env file, change:
PORT=3001
```

## 📚 Next Steps

### Learn More
- Read the [README.md](README.md) for detailed documentation
- Check [MIGRATION.md](MIGRATION.md) if upgrading from v1.0
- Review the help section in the application

### Customize
- Add more customer segments in `server.js`
- Modify the statistics queries
- Customize the UI colors and styling

### Deploy
- Set up PM2 for production
- Configure nginx reverse proxy
- Enable HTTPS/SSL

## 🆘 Need Help?

### Check These Resources
1. Application Help Section
2. README.md file
3. Server logs in console
4. Databricks documentation

### Common Questions

**Q: How do I add more segments?**
A: Update the `validSegments` array in `server.js` (line ~82)

**Q: Can I change the table name?**
A: Yes, update the SQL queries in `server.js` (lines 69, 133, 150)

**Q: How do I enable pagination?**
A: The infrastructure is ready, update the `changePage()` function in `app.js`

**Q: Can I add more statistics?**
A: Yes, modify the `/api/statistics` endpoint in `server.js`

## 🎉 You're Ready!

You should now be able to:
- ✅ Search for customers by segment
- ✅ Look up individual customers
- ✅ View statistics dashboard
- ✅ Export data to CSV
- ✅ Navigate the interface

Happy analyzing! 📊

---

**Pro Tip**: Bookmark the dashboard for quick access: `http://localhost:3000/index.html`
