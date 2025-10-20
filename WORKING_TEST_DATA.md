# ✅ Working Test Data - Copy & Paste These Values

## 🎯 Generate Invoice - Test Case 1 (MGO + IFO with AED)

**Copy these exact values into the form:**

```
Vessel name: SAPPHIRE X
Vessel IMO: 9621132
Vessel flag: Bahamas
Port: Saint-Petersburg
Supply date (DD.MM.YYYY): 28.07.2025
BDN numbers: 2807/01,2807/02

Products: Click "Both"

MGO tons: 110
MGO price (USD/mt): 710.00

IFO tons: 1030
IFO price (USD/mt): 359.50

Currency: AED
Exchange rate to USD: 3.6725
Company name: SimpleFuel
```

**Expected Result:**
- ✅ Success message
- ✅ File downloads: `20250728-B-SAPPHIRE_X.docx` (or .pdf with LibreOffice)
- ✅ All placeholders filled with data

---

## 🎯 Generate Invoice - Test Case 2 (MGO Only with USD)

```
Vessel name: SINO FAITH I
Vessel IMO: 8531108
Vessel flag: Panama
Port: Busan
Supply date (DD.MM.YYYY): 19.07.2025
BDN numbers: GSGM-25-050

Products: Click "MGO"

MGO tons: 200
MGO price (USD/mt): 680.75

Currency: USD
Exchange rate to USD: 1
Company name: SIMPLE FUEL
```

**Expected Result:**
- ✅ File: `20250719-B-SINO_FAITH_I.docx`

---

## 🎯 Generate Invoice - Test Case 3 (IFO Only with EUR)

```
Vessel name: KARMEL
Vessel IMO: 9290672
Vessel flag: Malta
Port: Fujairah
Supply date (DD.MM.YYYY): 09.01.2025
BDN numbers: 0901/01

Products: Click "IFO"

IFO tons: 850
IFO price (USD/mt): 340.00

Currency: EUR
Exchange rate to USD: 1.05
Company name: UMARINE FUELS DMCC
```

**Expected Result:**
- ✅ File: `20250109-B-KARMEL.docx`

---

## ⚠️ **Common Mistakes to Avoid**

### ❌ **Wrong:**
```
Supply date: wetw            (NOT a valid date)
MGO tons: tww                (NOT a number)
MGO price: wetwe             (NOT a number)
```

### ✅ **Correct:**
```
Supply date: 28.07.2025      (DD.MM.YYYY format)
MGO tons: 110                (Just the number)
MGO price: 710.00            (Decimal number)
```

---

## 📝 **Field Requirements**

| Field | Type | Format | Example |
|-------|------|--------|---------|
| Vessel name | Text | Any text | SAPPHIRE X |
| Vessel IMO | Number | 7 digits | 9621132 |
| Vessel flag | Text | Country name | Bahamas |
| Port | Dropdown | Select from list | Saint-Petersburg |
| Supply date | Date | DD.MM.YYYY | 28.07.2025 |
| BDN numbers | Text | Any format | 2807/01,2807/02 |
| MGO tons | Number | Decimal | 110 or 110.5 |
| MGO price | Number | Decimal (USD/mt) | 710.00 |
| IFO tons | Number | Decimal | 1030 or 1030.0 |
| IFO price | Number | Decimal (USD/mt) | 359.50 |
| Exchange rate | Number | Decimal | 3.6725 or 1 |
| Company name | Text | Any text | SimpleFuel |

---

## 🎬 **Step-by-Step Test**

### **1. Clear the form first**
- Refresh the page or close and reopen the form

### **2. Fill in order (copy-paste recommended):**

1. **Vessel IMO:** `9621132`
2. **Click "Lookup" button** (wait 2-3 seconds)
3. **Vessel name:** Should auto-fill to `SAPPHIRE X`
4. **Vessel flag:** Should auto-fill to `Bahamas`
5. **Port:** Select `Saint-Petersburg` from dropdown
6. **Supply date:** Type `28.07.2025`
7. **BDN numbers:** Type `2807/01,2807/02`
8. **Products:** Click on `Both` button (should turn green)
9. **MGO tons:** Type `110`
10. **MGO price:** Type `710`
11. **IFO tons:** Type `1030`
12. **IFO price:** Type `359.5`
13. **Currency:** Select `AED` from dropdown
14. **Exchange rate:** Type `3.6725`
15. **Company name:** Type `SimpleFuel`
16. **Click "Generate & Download PDF"**

### **3. Expected Result:**
- ✅ Green button shows "Generating..."
- ✅ After 2-3 seconds, shows "✓ Invoice generated! Downloading..."
- ✅ File downloads to your Downloads folder
- ✅ Filename: `20250728-B-SAPPHIRE_X.docx`

---

## 🔍 **If You Still Get Errors**

### **Check the browser console:**
1. Press F12 to open Developer Tools
2. Go to "Console" tab
3. Look for error messages in red
4. Share the error message with me

### **Check if server is running:**
```powershell
Invoke-WebRequest -Uri "http://localhost:8000/" | Select-Object Content
```
Should show: `{"msg":"Welcome to the API"}`

### **Check template files exist:**
```powershell
Get-ChildItem api\mgo*.docx
```
Should show template files

---

## 💡 **Pro Tips**

1. **Use IMO Lookup:** Saves time and prevents typos
2. **Start with "Both":** Tests the most complex scenario
3. **Use AED currency:** Tests exchange rate calculations
4. **Check Downloads folder:** Files go to browser's default download location
5. **Valid dates only:** Must be DD.MM.YYYY format

---

## ✅ **Quick Copy-Paste (All Fields)**

For fastest testing, copy this and fill field by field:

```
9621132
(lookup)
Saint-Petersburg
28.07.2025
2807/01,2807/02
(both)
110
710
1030
359.5
AED
3.6725
SimpleFuel
```

This will generate a proper invoice with all calculations!


