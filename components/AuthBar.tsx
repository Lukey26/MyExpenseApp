'use client';

import { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth';

export default function AuthBar() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [signingIn, setSigningIn] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  const signIn = async () => {
    if (signingIn) return;
    setMsg(null);
    setSigningIn(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      // success: user state will update via onAuthStateChanged
    } catch (e: any) {
      // Handle common benign errors quietly
      if (e?.code === 'auth/cancelled-popup-request') {
        // Another sign-in started before this finished — safe to ignore.
        setMsg('Sign-in was interrupted. Please try again.');
      } else if (e?.code === 'auth/popup-closed-by-user') {
        setMsg('Sign-in popup was closed before completing.');
      } else if (e?.code === 'auth/popup-blocked') {
        setMsg('Popup was blocked. Allow popups for localhost and try again.');
      } else {
        // Show a generic message for unexpected errors
        setMsg(e?.message ?? 'Sign-in failed. Please try again.');
        console.error(e);
      }
    } finally {
      setSigningIn(false);
    }
  };

  const signOutUser = async () => {
    setMsg(null);
    try {
      await signOut(auth);
    } catch (e: any) {
      setMsg('Sign-out failed. Please try again.');
      console.error(e);
    }
  };

  if (loading) return <div className="text-sm text-gray-600">Checking auth…</div>;

  return (
    <div className="flex items-center gap-3">
      {user ? (
        <>
          <span className="text-sm">
            Signed in as <b>{user.displayName ?? user.email}</b>
          </span>
          <button
            onClick={signOutUser}
            className="px-3 py-1 rounded bg-gray-800 text-white text-sm"
          >
            Sign out
          </button>
        </>
      ) : (
        <button
          onClick={signIn}
          disabled={signingIn}
          className={`px-3 py-1 rounded text-sm text-white ${
            signingIn ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {signingIn ? 'Signing in…' : 'Sign in with Google'}
        </button>
      )}
      {msg && <span className="text-xs text-gray-700">{msg}</span>}
    </div>
  );
}