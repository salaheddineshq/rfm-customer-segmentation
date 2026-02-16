# Databricks Customer Analytics Dashboard

A modern, full-featured customer analytics dashboard with Databricks integration for RFM (Recency, Frequency, Monetary) customer segmentation analysis.

## 🚀 Features

### Core Functionality
- **Real-time Customer Search** - Search by segment or customer ID
- **RFM Segmentation** - Champions, Loyal, At Risk, Lost, and more
- **Statistics Dashboard** - Live customer metrics and KPIs
- **Data Export** - Export search results to CSV
- **Responsive Design** - Works on desktop, tablet, and mobile

### Technical Features
- **Databricks Integration** - Direct SQL query execution via Databricks API
- **Error Handling** - Comprehensive error handling and user feedback
- **Loading States** - Visual feedback during data fetching
- **Modern UI/UX** - Clean, professional interface with animations
- **Security** - Environment variables for sensitive credentials

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Databricks workspace with:
  - Warehouse ID
  - Personal Access Token
  - Table: `ismagiprojet.default.rfm_customers`

## 🛠️ Installation

1. **Clone or extract the project**
   ```bash
   cd databricks-updated
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   DATABRICKS_URL=https://your-workspace.azuredatabricks.net/api/2.0/sql/statements
   DATABRICKS_TOKEN=your_personal_access_token
   WAREHOUSE_ID=your_warehouse_id
   PORT=3000
   ```

4. **Start the server**
   ```bash
   npm start
   ```

5. **Access the application**
   
   Open your browser and navigate to:
   ```
   http://localhost:3000/welcome.html
   ```

## 📁 Project Structure

```
databricks-updated/
├── server.js                 # Express server with Databricks API integration
├── package.json             # Dependencies and scripts
├── .env.example             # Environment variables template
├── README.md                # This file
└── public/
    ├── index.html           # Main dashboard
    ├── welcome.html         # Landing page
    ├── app.js              # Frontend JavaScript
    └── styles.css          # Stylesheets
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABRICKS_URL` | Databricks SQL statements endpoint | `https://adb-xxx.azuredatabricks.net/api/2.0/sql/statements` |
| `DATABRICKS_TOKEN` | Personal access token | `dapixxxxxxxxxxxxx` |
| `WAREHOUSE_ID` | SQL warehouse identifier | `94cc5367fdff14d8` |
| `PORT` | Server port | `3000` |

### Getting Databricks Credentials

1. **Databricks URL**: Found in your workspace URL
2. **Access Token**: 
   - Go to User Settings → Developer → Access Tokens
   - Generate new token
3. **Warehouse ID**:
   - Go to SQL → SQL Warehouses
   - Select your warehouse → Details tab

## 📊 API Endpoints

### POST /api/clients
Search for customers by segment and/or customer ID

**Request Body:**
```json
{
  "segment": "Champions",
  "customerId": "12345",
  "limit": 100,
  "offset": 0
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "schema": {...},
    "data_array": [...]
  },
  "meta": {
    "limit": 100,
    "offset": 0,
    "rowCount": 50
  }
}
```

### GET /api/segments
Get list of available customer segments

**Response:**
```json
{
  "success": true,
  "segments": ["Champions", "Loyal", "At Risk", "Lost"]
}
```

### GET /api/statistics
Get customer statistics by segment

**Response:**
```json
{
  "success": true,
  "statistics": {
    "schema": {...},
    "data_array": [...]
  }
}
```

### GET /api/health
Health check endpoint

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-02-14T12:00:00.000Z",
  "databricks": {
    "configured": true
  }
}
```

## 🎨 Customer Segments

| Segment | Description | Characteristics |
|---------|-------------|----------------|
| **Champions** | Best customers | High recency, frequency, and monetary value |
| **Loyal** | Regular customers | Consistent purchase patterns |
| **Potential Loyalist** | Recent customers | Good potential for growth |
| **At Risk** | Declining customers | Used to be good, now at risk |
| **Need Attention** | Below average | Lower recency, frequency, or monetary |
| **Lost** | Churned customers | Haven't purchased in a long time |

## 🔒 Security Best Practices

1. **Never commit `.env` file** - Add to `.gitignore`
2. **Use environment variables** - Don't hardcode credentials
3. **Rotate tokens regularly** - Update access tokens periodically
4. **Limit token permissions** - Use minimum required permissions
5. **Use HTTPS in production** - Secure data transmission

## 🐛 Troubleshooting

### Common Issues

1. **Connection Error**
   - Check Databricks URL and token
   - Verify warehouse is running
   - Check network connectivity

2. **No Data Returned**
   - Verify table exists: `ismagiprojet.default.rfm_customers`
   - Check segment values match database
   - Review SQL query in server logs

3. **Port Already in Use**
   - Change `PORT` in `.env` file
   - Kill process using port 3000: `lsof -ti:3000 | xargs kill`

4. **Dependencies Installation Failed**
   - Delete `node_modules` and `package-lock.json`
   - Run `npm install` again
   - Check Node.js version

## 📈 Performance Optimization

- **Query Optimization**: Indexed columns for faster searches
- **Caching**: Consider implementing Redis for frequently accessed data
- **Pagination**: Server-side pagination for large datasets
- **Connection Pooling**: Reuse Databricks connections

## 🚀 Deployment

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use process manager (PM2, systemd)
- [ ] Configure reverse proxy (nginx)
- [ ] Enable HTTPS/SSL
- [ ] Set up monitoring and logging
- [ ] Configure CORS properly
- [ ] Implement rate limiting
- [ ] Set up backup for configuration

### Example PM2 Deployment

```bash
npm install -g pm2
pm2 start server.js --name databricks-dashboard
pm2 save
pm2 startup
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

ISC License

## 👤 Support

For issues and questions:
- Check the troubleshooting section
- Review Databricks documentation
- Contact your system administrator

## 🔄 Version History

### Version 2.0.0 (Current)
- ✨ Modern UI/UX with responsive design
- 🔒 Environment variable configuration
- 📊 Real-time statistics dashboard
- 📥 CSV export functionality
- 🔄 Enhanced error handling
- 📱 Mobile-friendly interface
- 🎨 Loading states and animations
- 📚 Comprehensive help section

### Version 1.0.0
- Basic customer search
- Simple table display
- Databricks integration

## 🙏 Acknowledgments

- Databricks for the powerful analytics platform
- Express.js community
- Boxicons for the icon set
- All contributors and testers

---

**Made with ❤️ using Databricks and Express.js**
