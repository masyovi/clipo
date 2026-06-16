"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession, signIn, signOut } from "next-auth/react";
import {
  Link2,
  Copy,
  Check,
  Trash2,
  ExternalLink,
  MousePointerClick,
  Sparkles,
  Globe,
  Zap,
  ArrowRight,
  Clock,
  ChevronDown,
  Mail,
  Lock,
  User,
  LogOut,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

// ─── Types ───────────────────────────────────────────────────────
interface ShortLink {
  id: string;
  originalUrl: string;
  shortCode: string;
  shortUrl: string;
  title: string | null;
  clicks: number;
  createdAt: string;
}

type AuthView = "login" | "register";

// ─── Auth Form Component ────────────────────────────────────────
function AuthForm() {
  const [view, setView] = useState<AuthView>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();

  const switchView = (v: AuthView) => {
    setView(v);
    setError("");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Email dan password wajib diisi");
      return;
    }
    setIsLoading(true);
    setError("");

    const res = await signIn("credentials", {
      email: email.trim(),
      password,
      redirect: false,
    });

    if (res?.error) {
      setError("Email atau password salah");
    }
    setIsLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Semua field wajib diisi");
      return;
    }
    if (password.length < 6) {
      setError("Password minimal 6 karakter");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Gagal mendaftar");
        return;
      }

      toast({
        title: "Registrasi berhasil!",
        description: "Silakan login dengan akun kamu.",
      });

      // Auto-login after register
      const loginRes = await signIn("credentials", {
        email: email.trim(),
        password,
        redirect: false,
      });

      if (loginRes?.error) {
        setError("Registrasi berhasil, tapi gagal auto-login. Silakan login manual.");
        setView("login");
      }
    } catch {
      setError("Gagal terhubung ke server");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    signIn("google", { callbackUrl: "/" });
  };

  const isLogin = view === "login";

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-teal-500 flex items-center justify-center">
              <Link2 className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">
              Pendek<span className="text-violet-600">.in</span>
            </span>
          </div>
          <div className="text-sm text-muted-foreground">
            {isLogin ? "Belum punya akun?" : "Sudah punya akun?"}
            <button
              onClick={() => switchView(isLogin ? "register" : "login")}
              className="ml-1 font-semibold text-violet-600 hover:text-violet-700 transition-colors"
            >
              {isLogin ? "Daftar" : "Login"}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          {/* Title */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-teal-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-violet-500/20">
              <Link2 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {isLogin ? "Selamat Datang" : "Buat Akun Baru"}
            </h1>
            <p className="text-slate-500 text-sm mt-2">
              {isLogin
                ? "Login untuk mulai memendekkan URL"
                : "Daftar gratis dan mulai gunakan Pendek.in"}
            </p>
          </div>

          <Card className="shadow-xl shadow-slate-200/50 border-slate-200/80">
            <CardContent className="p-6 sm:p-8">
              {/* Google Login */}
              <Button
                variant="outline"
                className="w-full h-11 text-sm font-medium border-slate-200 hover:bg-slate-50 mb-4"
                onClick={handleGoogleLogin}
                disabled={isLoading}
              >
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Lanjutkan dengan Google
              </Button>

              {/* Divider */}
              <div className="relative my-5">
                <Separator />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-slate-400">
                  atau dengan email
                </span>
              </div>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                      {error}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Form */}
              <form onSubmit={isLogin ? handleLogin : handleRegister} className="space-y-4">
                {!isLogin && (
                  <div className="space-y-1.5">
                    <Label htmlFor="name" className="text-sm font-medium text-slate-700">
                      Nama Lengkap
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        id="name"
                        type="text"
                        placeholder="Masukkan nama kamu"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="pl-10 h-11 bg-slate-50 border-slate-200 focus:bg-white"
                        disabled={isLoading}
                        autoComplete="name"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="contoh@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-11 bg-slate-50 border-slate-200 focus:bg-white"
                      disabled={isLoading}
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-sm font-medium text-slate-700">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder={isLogin ? "Masukkan password" : "Minimal 6 karakter"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 h-11 bg-slate-50 border-slate-200 focus:bg-white"
                      disabled={isLoading}
                      autoComplete={isLogin ? "current-password" : "new-password"}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-700 hover:to-violet-600 text-white font-semibold shadow-lg shadow-violet-500/25 transition-all"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : isLogin ? (
                    "Login"
                  ) : (
                    "Daftar"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <p className="text-center text-xs text-slate-400 mt-6">
            Dengan melanjutkan, kamu menyetujui{" "}
            <span className="text-violet-600 cursor-pointer hover:underline">Ketentuan Layanan</span>
            {" "}dan{" "}
            <span className="text-violet-600 cursor-pointer hover:underline">Kebijakan Privasi</span>
          </p>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white mt-auto">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
            <div className="w-4 h-4 rounded bg-gradient-to-br from-violet-600 to-teal-500 flex items-center justify-center">
              <Link2 className="w-2 h-2 text-white" />
            </div>
            <span>&copy; {new Date().getFullYear()} Pendek.in &mdash; Pemendek URL Cepat & Gratis</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ─── Dashboard Component (URL Shortener) ────────────────────────
function Dashboard() {
  const { data: session } = useSession();
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [isShortening, setIsShortening] = useState(false);
  const [result, setResult] = useState<ShortLink | null>(null);
  const [links, setLinks] = useState<ShortLink[]>([]);
  const [isLoadingLinks, setIsLoadingLinks] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ShortLink | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const { toast } = useToast();

  const fetchLinks = useCallback(async () => {
    try {
      const res = await fetch("/api/links");
      if (res.ok) {
        const data = await res.json();
        setLinks(data);
      }
    } catch {
      // Silently fail
    } finally {
      setIsLoadingLinks(false);
    }
  }, []);

  useEffect(() => {
    if (session) fetchLinks();
  }, [session, fetchLinks]);

  const handleShorten = async () => {
    if (!url.trim()) {
      toast({
        title: "URL diperlukan",
        description: "Masukkan URL yang ingin dipendekkan.",
        variant: "destructive",
      });
      return;
    }

    setIsShortening(true);
    setResult(null);

    try {
      const res = await fetch("/api/shorten", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim(), title: title.trim() || undefined }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast({
          title: "Gagal memendekkan",
          description: data.error || "Terjadi kesalahan.",
          variant: "destructive",
        });
        return;
      }

      setResult(data);
      setUrl("");
      setTitle("");
      fetchLinks();

      toast({
        title: "Berhasil!",
        description: "URL berhasil dipendekkan.",
      });
    } catch {
      toast({
        title: "Error",
        description: "Gagal terhubung ke server.",
        variant: "destructive",
      });
    } finally {
      setIsShortening(false);
    }
  };

  const handleCopy = async (shortUrl: string, id: string) => {
    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopiedId(id);
      toast({
        title: "Disalin!",
        description: "URL pendek berhasil disalin ke clipboard.",
      });
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast({
        title: "Gagal menyalin",
        description: "Browser tidak mendukung clipboard.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/links?id=${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setLinks((prev) => prev.filter((l) => l.id !== deleteTarget.id));
        toast({
          title: "Dihapus",
          description: "Link berhasil dihapus.",
        });
      } else {
        const data = await res.json();
        toast({
          title: "Gagal menghapus",
          description: data.error,
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Gagal menghapus",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleShorten();
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const totalClicks = links.reduce((sum, l) => sum + l.clicks, 0);
  const displayedLinks = showAll ? links : links.slice(0, 5);

  const userInitial = session?.user?.name?.[0]?.toUpperCase() || session?.user?.email?.[0]?.toUpperCase() || "U";

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-teal-500 flex items-center justify-center">
              <Link2 className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">
              Pendek<span className="text-violet-600">.in</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-teal-400 flex items-center justify-center text-white text-xs font-bold">
                {userInitial}
              </div>
              <span className="hidden sm:inline max-w-32 truncate text-slate-700 font-medium">
                {session?.user?.name || session?.user?.email}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-red-500 h-8"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline ml-1.5">Keluar</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-100/60 via-teal-50/40 to-transparent" />
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 pt-8 pb-8 sm:pt-12 sm:pb-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <Badge variant="secondary" className="mb-4 px-3 py-1 text-xs font-medium border-violet-200 bg-violet-50 text-violet-700">
                <Sparkles className="w-3 h-3 mr-1" />
                Cepat, Gratis, dan Mudah
              </Badge>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 mb-3">
                Pemendek URL{" "}
                <span className="bg-gradient-to-r from-violet-600 to-teal-500 bg-clip-text text-transparent">
                  Terpercaya
                </span>
              </h1>
              <p className="text-slate-500 text-sm sm:text-base max-w-lg mx-auto mb-6">
                Halo, <span className="font-semibold text-slate-700">{session?.user?.name || "User"}</span>! Ubah URL panjang jadi pendek dalam sekejap.
              </p>
            </motion.div>

            {/* URL Input Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="shadow-xl shadow-slate-200/50 border-slate-200/80">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="relative flex-1">
                        <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          type="url"
                          placeholder="Tempel URL panjang di sini... (cth: https://example.com/very/long/url)"
                          value={url}
                          onChange={(e) => setUrl(e.target.value)}
                          onKeyDown={handleKeyDown}
                          className="pl-10 h-12 text-sm bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                          disabled={isShortening}
                        />
                      </div>
                      <Button
                        onClick={handleShorten}
                        disabled={isShortening || !url.trim()}
                        className="h-12 px-6 bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-700 hover:to-violet-600 text-white font-semibold shadow-lg shadow-violet-500/25 transition-all"
                      >
                        {isShortening ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                          >
                            <Zap className="w-4 h-4" />
                          </motion.div>
                        ) : (
                          <>
                            Pendekkan
                            <ArrowRight className="w-4 h-4 ml-1" />
                          </>
                        )}
                      </Button>
                    </div>
                    <div className="relative">
                      <Input
                        type="text"
                        placeholder="Label opsional (cth: Link promo akhir tahun)"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="h-9 text-sm bg-slate-50/50 border-slate-200/60 focus:bg-white transition-colors"
                        disabled={isShortening}
                      />
                    </div>
                  </div>

                  {/* Result */}
                  <AnimatePresence>
                    {result && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, y: -10 }}
                        animate={{ opacity: 1, height: "auto", y: 0 }}
                        exit={{ opacity: 0, height: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-violet-50 to-teal-50 border border-violet-200/60">
                          <p className="text-xs font-medium text-violet-600 mb-2">URL pendek kamu:</p>
                          <div className="flex items-center gap-2">
                            <code className="flex-1 text-sm sm:text-base font-semibold text-slate-800 bg-white px-3 py-2 rounded-lg border border-slate-200 truncate">
                              {result.shortUrl}
                            </code>
                            <Button
                              size="sm"
                              variant="outline"
                              className="shrink-0 border-violet-200 hover:bg-violet-50 hover:text-violet-700 h-9"
                              onClick={() => handleCopy(result.shortUrl, result.id)}
                            >
                              {copiedId === result.id ? (
                                <Check className="w-4 h-4 text-green-600" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                          <p className="text-xs text-slate-400 mt-2 truncate">
                            Dari: {result.originalUrl}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>

            {/* Features */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="grid grid-cols-3 gap-3 sm:gap-4 mt-6"
            >
              {[
                { icon: Zap, label: "Instan", desc: "Dalam sekejap" },
                { icon: Globe, label: "Gratis", desc: "Tanpa batas" },
                { icon: MousePointerClick, label: "Tracking", desc: "Hitungan klik" },
              ].map(({ icon: Icon, label, desc }) => (
                <div key={label} className="text-center p-3 sm:p-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-100 to-teal-100 flex items-center justify-center mx-auto mb-2">
                    <Icon className="w-5 h-5 text-violet-600" />
                  </div>
                  <p className="text-sm font-semibold text-slate-800">{label}</p>
                  <p className="text-xs text-slate-400">{desc}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Links Table */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 pb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Link Kamu</h2>
                <p className="text-xs text-slate-400">
                  {links.length} link &middot; {totalClicks} total klik
                </p>
              </div>
            </div>

            {isLoadingLinks ? (
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-3 animate-pulse">
                        <div className="h-4 w-4 rounded bg-slate-200" />
                        <div className="flex-1 h-4 rounded bg-slate-200" />
                        <div className="h-4 w-16 rounded bg-slate-200" />
                        <div className="h-4 w-16 rounded bg-slate-200" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : links.length === 0 ? (
              <Card className="border-dashed border-slate-300">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
                    <Link2 className="w-8 h-8 text-slate-300" />
                  </div>
                  <p className="text-slate-500 font-medium">Belum ada link</p>
                  <p className="text-sm text-slate-400 mt-1">
                    Mulai pendekkan URL pertamamu di atas!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {displayedLinks.map((link, idx) => (
                  <motion.div
                    key={link.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Card className="hover:shadow-md transition-shadow border-slate-200/80 group">
                      <CardContent className="p-3 sm:p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <code className="text-sm font-semibold text-violet-600 truncate">
                                alamatweb.my.id/{link.shortCode}
                              </code>
                              {link.title && (
                                <Badge variant="secondary" className="shrink-0 text-[10px] px-1.5 py-0 bg-slate-100 text-slate-500 hidden sm:inline-flex">
                                  {link.title}
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-slate-400 truncate mt-0.5" title={link.originalUrl}>
                              {link.originalUrl}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                            <div className="flex items-center gap-1 text-xs text-slate-400">
                              <MousePointerClick className="w-3 h-3" />
                              <span>{link.clicks}</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-slate-400">
                              <Clock className="w-3 h-3" />
                              <span className="hidden sm:inline">{formatDate(link.createdAt)}</span>
                              <span className="sm:hidden">
                                {new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short" }).format(
                                  new Date(link.createdAt)
                                )}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 hover:bg-violet-50 hover:text-violet-600"
                                onClick={() => handleCopy(link.shortUrl, link.id)}
                                title="Salin URL pendek"
                              >
                                {copiedId === link.id ? (
                                  <Check className="w-3.5 h-3.5 text-green-600" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 hover:bg-slate-100 text-slate-400"
                                asChild
                              >
                                <a href={link.originalUrl} target="_blank" rel="noopener noreferrer" title="Buka URL asli">
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-500 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => setDeleteTarget(link)}
                                title="Hapus link"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}

                {links.length > 5 && (
                  <Button
                    variant="ghost"
                    className="w-full text-sm text-slate-400 hover:text-violet-600"
                    onClick={() => setShowAll(!showAll)}
                  >
                    {showAll ? (
                      <>Tampilkan Sedikit <ChevronDown className="w-4 h-4 ml-1 rotate-180" /></>
                    ) : (
                      <>Tampilkan Semua ({links.length}) <ChevronDown className="w-4 h-4 ml-1" /></>
                    )}
                  </Button>
                )}
              </div>
            )}
          </motion.div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white mt-auto">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-gradient-to-br from-violet-600 to-teal-500 flex items-center justify-center">
                <Link2 className="w-2.5 h-2.5 text-white" />
              </div>
              <span className="font-semibold text-slate-500">
                Pendek<span className="text-violet-600">.in</span>
              </span>
            </div>
            <p>&copy; {new Date().getFullYear()} Pendek.in &mdash; Pemendek URL Cepat & Gratis</p>
          </div>
        </div>
      </footer>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus link ini?</AlertDialogTitle>
            <AlertDialogDescription>
              Link <code className="font-semibold text-violet-600">alamatweb.my.id/{deleteTarget?.shortCode}</code> akan dihapus secara permanen. Tindakan ini tidak bisa dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {isDeleting ? "Menghapus..." : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────
export default function Home() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 to-teal-500 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Link2 className="w-6 h-6 text-white" />
          </div>
          <p className="text-sm text-slate-400">Memuat...</p>
        </motion.div>
      </div>
    );
  }

  if (!session) {
    return <AuthForm />;
  }

  return <Dashboard />;
}