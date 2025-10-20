# 🚀 EC2 Deployment Commands

## Quick Deploy to EC2

### 1. SSH into your EC2 instance

```bash
ssh -i your-key.pem ubuntu@13.61.12.168
```

Or if you're already connected, skip to step 2.

---

### 2. Navigate to project directory

```bash
cd /var/www/dashboard
# Or wherever your project is located
# Based on your screenshot, it might be in a different location
```

---

### 3. Pull latest code from GitHub

```bash
git pull origin main
```

**Expected output:**
```
Updating 3b4f238..448e062
Fast-forward
 api/app/main.py                   | 83 ++++++++++++++++++++++++++++++++++++
 create_templates.py                | 202 ++++++++++++++++++++++++++++
 ...
```

---

### 4. Stop old Python backend

```bash
# Find the process
ps aux | grep uvicorn

# Kill it (replace PID with actual process ID)
kill -9 PID

# Or stop PM2/systemd service if you're using one
pm2 stop dashboard-api
# OR
sudo systemctl stop dashboard-api
```

---

### 5. Start Python backend

#### Option A: Direct (for testing)
```bash
cd api
python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload &
```

#### Option B: Using PM2 (recommended for production)
```bash
cd api
pm2 start "python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000" --name dashboard-api
pm2 save
```

#### Option C: Using systemd service
```bash
sudo systemctl restart dashboard-api
```

---

### 6. Verify backend is running

```bash
curl http://localhost:8000/
```

**Should return:**
```json
{"msg":"Welcome to the API"}
```

---

### 7. Restart frontend (if needed)

#### If using PM2:
```bash
pm2 restart dashboard-app
pm2 save
```

#### If using Next.js standalone:
```bash
npm run build
pm2 restart dashboard-app
```

---

## 🔍 Check Status

```bash
# Check if backend is running
curl http://localhost:8000/

# Check backend logs
pm2 logs dashboard-api
# OR
journalctl -u dashboard-api -f

# Check frontend
pm2 list

# Check ports
sudo netstat -tulpn | grep :8000
sudo netstat -tulpn | grep :3000
```

---

## 🎯 Quick One-Liner Deploy

```bash
cd /var/www/dashboard && git pull origin main && pm2 restart dashboard-api && pm2 restart dashboard-app && pm2 save
```

---

## 📦 What Was Deployed (Latest Commit: 448e062)

✅ **New invoice templates** with all 24 placeholders  
✅ **Fixed bank details** to match customer script  
✅ **Corrected SWIFT codes** (all AEDABUXXX)  
✅ **Fixed IFO-only calculations**  
✅ **All 15 feedback items** implemented  

---

## 🐛 Troubleshooting on EC2

### Backend won't start:
```bash
# Check Python version
python3 --version

# Install dependencies if needed
cd api
pip3 install -r requirements.txt

# Check for errors
python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Port 8000 already in use:
```bash
# Find what's using it
sudo lsof -i :8000

# Kill the process
kill -9 PID
```

### LibreOffice not installed on EC2:
```bash
# Install LibreOffice for PDF conversion
sudo apt-get update
sudo apt-get install -y libreoffice

# Verify
which soffice
# Should show: /usr/bin/soffice
```

---

## 🌐 Access Your Deployed App

**Frontend:** `http://13.61.12.168` (or your domain)  
**Backend API:** `http://13.61.12.168:8000`  

---

## 🔒 Security Notes

Make sure in production:
1. **Use environment variables** for sensitive data (`.env` file)
2. **Enable HTTPS** with SSL certificate
3. **Configure firewall** to allow only necessary ports
4. **Use reverse proxy** (nginx) for frontend
5. **Set DISABLE_EMAIL=0** and configure Gmail token for email sending

---

## ✅ Verification Steps

After deployment, test:

1. **Visit frontend:** http://13.61.12.168
2. **Login:** Should show dashboard
3. **Charts:** Should display USD/RUB, BRNT, WTI, NG
4. **Test invoice:** Fill form and generate
5. **Download:** Should get properly formatted DOCX/PDF

---

## 📱 Quick Status Check

```bash
# All services status
pm2 status

# Restart everything
pm2 restart all

# View logs
pm2 logs --lines 50
```


