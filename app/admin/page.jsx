import NavAdmin from "@/components/NavAdmin";
import TabelProduk from "@/components/TabelProduk";
import Tombol from "@/components/Tombol";
import { createSessionClient } from "@/lib/supabase/session";
import { createServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function HalamanAdmin() {
  let daftarProduk = [];
  let errorPesan = null;

  try {
    const supabase = await createSessionClient();
    const { data, error } = await supabase
      .from("produk")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      const serverSupabase = createServerClient();
      const fallback = await serverSupabase
        .from("produk")
        .select("*")
        .order("id", { ascending: true });

      if (fallback.error) {
        errorPesan = fallback.error.message;
      } else {
        daftarProduk = fallback.data || [];
      }
    } else if (data && data.length > 0) {
      daftarProduk = data;
    } else {
      const serverSupabase = createServerClient();
      const check = await serverSupabase
        .from("produk")
        .select("*")
        .order("id", { ascending: true });

      if (!check.error && check.data && check.data.length > 0) {
        daftarProduk = check.data;
      } else {
        daftarProduk = [];
      }
    }
  } catch (err) {
    errorPesan = err.message || "Gagal mengambil data produk dari database.";
  }

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold">Produk</h1>
        {/* US-08 (bonus): tambah produk */}
        <Tombol href="/admin/produk/baru">Tambah produk</Tombol>
      </div>

      {errorPesan ? (
        <div className="rounded-xl border border-garis bg-permukaan p-4 text-bahaya">
          <p className="font-semibold">Gagal memuat produk</p>
          <p className="mt-1 text-sm text-teks-lembut">{errorPesan}</p>
        </div>
      ) : (
        <TabelProduk daftarProduk={daftarProduk} />
      )}
    </div>
  );
}
