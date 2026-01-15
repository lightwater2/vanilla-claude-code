/**
 * GitHub OAuth Device Flow Service
 *
 * Implements GitHub's Device Flow for CLI/desktop authentication
 * https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps#device-flow
 */

import { BrowserWindow, shell } from 'electron';

// GitHub OAuth configuration
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || '';
const GITHUB_DEVICE_CODE_URL = 'https://github.com/login/device/code';
const GITHUB_ACCESS_TOKEN_URL = 'https://github.com/login/oauth/access_token';
const GITHUB_USER_URL = 'https://api.github.com/user';

// Required scopes for full functionality
const SCOPES = ['repo', 'read:user', 'workflow'];

export interface DeviceCodeResponse {
  device_code: string;
  user_code: string;
  verification_uri: string;
  expires_in: number;
  interval: number;
}

export interface AccessTokenResponse {
  access_token?: string;
  token_type?: string;
  scope?: string;
  error?: string;
  error_description?: string;
}

export interface GitHubUser {
  id: number;
  login: string;
  name: string | null;
  email: string | null;
  avatar_url: string;
  html_url: string;
}

/**
 * Request device and user verification codes from GitHub
 */
export async function requestDeviceCode(): Promise<DeviceCodeResponse> {
  const response = await fetch(GITHUB_DEVICE_CODE_URL, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: GITHUB_CLIENT_ID,
      scope: SCOPES.join(' '),
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to request device code: ${response.status}`);
  }

  return response.json();
}

/**
 * Poll GitHub for access token after user authorization
 */
export async function pollForAccessToken(
  deviceCode: string,
  interval: number = 5
): Promise<AccessTokenResponse> {
  const response = await fetch(GITHUB_ACCESS_TOKEN_URL, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: GITHUB_CLIENT_ID,
      device_code: deviceCode,
      grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to poll for access token: ${response.status}`);
  }

  return response.json();
}

/**
 * Fetch authenticated user info from GitHub API
 */
export async function fetchUser(accessToken: string): Promise<GitHubUser> {
  const response = await fetch(GITHUB_USER_URL, {
    headers: {
      Accept: 'application/vnd.github.v3+json',
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch user: ${response.status}`);
  }

  return response.json();
}

/**
 * Open the GitHub device verification page in default browser
 */
export function openVerificationPage(verificationUri: string): void {
  shell.openExternal(verificationUri);
}

/**
 * Complete Device Flow authentication process
 * Returns access token and user info on success
 */
export async function authenticateWithDeviceFlow(
  onUserCode: (code: string, verificationUri: string) => void,
  onProgress: (status: string) => void
): Promise<{ accessToken: string; user: GitHubUser }> {
  // Step 1: Request device code
  onProgress('Requesting device code...');
  const deviceCodeResponse = await requestDeviceCode();

  // Step 2: Show user code to user
  onUserCode(deviceCodeResponse.user_code, deviceCodeResponse.verification_uri);
  onProgress('Waiting for authorization...');

  // Step 3: Poll for access token
  const expiresAt = Date.now() + deviceCodeResponse.expires_in * 1000;
  let interval = deviceCodeResponse.interval * 1000;

  while (Date.now() < expiresAt) {
    await new Promise((resolve) => setTimeout(resolve, interval));

    const tokenResponse = await pollForAccessToken(
      deviceCodeResponse.device_code,
      deviceCodeResponse.interval
    );

    if (tokenResponse.access_token) {
      // Step 4: Fetch user info
      onProgress('Fetching user info...');
      const user = await fetchUser(tokenResponse.access_token);

      return {
        accessToken: tokenResponse.access_token,
        user,
      };
    }

    if (tokenResponse.error === 'authorization_pending') {
      // User hasn't authorized yet, continue polling
      continue;
    }

    if (tokenResponse.error === 'slow_down') {
      // Increase polling interval
      interval += 5000;
      continue;
    }

    if (tokenResponse.error === 'expired_token') {
      throw new Error('Device code expired. Please try again.');
    }

    if (tokenResponse.error === 'access_denied') {
      throw new Error('Authorization was denied by user.');
    }

    if (tokenResponse.error) {
      throw new Error(
        tokenResponse.error_description || tokenResponse.error
      );
    }
  }

  throw new Error('Authorization timed out. Please try again.');
}

export default {
  requestDeviceCode,
  pollForAccessToken,
  fetchUser,
  openVerificationPage,
  authenticateWithDeviceFlow,
};
