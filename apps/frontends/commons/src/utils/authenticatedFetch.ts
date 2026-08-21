const ACCESS_TOKEN_KEY = "nexoroute.accessToken";
const REFRESH_TOKEN_KEY = "nexoroute.refreshToken";
const USER_KEY = "nexoroute.user";

type RefreshResponse = {
  accessToken: string;
  refreshToken: string;
  user?: unknown;
};

type AuthWindow = Window & {
  __nexorouteRefreshPromise?: Promise<string | null>;
};

function clearSession() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

async function refreshAccessToken(
  apiUrl: string,
  rejectedAccessToken: string | null,
) {
  if (typeof window === "undefined") return null;

  const currentAccessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
  if (currentAccessToken && currentAccessToken !== rejectedAccessToken) {
    return currentAccessToken;
  }

  const authWindow = window as AuthWindow;
  if (authWindow.__nexorouteRefreshPromise) {
    return authWindow.__nexorouteRefreshPromise;
  }

  authWindow.__nexorouteRefreshPromise = (async () => {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (!refreshToken) return null;

    const response = await fetch(`${apiUrl}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    if (!response.ok) return null;

    const session = (await response.json()) as RefreshResponse;
    if (!session.accessToken || !session.refreshToken) return null;

    localStorage.setItem(ACCESS_TOKEN_KEY, session.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, session.refreshToken);
    if (session.user) localStorage.setItem(USER_KEY, JSON.stringify(session.user));
    return session.accessToken;
  })()
    .catch(() => null)
    .finally(() => {
      delete authWindow.__nexorouteRefreshPromise;
    });

  return authWindow.__nexorouteRefreshPromise;
}

function withAccessToken(init: RequestInit | undefined, accessToken: string | null) {
  const headers = new Headers(init?.headers);
  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);
  else headers.delete("Authorization");
  return { ...init, headers };
}

export async function authenticatedFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
  apiUrl = "http://localhost:5000",
) {
  if (typeof window === "undefined") return fetch(input, init);

  const rejectedAccessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
  let response = await fetch(input, withAccessToken(init, rejectedAccessToken));
  if (response.status !== 401) return response;

  const renewedAccessToken = await refreshAccessToken(apiUrl, rejectedAccessToken);
  if (renewedAccessToken) {
    response = await fetch(input, withAccessToken(init, renewedAccessToken));
    return response;
  }

  clearSession();
  if (window.location.pathname !== "/login") window.location.assign("/login");
  return response;
}
