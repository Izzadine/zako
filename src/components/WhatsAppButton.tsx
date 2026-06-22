import { whatsappLink } from "@/lib/utils";

export function WhatsAppButton({ phone, title, id }: { phone: string; title: string; id: string }) {
  return (
    <a
      href={whatsappLink(phone, title, id)}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-zako-wa text-white text-lg font-bold active:scale-[0.98] transition"
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.945C.16 5.335 5.495 0 12.05 0a11.82 11.82 0 018.413 3.488 11.82 11.82 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.51 5.26l-.999 3.648 3.477-1.607z" />
      </svg>
      Contacter sur WhatsApp
    </a>
  );
}
