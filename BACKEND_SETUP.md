# Backend Setup & Testing Guide

---
## Quick Start

### 1. Start Python Backend

```bash
cd api
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

The server should show:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete.
```

### 2. Start Next.js Frontend (in separate terminal)

```bash
npm run dev
```

### 3. Access Dashboard

Open browser to: `http://localhost:3000`

---

## API Endpoints Implemented

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/` | GET | Health check |
| `/endpoint1` | POST | Main nomination processing (generates PDFs, sends emails) |
| `/initial-request` | POST | Send initial bunker request email |
| `/first-nomination` | POST | Send first nomination email (vessel info only) |
| `/final-nomination` | POST | Send final nomination with quantities |
| `/generate-invoice` | POST | Generate invoice PDF with all calculations |
| `/download/{filename}` | GET | Download generated PDF/DOCX files |

---

## Forms & Their Endpoints

### 1. Initiate New Request
**Endpoint:** `POST /initial-request`

**Fields:**
- Vessel Name
- MGO tons, IFO tons  
- Bunker date (start), Bunker date (end)
- Port
- Agent name
- Full order text (textarea)

**Action:** Sends email to Simple Fuel FZCO with request details

---

### 2. Generate First Nomination
**Endpoint:** `POST /first-nomination`

**Fields:**
- Vessel name
- Vessel IMO (with Lookup button)
- Vessel flag

**Action:** Sends email with basic vessel information

**Lookup Feature:** Click "Lookup" button after entering IMO to auto-fill vessel name and flag from MarineTraffic

---

### 3. Generate Final Nomination  
**Endpoint:** `POST /final-nomination`

**Fields:**
- Vessel name
- Actual MGO tons, MGO price
- Actual IFO tons, IFO price
- Bunker date (single date)

**Action:** Sends email with confirmed quantities and prices

---

### 4. Generate Invoice
**Endpoint:** `POST /generate-invoice`

**Fields:**
- Vessel name, IMO (with Lookup), flag
- Port, Supply date, BDN numbers
- Products: MGO, IFO, or Both selector
- MGO/IFO tons and prices (conditional)
- Currency (USD/AED/EUR/BHD)
- Exchange rate to USD
- Company name

**Action:** 
1. Generates invoice PDF using template
2. Calculates totals with currency conversion
3. Adds bank details based on currency
4. Downloads PDF to user's computer

---

## Troubleshooting

### HTTP 404 Errors

**Cause:** Python backend not running or running old code

**Solution:**
1. Stop any running Python processes
2. Navigate to `api` folder
3. Start server: `python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload`
4. Refresh browser

### Charts Not Displaying

**Cause:** Frontend API trying to fetch USD/RUB data

**Solution:** Charts will load once Yahoo Finance API responds. May take a few seconds on first load.

### IMO Lookup Not Working

**Cause:** MarineTraffic.com blocking requests or rate limiting

**Solution:** 
- Wait a few seconds between lookups
- Or manually enter vessel name and flag

### Invoice Generation Fails

**Possible Causes:**
1. Template files missing (`mgo_nom_template.docx`, etc.)
2. LibreOffice not installed at expected path
3. Missing write permissions to `finished_noms` folder

**Solutions:**
1. Ensure template files exist in `api/` folder
2. Install LibreOffice or update `LIBREOFFICE_PATH` env variable
3. Check folder permissions

---

## Environment Variables

Create `.env` file in `api/` folder:

```env
# Email Configuration
PEN_EMAIL=office@pen.com
EMAIL_ADDRESS=your_email@example.com
TOKEN_FILE=token.json
DISABLE_EMAIL=1  # Set to 0 to enable emails

# Template Paths (optional - uses defaults)
MGO_TEMPLATE=./mgo_nom_template.docx
IFO_TEMPLATE=./ifo_nom_template.docx  
BOTH_TEMPLATE=./mgo_ifo_nom_template.docx

# LibreOffice Path
LIBREOFFICE_PATH=C:\\Program Files\\LibreOffice\\program\\soffice.exe

# S3 Configuration (optional)
S3_BUCKET=your-bucket-name
S3_PREFIX=noms/
AWS_REGION=us-east-1
```

---

## Testing Workflow

### Test Initial Request:
1. Click "Initiate new request"
2. Fill: Vessel Name, MGO/IFO tons, dates, port, agent
3. Add full order text
4. Click "Submit request"
5. ✅ Should show "✓ Initial request sent successfully!"

### Test First Nomination:
1. Click "Generate first nomination"
2. Enter IMO number (e.g., 9876543)
3. Click "Lookup" → auto-fills name & flag
4. Click "Generate & email"
5. ✅ Should show "✓ First nomination sent successfully!"

### Test Final Nomination:
1. Click "Generate final nomination"
2. Fill vessel name, quantities, prices, date
3. Click "Generate & email"
4. ✅ Should show "✓ Final nomination sent successfully!"

### Test Invoice Generation:
1. Click "Generate invoice"
2. Enter IMO → Click "Lookup"
3. Fill all fields (port, date, BDN, products)
4. Select currency and product type
5. Click "Generate & Download PDF"
6. ✅ PDF should download to your computer

---

## Features Implemented from Feedback

✅ Charts: Text overlap fixed, USD/RUB, no blue outline  
✅ Sidebar: MarineTraffic-style (icons fixed, text appears)  
✅ Forms: 4 types with correct fields per script requirements  
✅ IMO Lookup: Auto-populate vessel name & flag  
✅ Product Selector: MGO, IFO, or Both options  
✅ Date Format: DD.MM.YYYY  
✅ Currency Support: USD, AED, EUR, BHD with exchange rates  
✅ PDF Generation: Full invoice creation with templates  
✅ Email Integration: Gmail API for all notifications  
✅ Port Dropdown: 24 ports including 6 Russian ports  
✅ Backend Integration: All forms functional with API  

---

## File Structure

```
api/
├── app/
│   └── main.py          (FastAPI backend - 710 lines)
├── finished_noms/        (Generated PDFs/DOCX)
├── mgo_nom_template.docx
├── ifo_nom_template.docx  
├── mgo_ifo_nom_template.docx
└── requirements.txt

src/
├── app/
│   ├── dashboard/
│   │   └── page.tsx     (Main dashboard - 1155 lines)
│   ├── api/
│   │   ├── prices/route.ts
│   │   ├── vessel-lookup/route.ts
│   │   └── generate-invoice/route.ts
│   └── globals.css
```

---

## Next Steps

1. **Start Backend:** `cd api && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload`
2. **Start Frontend:** `npm run dev` (in project root)
3. **Test All Forms:** Go through each button and test functionality
4. **Configure Email:** Set up Gmail OAuth token for email sending
5. **Add Templates:** Ensure all .docx templates exist in `api/` folder

---

## Notes

- **Email sending** will skip if `DISABLE_EMAIL=1` or `token.json` missing (for local testing)
- **PDF conversion** requires LibreOffice installed
- **S3 upload** is optional (configure AWS credentials if needed)
- **Port 8000** must be available for backend
- **Port 3000** must be available for frontend


