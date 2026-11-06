export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const messages = Array.isArray(body.messages) ? body.messages : [];
  const latest = messages[messages.length - 1];
  const prompt = Array.isArray(latest?.parts)
    ? latest.parts.filter((part: { type?: string }) => part.type === "text").map((part: { text?: string }) => part.text ?? "").join(" ")
    : "";
  const focus = prompt.toLowerCase().includes("kuis")
    ? "Agen pembuat kuis menyiapkan latihan dari konsep utama."
    : "Agen analisis menyusun konsep utama dan bagian yang perlu ditinjau.";
  const response = "Rencana simulasi: Agen Riset membaca materi yang dipilih. " + focus + " Agen Tinjauan Kualitas memeriksa hasil sebelum Anda menggunakannya. Ini keluaran contoh; model AI eksternal belum dihubungkan.";
  return new Response(response, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
    },
  });
}
