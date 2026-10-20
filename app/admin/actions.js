"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSessionClient } from "@/lib/supabase/session";

export async function login(prevState, formData) {
  const data =
    formData instanceof FormData
      ? formData
      : prevState instanceof FormData
      ? prevState
      : null;

  const email = data ? data.get("email") : null;
  const password = data ? data.get("password") : null;

  if (!email || !password) {
    return { error: "Email dan password wajib diisi." };
  }

  const supabase = await createSessionClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: String(email).trim(),
    password: String(password),
  });

  if (error) {
    if (error.message.toLowerCase().includes("invalid login credentials")) {
      return { error: "Email atau password salah." };
    }
    return { error: error.message };
  }

  redirect("/admin");
}

export async function keluar() {
  const supabase = await createSessionClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export async function loginAdmin(prevState, formData) {
  return login(prevState, formData);
}

export async function keluarAdmin() {
  return keluar();
}

/**
 * Memastikan pengguna sudah login di server sebelum menjalankan aksi mutasi.
 * Memenuhi AGENTS.md aturan keamanan #3 dan kriteria US-06.
 */
export async function requireAuth() {
  const supabase = await createSessionClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("Aksi ditolak: Anda harus login sebagai admin.");
  }

  return { supabase, user };
}

export async function gantiPassword(prevState, formData) {
  const data =
    formData instanceof FormData
      ? formData
      : prevState instanceof FormData
      ? prevState
      : null;

  const passwordBaru = data ? data.get("password_baru") : null;
  const konfirmasiPassword = data ? data.get("konfirmasi_password") : null;

  if (!passwordBaru || !konfirmasiPassword) {
    return { error: "Semua kolom password wajib diisi." };
  }

  const strPassword = String(passwordBaru);
  const strKonfirmasi = String(konfirmasiPassword);

  if (strPassword.length < 8) {
    return { error: "Password baru minimal 8 karakter." };
  }

  if (strPassword !== strKonfirmasi) {
    return { error: "Password baru dan konfirmasi password tidak sama." };
  }

  // Wajib periksa login di server sebelum mengubah data
  const supabase = await createSessionClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      error: "Kamu belum login atau sesi telah berakhir. Silakan login kembali.",
    };
  }

  const { error } = await supabase.auth.updateUser({
    password: strPassword,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true, message: "Password berhasil diganti." };
}

export async function ubahPassword(prevState, formData) {
  return gantiPassword(prevState, formData);
}

/**
 * Menambahkan produk baru ke tabel "produk" di Supabase (US-08).
 * Terlindungi autentikasi di server.
 */
export async function tambahProduk(prevState, formData) {
  const data =
    formData instanceof FormData
      ? formData
      : prevState instanceof FormData
      ? prevState
      : null;

  const nama = data ? data.get("nama") : null;
  const hargaRaw = data ? data.get("harga") : null;
  const kategori = data ? data.get("kategori") : null;
  const fotoUrl = data ? data.get("foto_url") : null;
  const deskripsi = data ? data.get("deskripsi") : null;

  // Validasi input
  if (!nama || !String(nama).trim()) {
    return { error: "Nama produk wajib diisi." };
  }

  if (hargaRaw === null || hargaRaw === "" || isNaN(Number(hargaRaw))) {
    return { error: "Harga harus berupa angka yang valid." };
  }

  const harga = Number(hargaRaw);
  if (harga < 0) {
    return { error: "Harga tidak boleh negatif." };
  }

  // Wajib periksa login di server sebelum mengubah data (AGENTS.md #3, US-08)
  const supabase = await createSessionClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      error: "Aksi ditolak: Anda harus login sebagai admin.",
    };
  }

  const insertData = {
    nama: String(nama).trim(),
    harga: Math.round(harga),
    kategori:
      kategori && String(kategori).trim() !== ""
        ? String(kategori).trim()
        : null,
    foto_url:
      fotoUrl && String(fotoUrl).trim() !== "" ? String(fotoUrl).trim() : null,
    deskripsi:
      deskripsi && String(deskripsi).trim() !== ""
        ? String(deskripsi).trim()
        : null,
  };

  const { error: insertError } = await supabase
    .from("produk")
    .insert(insertData);

  if (insertError) {
    return { error: `Gagal menyimpan produk: ${insertError.message}` };
  }

  revalidatePath("/admin");
  revalidatePath("/");
  redirect("/admin");
}

export async function simpanProduk(prevState, formData) {
  return tambahProduk(prevState, formData);
}

/**
 * Menambahkan produk baru ke tabel "produk" di Supabase (US-08).
 * Terlindungi autentikasi di server.
 */
export async function tambahProduk(prevState, formData) {
  const data =
    formData instanceof FormData
      ? formData
      : prevState instanceof FormData
      ? prevState
      : null;

  const nama = data ? data.get("nama") : null;
  const hargaRaw = data ? data.get("harga") : null;
  const kategori = data ? data.get("kategori") : null;
  const fotoUrl = data ? data.get("foto_url") : null;
  const deskripsi = data ? data.get("deskripsi") : null;

  // Validasi input
  if (!nama || !String(nama).trim()) {
    return { error: "Nama produk wajib diisi." };
  }

  if (hargaRaw === null || hargaRaw === "" || isNaN(Number(hargaRaw))) {
    return { error: "Harga harus berupa angka yang valid." };
  }

  const harga = Number(hargaRaw);
  if (harga < 0) {
    return { error: "Harga tidak boleh negatif." };
  }

  // Wajib periksa login di server sebelum mengubah data (AGENTS.md #3, US-08)
  const supabase = await createSessionClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      error: "Aksi ditolak: Anda harus login sebagai admin.",
    };
  }

  const insertData = {
    nama: String(nama).trim(),
    harga: Math.round(harga),
    kategori:
      kategori && String(kategori).trim() !== ""
        ? String(kategori).trim()
        : null,
    foto_url:
      fotoUrl && String(fotoUrl).trim() !== "" ? String(fotoUrl).trim() : null,
    deskripsi:
      deskripsi && String(deskripsi).trim() !== ""
        ? String(deskripsi).trim()
        : null,
  };

  const { error: insertError } = await supabase
    .from("produk")
    .insert(insertData);

  if (insertError) {
    return { error: `Gagal menyimpan produk: ${insertError.message}` };
  }

  revalidatePath("/admin");
  revalidatePath("/");
  redirect("/admin");
}

export async function simpanProduk(prevState, formData) {
  return tambahProduk(prevState, formData);
}

