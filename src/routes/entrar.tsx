import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Layout, PageTitle } from "@/components/site/Layout";
import { cloud } from "@/lib/cloud";
import { useAuthUser } from "@/lib/useAuthUser";

export const Route = createFileRoute("/entrar")({ component: Login });

function Login() {
  const { user } = useAuthUser();
  const [mode, setMode] = useState<"entrar" | "criar" | "recuperar">("entrar");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!cloud) return;
    setBusy(true); setMessage("");
    try {
      if (mode === "recuperar") {
        const { error } = await cloud.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin + "/redefinir-senha",
        });
        if (error) throw error;
        setMessage("Se o e-mail estiver cadastrado, enviaremos instruções para redefinir a senha.");
      } else if (mode === "criar") {
        const { error } = await cloud.auth.signUp({
          email, password, options: { data: { full_name: name } },
        });
        if (error) throw error;
        setMessage("Cadastro solicitado. Confirme o e-mail para acessar sua conta.");
      } else {
        const { error } = await cloud.auth.signInWithPassword({ email, password });
        if (error) throw error;
        window.location.assign("/minha-conta");
      }
    } catch (err) { setMessage(err instanceof Error ? err.message : "Não foi possível concluir."); }
    finally { setBusy(false); }
  }
  return <Layout>
    <PageTitle eyebrow="Área da cliente" title={mode === "criar" ? "Criar minha conta" : mode === "recuperar" ? "Recuperar senha" : "Entrar na BelaMira"} />
    <div className="mx-auto max-w-md px-5">
      {!cloud && <p role="alert" className="rounded-xl bg-secondary p-4 text-sm">O cadastro estará disponível após a configuração segura do banco de dados no Lovable. Nenhuma senha é armazenada neste site enquanto não estiver configurado.</p>}
      {user && <p className="mb-4">Você já está conectada. <Link className="underline" to="/minha-conta">Abrir minha conta</Link>.</p>}
      <form onSubmit={submit} className="space-y-5">
        {mode === "criar" && <label className="block text-sm">Nome completo<input className="field mt-1" required minLength={2} maxLength={100} autoComplete="name" value={name} onChange={e => setName(e.target.value)} /></label>}
        <label className="block text-sm">E-mail<input className="field mt-1" required type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} /></label>
        {mode !== "recuperar" && <label className="block text-sm">Senha<input className="field mt-1" required minLength={8} type="password" autoComplete={mode === "criar" ? "new-password" : "current-password"} value={password} onChange={e => setPassword(e.target.value)} /></label>}
        <button disabled={!cloud || busy} className="btn btn-primary w-full" type="submit">{busy ? "Aguarde..." : mode === "criar" ? "Criar conta" : mode === "recuperar" ? "Enviar instruções" : "Entrar"}</button>
      </form>
      {message && <p role="status" className="mt-3 rounded-lg bg-secondary p-3 text-sm">{message}</p>}
      <div className="mt-8 flex flex-wrap justify-center gap-5 text-sm">
        <button type="button" className="underline" onClick={() => { setMode(mode === "criar" ? "entrar" : "criar"); setMessage(""); }}>{mode === "criar" ? "Já tenho conta" : "Criar cadastro"}</button>
        <button type="button" className="underline" onClick={() => { setMode("recuperar"); setMessage(""); }}>Esqueci minha senha</button>
      </div>
    </div>
  </Layout>;
}
