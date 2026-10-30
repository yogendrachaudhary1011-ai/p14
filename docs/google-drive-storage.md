# Google Drive media storage

The CMS can store new uploads in a `P14 Website Media` folder in the connected Google Drive. Drive files stay private; the site streams them from an authenticated server endpoint and caches the response for visitors. The app requests Google's `drive.file` scope, which is limited to files created by this app.

## 1. Create Google OAuth credentials

1. Open [Google Cloud Console](https://console.cloud.google.com/) and select the Google Cloud project used by this site (`gen-lang-client-0706919729`) or a project you control.
2. Enable the **Google Drive API** for that project.
3. Configure the OAuth consent screen. Use **External** for a personal Google account. If the app is in Testing, add the account you will connect as a test user.
4. Create an OAuth client with application type **Web application**.
5. Add this exact authorized redirect URI:

   `https://p14-olive.vercel.app/api/admin/google-drive/callback`

6. Copy the OAuth client ID and client secret. Keep the secret private.

For continuous use, set the OAuth app's publishing status to **In production**. Google says refresh tokens for an External app left in Testing expire after seven days when Drive scopes are requested. Production publication can require Google's verification steps depending on the consent-screen configuration and use case. See [Google's OAuth refresh-token guidance](https://developers.google.com/identity/protocols/oauth2#expiration) and [Drive API scopes](https://developers.google.com/workspace/drive/api/guides/api-specific-auth).

## 2. Add secrets to Vercel

In **Vercel â†’ p14 â†’ Settings â†’ Environment Variables**, add the following to the **Production** environment:

| Name | Value |
| --- | --- |
| `GOOGLE_DRIVE_CLIENT_ID` | OAuth client ID from Google Cloud |
| `GOOGLE_DRIVE_CLIENT_SECRET` | OAuth client secret from Google Cloud |
| `GOOGLE_DRIVE_TOKEN_ENCRYPTION_KEY` | Generate a base64 32-byte key with `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"` |

Do not commit these values or paste them into chat. The encryption key protects the saved Google refresh token in the site's database. If the key is changed later, reconnect Google Drive to save a new token.

After saving the variables, redeploy the production site.

## 3. Connect the account

1. Sign in to the site's CMS and open **Media Library**.
2. Select **Connect Google Drive** and approve access with the Google account that should own the site's media.
3. The CMS creates a `P14 Website Media` folder in that account. New uploads are saved there. Existing media remains where it is; replacing an existing image moves the replacement to Drive and updates the site's references.

Google Drive is the source store; the site delivers media through Vercel so private Drive files can appear on public pages. Large uploads still pass through Vercel's serverless request-size limit.

