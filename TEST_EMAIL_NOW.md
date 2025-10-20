# 📧 Test Email Functionality - Quick Guide

## 🎯 **Goal: Receive Nomination Email in Gmail**

Follow these steps to test email sending to `luqmanmirajdeen@gmail.com`

---

## ⚡ **Quick Setup (5 Minutes)**

### **Step 1: Get Gmail Credentials**

1. Open: https://console.cloud.google.com/
2. Create project: "Dashboard Email"
3. Enable **Gmail API**:
   - Click "Enable APIs and Services"
   - Search "Gmail API"
   - Click Enable
4. Create **OAuth Credentials**:
   - Go to: Credentials → Create Credentials → OAuth client ID
   - Application type: **Desktop app**
   - Name: "Dashboard App"
   - Click Create
   - Click **Download JSON**
5. Save file as: `api/credentials.json`

---

### **Step 2: Generate Token**

Run on your local Windows machine:

```powershell
cd api
python setup_gmail.py
```

**What happens:**
- Browser opens automatically
- Login with `luqmanmirajdeen@gmail.com`
- Click "Allow" to grant permissions
- `token.json` file created automatically
- ✅ Done!

---

### **Step 3: Enable Email Sending**

In your local backend terminal (where Python server is running):

**Stop current server:** Press `Ctrl+C`

**Set environment variable:**
```powershell
$env:DISABLE_EMAIL="0"
```

**Restart server:**
```powershell
cd api
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

---

### **Step 4: Test Sending Email**

1. Open dashboard: http://localhost:3000/dashboard
2. Click **"Generate first nomination"**
3. Fill form:
   ```
   Vessel name: TEST VESSEL
   Vessel IMO: 112233
   Vessel flag: Panama
   ```
4. Click **"Generate & email"**

---

### **Step 5: Check Your Gmail**

Open: https://mail.google.com/

**Check inbox for:**
- **From:** luqmanmirajdeen@gmail.com (or configured email)
- **To:** office@pen.com, luqmanmirajdeen@gmail.com
- **Subject:** "FIRST NOMINATION - TEST VESSEL (IMO: 112233)"

✅ **You should receive the email!**

---

## 🚀 **For EC2 (After Local Test Works):**

1. **Upload token.json to EC2:**
   ```bash
   scp -i your-key.pem api/token.json ubuntu@13.61.12.168:/var/www/dashboard/api/
   ```

2. **On EC2, enable emails:**
   ```bash
   cd /var/www/dashboard/api
   echo 'DISABLE_EMAIL=0' >> .env
   pm2 restart dashboard-api
   ```

3. **Test from live site:** http://13.61.12.168/dashboard

---

## 📋 **If You Get Errors:**

### **"credentials.json not found"**
- Make sure file is in `api/` folder
- Check filename is exactly `credentials.json`

### **"Access blocked"**
- In Google Cloud Console → OAuth consent screen
- Add yourself as test user
- Or publish the app

### **"token.json already exists"**
- Delete old token.json
- Run setup_gmail.py again

---

## ✅ **What to Expect:**

**When email is enabled:**
- All forms send emails to BOTH addresses
- You receive copies of all nominations/invoices
- Client receives at office@pen.com
- PDFs attached to emails
- Success messages confirm sending

**Current status (email disabled):**
- Forms work perfectly
- PDFs generate correctly
- Just no actual email sent

---

## 🎯 **Quick Test Checklist:**

- [ ] Download credentials.json from Google Cloud
- [ ] Place in `api/` folder
- [ ] Run `python api/setup_gmail.py`
- [ ] Browser opens, login, allow permissions
- [ ] token.json created
- [ ] Set DISABLE_EMAIL=0
- [ ] Restart backend
- [ ] Submit a form
- [ ] Check Gmail inbox

**Start with Step 1 - get credentials.json from Google Cloud Console!** 🚀


