/**
 * Spotify API Service
 * Uses PKCE OAuth flow for mobile apps (required by Spotify)
 * NO CLIENT SECRET - Spotify forbids using client secrets in mobile apps
 */

import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import * as Crypto from "expo-crypto";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Complete auth session for proper redirect handling
WebBrowser.maybeCompleteAuthSession();

// Storage keys
const SPOTIFY_TOKEN_KEY = "@daredrop:spotify_token";
const SPOTIFY_TOKEN_EXPIRY_KEY = "@daredrop:spotify_token_expiry";
const SPOTIFY_REFRESH_TOKEN_KEY = "@daredrop:spotify_refresh_token";

export interface SpotifySong {
  id: string;
  name: string;
  artist: string;
  album: string;
  albumArt: string;
  spotifyUri: string;
  spotifyUrl: string;
  previewUrl?: string;
}

interface SpotifyTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope?: string;
}

interface SpotifySearchResponse {
  tracks: {
    items: Array<{
      id: string;
      name: string;
      artists: Array<{ name: string }>;
      album: {
        name: string;
        images: Array<{ url: string }>;
      };
      uri: string;
      external_urls: {
        spotify: string;
      };
      preview_url: string | null;
    }>;
  };
}

// Spotify API endpoints
const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";
const SPOTIFY_API_BASE = "https://api.spotify.com/v1";

// Spotify OAuth discovery document
const discovery = {
  authorizationEndpoint: "https://accounts.spotify.com/authorize",
  tokenEndpoint: "https://accounts.spotify.com/api/token",
};

/**
 * Get the redirect URI for Spotify OAuth
 * Must match exactly what's configured in Spotify Dashboard
 * In development: exp://10.0.0.203:8081 (no path!)
 * In production: daredrop://spotify-callback
 */
function getRedirectUri(): string {
  // For development, use the Expo dev server URL directly (no path)
  // This must match EXACTLY what's in Spotify Dashboard
  // makeRedirectUri() without options returns the base Expo URL
  const redirectUri = AuthSession.makeRedirectUri();
  
  // Log for debugging - this will show the actual URI being used
  console.log("📍 Using redirect URI:", redirectUri);
  console.log("⚠️  Make sure this EXACT URI is in Spotify Dashboard → Settings → Redirect URIs");
  console.log("⚠️  The URI must match EXACTLY (including no trailing slash, no path)");
  
  return redirectUri;
}

/**
 * Generate a cryptographically random string for PKCE
 */
async function generateRandomString(length: number): Promise<string> {
  const randomBytes = await Crypto.getRandomBytesAsync(length);
  return Array.from(randomBytes as Uint8Array)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
    .substring(0, length);
}

/**
 * Generate PKCE code verifier and challenge
 */
async function generatePKCE(): Promise<{ codeVerifier: string; codeChallenge: string }> {
  const codeVerifier = await generateRandomString(128);
  
  // Create SHA256 hash of code verifier
  const hash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    codeVerifier
  );
  
  // Base64 URL encode (remove padding, replace + with -, / with _)
  const codeChallenge = hash
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
  
  return { codeVerifier, codeChallenge };
}

/**
 * Check if user is authenticated with Spotify
 */
export async function isSpotifyAuthenticated(): Promise<boolean> {
  const token = await AsyncStorage.getItem(SPOTIFY_TOKEN_KEY);
  const expiry = await AsyncStorage.getItem(SPOTIFY_TOKEN_EXPIRY_KEY);
  
  if (!token || !expiry) {
    return false;
  }
  
  // Check if token is still valid (with 5 minute buffer)
  const expiryTime = parseInt(expiry, 10);
  return expiryTime > Date.now() + 5 * 60 * 1000;
}

/**
 * Authenticate with Spotify using PKCE OAuth flow
 * This will open a browser for user to authorize the app
 */
export async function authenticateSpotify(): Promise<boolean> {
  const clientId = process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_ID?.trim();
  
  if (!clientId) {
    throw new Error(
      "Spotify Client ID not configured. Please set EXPO_PUBLIC_SPOTIFY_CLIENT_ID in your .env file."
    );
  }

  try {
    const redirectUri = getRedirectUri();

    console.log("🔑 Starting Spotify PKCE authentication...");
    console.log("📍 Redirect URI being used:", redirectUri);
    console.log("⚠️  CRITICAL: This URI must match EXACTLY in Spotify Dashboard");
    console.log("⚠️  Go to: https://developer.spotify.com/dashboard → Your App → Settings → Redirect URIs");
    console.log("⚠️  Add this EXACT URI (copy-paste it):", redirectUri);

    // Create auth request with PKCE
    const request = new AuthSession.AuthRequest({
      clientId,
      scopes: ["user-read-private", "user-read-email"], // Minimal scopes for search
      redirectUri,
      responseType: AuthSession.ResponseType.Code,
      usePKCE: true,
    });

    // Prompt user to authenticate
    const result = await request.promptAsync(discovery);

    if (result.type === "success" && result.params?.code && request.codeVerifier) {
      const authCode = result.params.code;
      
      // Exchange authorization code for access token
      await exchangeCodeForToken(authCode, request.codeVerifier, redirectUri);
      return true;
    } else if (result.type === "error") {
      console.error("Spotify auth error:", result.error);
      throw new Error(`Spotify authentication failed: ${result.error?.message || "Unknown error"}`);
    } else {
      // User cancelled
      console.log("User cancelled Spotify authentication");
      return false;
    }
  } catch (error: any) {
    console.error("Error authenticating with Spotify:", error);
    throw error;
  }
}

/**
 * Exchange authorization code for access token
 */
async function exchangeCodeForToken(
  code: string,
  codeVerifier: string,
  redirectUri: string
): Promise<void> {
  const clientId = process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_ID?.trim();
  
  if (!clientId) {
    throw new Error("Spotify Client ID not configured");
  }

  try {
    const response = await fetch(SPOTIFY_TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
        client_id: clientId,
        code_verifier: codeVerifier,
      }).toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Token exchange failed: ${response.status} - ${errorText}`);
    }

    const data: SpotifyTokenResponse = await response.json();
    
    // Store tokens
    await AsyncStorage.setItem(SPOTIFY_TOKEN_KEY, data.access_token);
    await AsyncStorage.setItem(
      SPOTIFY_TOKEN_EXPIRY_KEY,
      (Date.now() + data.expires_in * 1000).toString()
    );
    
    if (data.refresh_token) {
      await AsyncStorage.setItem(SPOTIFY_REFRESH_TOKEN_KEY, data.refresh_token);
    }

    console.log("✅ Spotify authentication successful");
  } catch (error) {
    console.error("Error exchanging code for token:", error);
    throw error;
  }
}

/**
 * Refresh access token using refresh token
 */
async function refreshAccessToken(): Promise<string> {
  const clientId = process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_ID?.trim();
  const refreshToken = await AsyncStorage.getItem(SPOTIFY_REFRESH_TOKEN_KEY);
  
  if (!clientId || !refreshToken) {
    throw new Error("Cannot refresh token: missing credentials");
  }

  try {
    const response = await fetch(SPOTIFY_TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        client_id: clientId,
      }).toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      // If refresh fails, user needs to re-authenticate
      await clearSpotifyTokens();
      throw new Error(`Token refresh failed: ${response.status} - ${errorText}`);
    }

    const data: SpotifyTokenResponse = await response.json();
    
    // Update stored tokens
    await AsyncStorage.setItem(SPOTIFY_TOKEN_KEY, data.access_token);
    await AsyncStorage.setItem(
      SPOTIFY_TOKEN_EXPIRY_KEY,
      (Date.now() + data.expires_in * 1000).toString()
    );
    
    if (data.refresh_token) {
      await AsyncStorage.setItem(SPOTIFY_REFRESH_TOKEN_KEY, data.refresh_token);
    }

    return data.access_token;
  } catch (error) {
    console.error("Error refreshing token:", error);
    throw error;
  }
}

/**
 * Get valid access token (from cache, refresh, or require auth)
 */
async function getAccessToken(): Promise<string> {
  // Check if we have a valid cached token
  const token = await AsyncStorage.getItem(SPOTIFY_TOKEN_KEY);
  const expiry = await AsyncStorage.getItem(SPOTIFY_TOKEN_EXPIRY_KEY);
  
  if (token && expiry) {
    const expiryTime = parseInt(expiry, 10);
    // If token is still valid (with 5 minute buffer), return it
    if (expiryTime > Date.now() + 5 * 60 * 1000) {
      return token;
    }
    
    // Token expired, try to refresh
    try {
      return await refreshAccessToken();
    } catch (error) {
      // Refresh failed, need to re-authenticate
      throw new Error(
        "Spotify session expired. Please authenticate again. Call authenticateSpotify() first."
      );
    }
  }
  
  // No token found, need to authenticate
  throw new Error(
    "Not authenticated with Spotify. Please call authenticateSpotify() first."
  );
}

/**
 * Clear stored Spotify tokens
 */
export async function clearSpotifyTokens(): Promise<void> {
  await AsyncStorage.multiRemove([
    SPOTIFY_TOKEN_KEY,
    SPOTIFY_TOKEN_EXPIRY_KEY,
    SPOTIFY_REFRESH_TOKEN_KEY,
  ]);
}

/**
 * Search for songs on Spotify
 * @param query - Search query (song name, artist, etc.)
 * @param limit - Number of results (default: 20, max: 50)
 */
export async function searchSongs(
  query: string,
  limit: number = 20
): Promise<SpotifySong[]> {
  if (!query.trim()) {
    return [];
  }

  try {
    const token = await getAccessToken();

    const encodedQuery = encodeURIComponent(query);
    const url = `${SPOTIFY_API_BASE}/search?q=${encodedQuery}&type=track&limit=${Math.min(limit, 50)}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token expired, try to refresh and retry once
        try {
          const newToken = await refreshAccessToken();
          const retryResponse = await fetch(url, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${newToken}`,
              "Content-Type": "application/json",
            },
          });
          
          if (!retryResponse.ok) {
            throw new Error(`Spotify search failed: ${retryResponse.status}`);
          }
          
          const retryData: SpotifySearchResponse = await retryResponse.json();
          return formatSearchResults(retryData);
        } catch (refreshError) {
          throw new Error(
            "Spotify session expired. Please authenticate again."
          );
        }
      }
      
      throw new Error(`Spotify search failed: ${response.status}`);
    }

    const data: SpotifySearchResponse = await response.json();
    return formatSearchResults(data);
  } catch (error: any) {
    console.error("Error searching Spotify:", error);
    
    // Provide helpful error messages
    if (error.message?.includes("Not authenticated")) {
      throw new Error(
        "Please authenticate with Spotify first. The app will prompt you to log in."
      );
    }
    
    throw error;
  }
}

/**
 * Format Spotify API response into our SpotifySong interface
 */
function formatSearchResults(data: SpotifySearchResponse): SpotifySong[] {
  return data.tracks.items.map((track) => ({
    id: track.id,
    name: track.name,
    artist: track.artists.map((a) => a.name).join(", "),
    album: track.album.name,
    albumArt:
      track.album.images.find((img) => img.url)?.url ||
      track.album.images[0]?.url ||
      "",
    spotifyUri: track.uri,
    spotifyUrl: track.external_urls.spotify,
    previewUrl: track.preview_url || undefined,
  }));
}

/**
 * Parse stored Spotify song data from JSON string
 */
export function parseSpotifySong(jsonString: string): SpotifySong | null {
  try {
    return JSON.parse(jsonString) as SpotifySong;
  } catch {
    return null;
  }
}

/**
 * Format Spotify song for display
 */
export function formatSpotifySong(song: SpotifySong): string {
  return `${song.name} by ${song.artist}`;
}
