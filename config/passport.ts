import { google } from "googleapis";

const createOAuthClient = () => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri =
    process.env.GOOGLE_CALLBACK_URL ||
    "http://localhost:5050/api/auth/google/callback";

  if (!clientId || !clientSecret) {
    throw new Error("Google OAuth2 credentials are missing");
  }

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
};

const oauthScopes = ["openid", "email", "profile", "https://mail.google.com/"];

export { createOAuthClient, oauthScopes };
