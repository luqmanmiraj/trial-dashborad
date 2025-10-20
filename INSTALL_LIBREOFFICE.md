# Install LibreOffice for PDF Generation

## Why LibreOffice is Needed

The invoice generation requires converting `.docx` files to `.pdf`. LibreOffice provides a command-line tool for this conversion.

## Installation Steps (Windows)

### Option 1: Download and Install

1. **Download LibreOffice:**
   - Visit: https://www.libreoffice.org/download/download/
   - Click "Download" for Windows x86_64 (MSI)
   - File size: ~300 MB

2. **Install:**
   - Run the downloaded `.msi` file
   - Use default installation path: `C:\Program Files\LibreOffice`
   - Complete the installation wizard

3. **Verify Installation:**
   ```powershell
   Test-Path "C:\Program Files\LibreOffice\program\soffice.exe"
   ```
   Should return: `True`

### Option 2: Using Chocolatey (if you have it)

```powershell
choco install libreoffice
```

## Alternative: Use Portable Version

1. Download LibreOffice Portable from PortableApps.com
2. Extract to a folder (e.g., `C:\PortableApps\LibreOfficePortable`)
3. Update environment variable:
   ```env
   LIBREOFFICE_PATH=C:\PortableApps\LibreOfficePortable\App\libreoffice\program\soffice.exe
   ```

## Current Workaround (Without LibreOffice)

If you don't want to install LibreOffice right now:

1. **Invoices will download as .docx files**
2. **Open in Microsoft Word**
3. **File → Save As → PDF**

The `.docx` files have all the correct data filled in - they just need manual PDF conversion.

## After Installing LibreOffice

1. **Restart the Python backend:**
   ```powershell
   cd api
   python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```

2. **Test invoice generation again**
   - Should now download as `.pdf` files automatically

## Verify It's Working

After installation, test with PowerShell:

```powershell
& "C:\Program Files\LibreOffice\program\soffice.exe" --version
```

Should output something like: `LibreOffice 7.x.x.x`

---

## Current Status

✅ **Invoice generation works** - All data is correctly filled in  
✅ **Placeholders replaced** - Vessel name, IMO, prices, totals calculated  
✅ **Bank details added** - Based on selected currency  
⚠️ **PDF conversion** - Requires LibreOffice installation  

**For now:** Invoices download as .docx - all data is correct, just needs manual PDF conversion in Word.


