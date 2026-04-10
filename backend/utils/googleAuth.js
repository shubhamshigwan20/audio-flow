require("dotenv").config();
const { google } = require("googleapis");

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const googleRedirectUri = process.env.GOOGLE_REDIRECT_URI;

const createOAuth2Client = () => {
  if (!googleClientId || !googleClientSecret) {
    throw new Error(
      "missing GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET in environment",
    );
  }
  return new google.auth.OAuth2(
    googleClientId,
    googleClientSecret,
    googleRedirectUri || "http://localhost:5173",
  );
};

const exchangeCodeForTokens = async (code) => {
  const oauth2Client = createOAuth2Client();
  const { tokens } = await oauth2Client.getToken(code);
  if (!tokens.refresh_token) {
    throw new Error(
      "no refresh token returned.ensure access_type=offline and prompt=consent.",
    );
  }
  return tokens;
};

const getDriveClientWithRefreshToken = async (refreshToken) => {
  const oauth2Client = createOAuth2Client();
  oauth2Client.setCredentials({ refresh_token: refreshToken });
  await oauth2Client.getAccessToken();
  return google.drive({ version: "v3", auth: oauth2Client });
};

module.exports = {
  google,
  createOAuth2Client,
  exchangeCodeForTokens,
  getDriveClientWithRefreshToken,
};
