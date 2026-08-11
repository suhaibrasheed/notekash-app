// Retrieve configuration from window.ENV, localStorage, or process/import.meta if available
let supabaseUrl = '';
let supabaseAnonKey = '';

try {
    supabaseUrl = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) || window.ENV?.VITE_SUPABASE_URL || localStorage.getItem('VITE_SUPABASE_URL') || '';
    supabaseAnonKey = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) || window.ENV?.VITE_SUPABASE_ANON_KEY || localStorage.getItem('VITE_SUPABASE_ANON_KEY') || '';
} catch (e) {
    // Suppress errors in non-bundler environment
}

// Fallback to placeholders for demonstration / initial setup
if (!supabaseUrl) {
    supabaseUrl = 'https://axzwfwjgndqjajabvscd.supabase.co';
}
if (!supabaseAnonKey) {
    supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4endmd2pnbmRxamFqYWJ2c2NkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQyOTAzNDksImV4cCI6MjA5OTg2NjM0OX0.6N2mFFDcQW9rwrbNHZyXpoldbZNX-0RripH5Web3y-U';
}

const hostname = (typeof window !== 'undefined' && window.location && typeof window.location.hostname === 'string') ? window.location.hostname : '';
const isNoteKashDomain = typeof hostname.endsWith === 'function' && hostname.endsWith('notekash.com');

const authConfig = {
  persistSession: true,
  storageKey: 'notekash-auth-token',
  autoRefreshToken: true,
  detectSessionInUrl: true
};

if (isNoteKashDomain) {
  authConfig.cookieOptions = {
    domain: '.notekash.com', // Preceding dot allows cookie sharing on subdomains in production
    secure: typeof window !== 'undefined' && window.location && window.location.protocol === 'https:',
    sameSite: 'Lax'
  };
}

let _clientInstance = null;
let _clientInitPromise = null;

async function getRealClient() {
  if (_clientInstance) return _clientInstance;
  if (_clientInitPromise) return _clientInitPromise;

  _clientInitPromise = (async () => {
    try {
      let createClientFn = null;
      if (typeof window !== 'undefined' && window.supabase && typeof window.supabase.createClient === 'function') {
        createClientFn = window.supabase.createClient;
      } else if (typeof navigator === 'undefined' || navigator.onLine !== false) {
        const mod = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
        createClientFn = mod?.createClient;
      }

      if (createClientFn) {
        _clientInstance = createClientFn(supabaseUrl, supabaseAnonKey, { auth: authConfig });
        return _clientInstance;
      }
    } catch (err) {
      console.warn("Supabase client could not be loaded dynamically (offline or CDN unreachable):", err?.message || err);
    }
    return null;
  })();

  return _clientInitPromise;
}

// Fallback session reader for offline resilience
function getOfflineSession() {
  try {
    const raw = localStorage.getItem('notekash-auth-token');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && (parsed.access_token || parsed.currentSession)) {
        const session = parsed.currentSession || parsed;
        return { data: { session }, error: null };
      }
    }
  } catch (e) {
    console.warn('Supabase: Could not parse cached offline session from localStorage.', e);
  }
  return { data: { session: null }, error: null };
}

// Resilient, offline-safe export wrapper
export const supabase = {
  auth: {
    async getSession() {
      const client = await getRealClient();
      if (client && client.auth) {
        return client.auth.getSession();
      }
      return getOfflineSession();
    },
    async signOut() {
      const client = await getRealClient();
      if (client && client.auth) {
        return client.auth.signOut();
      }
      try {
        localStorage.removeItem('notekash-auth-token');
      } catch (e) {
        console.warn('Supabase: Could not clear auth token from localStorage on sign out.', e);
      }
      return { error: null };
    },
    async getUser() {
      const client = await getRealClient();
      if (client && client.auth) return client.auth.getUser();
      const sessionRes = getOfflineSession();
      return { data: { user: sessionRes.data?.session?.user || null }, error: null };
    },
    onAuthStateChange(callback) {
      // Capture the real subscription once the client resolves so unsubscribe() works correctly.
      let realUnsubscribe = null;
      getRealClient().then(client => {
        if (client && client.auth) {
          const { data } = client.auth.onAuthStateChange(callback);
          realUnsubscribe = data?.subscription?.unsubscribe ?? null;
        }
      });
      // Return a stable handle immediately. Delegates to the real Supabase
      // subscription after the client resolves, preventing listener leaks.
      return {
        data: {
          subscription: {
            unsubscribe: () => { if (realUnsubscribe) realUnsubscribe(); }
          }
        }
      };
    }
  },
  from(tableName) {
    const calls = [];
    const createChain = () => {
      const handler = {
        get(target, prop) {
          if (prop === 'then') {
            return async (resolve, reject) => {
              try {
                const client = await getRealClient();
                if (client) {
                  let query = client.from(tableName);
                  for (const step of calls) {
                    if (typeof query[step.method] === 'function') {
                      query = query[step.method](...step.args);
                    }
                  }
                  const res = await query;
                  resolve(res);
                } else {
                  resolve({ data: null, error: new Error("Offline: Supabase service unavailable") });
                }
              } catch (err) {
                resolve({ data: null, error: err });
              }
            };
          }
          return (...args) => {
            calls.push({ method: prop, args });
            return proxy;
          };
        }
      };
      const proxy = new Proxy({}, handler);
      return proxy;
    };
    return createChain();
  },
  async getClient() {
    return getRealClient();
  }
};
