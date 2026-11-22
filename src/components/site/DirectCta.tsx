import { useState } from "react";
import { Instagram, Copy, Check } from "lucide-react";
import { useStore } from "@/lib/store";

// CTA de Instagram Direct. Nunca encaminha para WhatsApp. URL configurável no admin.
export function DirectCta({ message, label = "Finalizar atendimento pelo Direct" }: { message?: string; label?: string }) {
  const url = useStore((s) => s.settings.instagramUrl);
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    if (!message) return;
    await navigator.clipboard.writeText(message);
    setCopied(true); setTimeout(() => setCopied(false), 2500);
  };
  return (
    <div className="flex flex-col gap-3">
      {message && (
        <button type="button" onClick={copy} className="btn btn-outline">
          {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? "Pedido copiado" : "Copiar pedido para enviar pelo Direct"}
        </button>
      )}
      {url ? (
        <a href={url} target="_blank" rel="noopener noreferrer" className="btn btn-primary"><Instagram size={14} /> {label}</a>
      ) : (
        <p className="rounded-xl bg-secondary p-4 text-sm text-muted-foreground">
          Abra o perfil da <strong className="text-foreground">BelaMira</strong> no Instagram e envie {message ? "o pedido copiado" : "sua mensagem"} pelo Direct.
        </p>
      )}
    </div>
  );
}