import { createClient } from "@supabase/supabase-js";

/**
 * Membuat client Supabase di sisi server untuk pengunjung.
 * Menggunakan SUPABASE_SECRET_KEY dari environment variable untuk membaca data publik.
 */
export function createServerClient() {
  const rawUrl = process.env.SUPABASE_URL;
  const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

  if (!rawUrl || !supabaseSecretKey) {
    throw new Error(
      "SUPABASE_URL dan SUPABASE_SECRET_KEY belum diatur di environment variable."
    );
  }

  // Normalisasi URL jika pengguna menyalin URL REST (/rest/v1/) atau ada trailing slash
  const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, "").replace(/\/$/, "");

  return createClient(supabaseUrl, supabaseSecretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export { createServerClient as createClient };

