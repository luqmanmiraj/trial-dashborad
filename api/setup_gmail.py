from google_auth_oauthlib.flow import InstalledAppFlow
from google.oauth2.credentials import Credentials
import os

SCOPES = ['https://www.googleapis.com/auth/gmail.send']

def main():
    print("🔐 Gmail OAuth Setup")
    print("=" * 50)
    
    if not os.path.exists('credentials.json'):
        print("\n❌ ERROR: credentials.json not found!")
        print("\nPlease follow these steps:")
        print("1. Go to: https://console.cloud.google.com/")
        print("2. Create new project or select existing")
        print("3. Enable Gmail API")
        print("4. Create OAuth 2.0 Client ID (Desktop app)")
        print("5. Download JSON and save as 'credentials.json'")
        print("6. Place credentials.json in the 'api' folder")
        print("7. Run this script again")
        return
    
    print("\n📧 Setting up Gmail authentication...")
    print("A browser window will open for you to login with Gmail...")
    
    try:
        flow = InstalledAppFlow.from_client_secrets_file('credentials.json', SCOPES)
        creds = flow.run_local_server(port=0)
        
        with open('token.json', 'w') as token:
            token.write(creds.to_json())
        
        print("\n✅ SUCCESS! Gmail authentication complete!")
        print("✅ token.json file created")
        print("\n📝 Next steps:")
        print("1. Set DISABLE_EMAIL=0 in your environment")
        print("2. Restart backend: pm2 restart dashboard-api")
        print("3. Test by submitting a form")
        print("4. Check email at: luqmanmirajdeen@gmail.com")
        
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        print("\nMake sure you:")
        print("- Have valid credentials.json")
        print("- Allow popup windows in browser")
        print("- Login with correct Google account")

if __name__ == '__main__':
    main()

