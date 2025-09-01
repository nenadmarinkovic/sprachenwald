'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Chrome } from 'lucide-react';
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { auth } from '@/lib/firebase';

function getAuthErrorMessage(e: unknown) {
  if (e instanceof FirebaseError) return e.message;
  if (e instanceof Error) return e.message;
  return 'Došlo je do nepoznate greške. Pokušajte ponovo.';
}

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleEmailLogin = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/dashboard');
    } catch (e: unknown) {
      setError(getAuthErrorMessage(e));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push('/dashboard');
    } catch (e: unknown) {
      setError(getAuthErrorMessage(e));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl ">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800">
            Prijava
          </h1>
          <p className="mt-2 text-gray-600">
            Dobrodošli nazad! Unesite svoje podatke.
          </p>
        </div>

        {error && (
          <p className="text-red-500 text-sm text-center">{error}</p>
        )}

        <form className="space-y-6" onSubmit={handleEmailLogin}>
          <div className="relative">
            <Mail className="absolute w-5 h-5 text-gray-400 left-3 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              placeholder="Email adresa"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
              required
              autoComplete="email"
            />
          </div>
          <div className="relative">
            <Lock className="absolute w-5 h-5 text-gray-400 left-3 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              placeholder="Lozinka"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
              required
              autoComplete="current-password"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 text-white bg-green-600 rounded-lg font-semibold hover:bg-green-700 transition-colors duration-300 disabled:bg-green-400"
          >
            {isLoading ? 'Prijavljivanje...' : 'Prijavi se'}
          </button>
        </form>

        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative px-2 bg-white text-sm text-gray-500">
            Ili nastavite sa
          </div>
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full py-3 flex items-center justify-center gap-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors duration-300 disabled:opacity-50"
        >
          <Chrome className="w-5 h-5" />
          <span className="font-semibold text-gray-700">Google</span>
        </button>

        <p className="text-sm text-center text-gray-600">
          Nemate nalog?{' '}
          <a
            href="/signup"
            className="font-medium text-green-600 hover:underline"
          >
            Registrujte se
          </a>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
