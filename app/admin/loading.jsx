import NavAdmin from "@/components/NavAdmin";

export default function LoadingAdmin() {
  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold">Produk</h1>
        <div className="h-10 w-32 animate-pulse rounded-lg bg-permukaan" />
      </div>
      <div className="rounded-2xl border border-garis bg-latar p-8 text-center text-teks-lembut">
        <p className="animate-pulse">Memuat daftar produk...</p>
      </div>
    </div>
  );
}

