import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Layout, PageTitle } from "@/components/site/Layout";
import { cloud } from "@/lib/cloud";
export const Route = createFileRoute("/redefinir-senha")({ component: Reset });
function Reset() {
  const [password, setPassword] = useState("");
  const [feedback, setFeedback] = useState("");
  const [busy,setBusy] = useState(false);
  async function submit(e: FormEvent) {
    e.preventDefault(); if (!cloud) return;
    setBusy(true);
    const { error } = await cloud.auth.updateUser({ password });
    setFeedback(error ? error.message : "Senha alterada. Você já pode acessar sua conta.");
    setBusy(false);
  }
  return <Layout><PageTitle title="Nova senha" eyebrow="Segurança da conta" />
    <form onSubmit={submit} className="mx-auto max-w-sm space-y-4 px-5">
      <label className="block text-sm">Digite a nova senha<input type="password" minLength={8} autoComplete="new-password" required className="field mt-2" value={password} onChange={e=>setPassword(e.target.value)} /></label>
      <button disabled={!cloud || busy} className="btn btn-primary w-full">Salvar nova senha</button>
      {feedback && <p role="status">{feedback} <Link to="/entrar" className="underline">Entrar</Link></p>}
    </form></Layout>;
}
