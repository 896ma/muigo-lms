# 🚀 Farmers LMS - Deployment Guide

## 📋 Prerequisites

Before deploying the Farmers LMS, ensure you have:

- **Node.js** (v18 or higher)
- **MongoDB Atlas** account
- **Paystack** account with live keys
- **Git** installed
- **Domain name** (optional, for production)
- **Server/VPS** (for production deployment)

## 🔧 Environment Setup

### 1. MongoDB Atlas Configuration

1. **Create MongoDB Atlas Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Sign up for a free account
   - Create a new cluster

2. **Configure Database Access**
   ```bash
   # Database User
   Username: Muigo
   Password: lucy17
   
   # Network Access
   IP Whitelist: 0.0.0.0/0 (for development)
   # For production, add specific IP addresses
   ```

3. **Get Connection String**
   ```
   mongodb+srv://Muigo:lucy17@cluster0.4z7ofja.mongodb.net/farmers-lms?retryWrites=true&w=majority&appName=Cluster0
   ```

### 2. Paystack Configuration

1. **Create Paystack Account**
   - Go to [Paystack](https://paystack.com)
   - Sign up and complete verification
   - Access your dashboard

2. **Get API Keys**
   ```bash
   # Live Keys (Production)
   Secret Key: sk_live_a8a3c5253cdd0c91a90ceac371cfaea2f6bdeeb5
   Public Key: pk_live_35a44b788e258576c74da0b84e4b9b75250ed203
   
   # Test Keys (Development)
   Secret Key: sk_test_...
   Public Key: pk_test_...
   ```

3. **Configure Webhooks**
   - Webhook URL: `https://yourdomain.com/api/payments/webhook`
   - Events: `charge.success`, `charge.failed`

## 🌐 Local Development Deployment

### Step 1: Clone and Setup
```bash
# Clone repository
git clone https://github.com/896ma/muigo-lms.git
cd farmers-lms

# Install dependencies
npm install
cd backend && npm install
cd ../frontend && npm install
```

### Step 2: Environment Configuration
```bash
# Create .env file
touch .env

# Add environment variables
cat > .env << EOF
MONGO_URI=mongodb+srv://Muigo:lucy17@cluster0.4z7ofja.mongodb.net/farmers-lms?retryWrites=true&w=majority&appName=Cluster0
PORT=5000
JWT_SECRET=dev_secret_change_me_in_production
FRONTEND_URL=http://localhost:5173

# Paystack Configuration
PAYSTACK_SECRET_KEY=sk_live_a8a3c5253cdd0c91a90ceac371cfaea2f6bdeeb5
PAYSTACK_PUBLIC_KEY=pk_live_35a44b788e258576c74da0b84e4b9b75250ed203
PAYSTACK_CALLBACK_URL=http://localhost:5173/payment-callback
EOF
```

### Step 3: Database Seeding
```bash
# Seed the database with sample courses
cd backend
node seed.js
```

### Step 4: Start Development Server
```bash
# From root directory
npm run dev

# Or start individually
npm run dev:backend  # Backend on port 5000
npm run dev:frontend # Frontend on port 5173
```

## 🌍 Production Deployment

### Option 1: VPS/Cloud Server Deployment

#### 1. Server Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Install Nginx (optional, for reverse proxy)
sudo apt install nginx -y
```

#### 2. Application Deployment
```bash
# Clone repository
git clone https://github.com/896ma/muigo-lms.git
cd farmers-lms

# Install dependencies
npm install
cd backend && npm install
cd ../frontend && npm install

# Build frontend
cd frontend
npm run build

# Create production .env
cat > .env << EOF
MONGO_URI=mongodb+srv://Muigo:lucy17@cluster0.4z7ofja.mongodb.net/farmers-lms?retryWrites=true&w=majority&appName=Cluster0
PORT=5000
JWT_SECRET=your_production_jwt_secret_here
FRONTEND_URL=https://yourdomain.com

# Paystack Configuration
PAYSTACK_SECRET_KEY=sk_live_a8a3c5253cdd0c91a90ceac371cfaea2f6bdeeb5
PAYSTACK_PUBLIC_KEY=pk_live_35a44b788e258576c74da0b84e4b9b75250ed203
PAYSTACK_CALLBACK_URL=https://yourdomain.com/payment-callback
EOF
```

#### 3. PM2 Configuration
```bash
# Create PM2 ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'farmers-lms-backend',
    script: './backend/server.js',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    }
  }]
}
EOF

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

#### 4. Nginx Configuration (Optional)
```bash
# Create Nginx config
sudo nano /etc/nginx/sites-available/farmers-lms

# Add configuration
server {
    listen 80;
    server_name yourdomain.com;

    # Frontend
    location / {
        root /path/to/farmers-lms/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Enable site
sudo ln -s /etc/nginx/sites-available/farmers-lms /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Option 2: Heroku Deployment

#### 1. Heroku Setup
```bash
# Install Heroku CLI
# Download from https://devcenter.heroku.com/articles/heroku-cli

# Login to Heroku
heroku login

# Create Heroku app
heroku create farmers-lms-app
```

#### 2. Environment Variables
```bash
# Set environment variables
heroku config:set MONGO_URI=mongodb+srv://Muigo:lucy17@cluster0.4z7ofja.mongodb.net/farmers-lms?retryWrites=true&w=majority&appName=Cluster0
heroku config:set JWT_SECRET=your_production_jwt_secret_here
heroku config:set PAYSTACK_SECRET_KEY=sk_live_a8a3c5253cdd0c91a90ceac371cfaea2f6bdeeb5
heroku config:set PAYSTACK_PUBLIC_KEY=pk_live_35a44b788e258576c74da0b84e4b9b75250ed203
heroku config:set PAYSTACK_CALLBACK_URL=https://farmers-lms-app.herokuapp.com/payment-callback
```

#### 3. Deploy
```bash
# Add Heroku remote
git remote add heroku https://git.heroku.com/farmers-lms-app.git

# Deploy
git push heroku main
```

### Option 3: Vercel Deployment (Frontend Only)

#### 1. Vercel Setup
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy frontend
cd frontend
vercel
```

#### 2. Environment Variables in Vercel
```bash
# Set environment variables in Vercel dashboard
VITE_API_URL=https://your-backend-url.com
```

## 🔒 SSL/HTTPS Setup

### Using Let's Encrypt (Free SSL)
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 📊 Monitoring and Maintenance

### 1. Process Monitoring
```bash
# PM2 monitoring
pm2 status
pm2 logs
pm2 monit

# Restart application
pm2 restart farmers-lms-backend
```

### 2. Database Monitoring
- Monitor MongoDB Atlas dashboard
- Set up alerts for connection issues
- Regular backup schedules

### 3. Payment Monitoring
- Monitor Paystack dashboard
- Set up webhook monitoring
- Check payment success rates

## 🐛 Troubleshooting

### Common Deployment Issues

#### 1. Port Already in Use
```bash
# Find process using port
sudo lsof -i :5000
sudo kill -9 PID

# Or change port in .env
PORT=5001
```

#### 2. MongoDB Connection Issues
```bash
# Check connection string
# Ensure IP is whitelisted in MongoDB Atlas
# Verify username/password
```

#### 3. Payment Webhook Issues
```bash
# Check webhook URL is accessible
curl -X POST https://yourdomain.com/api/payments/webhook

# Verify Paystack webhook configuration
```

#### 4. Frontend Build Issues
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check for TypeScript errors
npm run build
```

## 🔄 Updates and Maintenance

### 1. Application Updates
```bash
# Pull latest changes
git pull origin main

# Install new dependencies
npm install

# Restart application
pm2 restart farmers-lms-backend
```

### 2. Database Migrations
```bash
# Run database updates
cd backend
node seed.js
```

### 3. Security Updates
```bash
# Update dependencies
npm audit
npm audit fix

# Update system packages
sudo apt update && sudo apt upgrade
```

## 📈 Performance Optimization

### 1. Database Optimization
- Enable MongoDB Atlas monitoring
- Set up proper indexes
- Monitor query performance

### 2. Application Optimization
- Enable gzip compression
- Set up CDN for static assets
- Implement caching strategies

### 3. Monitoring Setup
```bash
# Install monitoring tools
npm install -g clinic
clinic doctor -- node server.js
```

## 🚨 Backup and Recovery

### 1. Database Backup
```bash
# MongoDB Atlas provides automatic backups
# Or manual backup
mongodump --uri="mongodb+srv://Muigo:lucy17@cluster0.4z7ofja.mongodb.net/farmers-lms"
```

### 2. Application Backup
```bash
# Backup application files
tar -czf farmers-lms-backup-$(date +%Y%m%d).tar.gz farmers-lms/
```

### 3. Recovery Procedures
```bash
# Restore from backup
tar -xzf farmers-lms-backup-20250101.tar.gz
cd farmers-lms
npm install
pm2 restart farmers-lms-backend
```

## 📞 Support and Maintenance

### 1. Log Monitoring
```bash
# Application logs
pm2 logs farmers-lms-backend

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### 2. Health Checks
```bash
# API health check
curl https://yourdomain.com/api/courses

# Database health check
curl https://yourdomain.com/api/auth/login
```

### 3. Emergency Procedures
```bash
# Quick restart
pm2 restart all

# Rollback to previous version
git checkout previous-commit
pm2 restart farmers-lms-backend
```

---

**Deployment completed successfully! 🎉**

For additional support or questions, refer to the main documentation or create an issue in the repository.

