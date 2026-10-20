"use server";

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
