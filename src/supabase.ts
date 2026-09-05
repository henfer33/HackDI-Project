import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_KEY;

/**
 * Live backend is optional. With no credentials the app falls back to the
 * in-memory store, so a dead venue wifi cannot take the demo down.
 */
export const isLive = Boolean(url && key);

export const supabase = isLive
  ? createClient(url!, key!, {
      auth: { persistSession: false },
      realtime: { params: { eventsPerSecond: 10 } },
    })
  : null;
