/**
 * 📝 Register Page - Create new tenant + admin user
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api/auth.service';
import { useAuthStore } from '../store/auth.store';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Shield, Building, Mail, User, Lock, AlertCircle, CheckCircle } from 'lucide-react';

export function RegisterPage() {
  const [tenantName, setTenantName] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const setUser = useAuthStore((state) => state.setUser);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authService.register({
        tenantName,
        email,
        name,
        password,
      });
      
      setUser(response.user);
      navigate('/');
    } catch (err: any) {
      setError(
        err.response?.data?.error?.message || 
        'Erreur lors de la création du compte'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 relative overflow-hidden p-4">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.05)_1px,transparent_1px)] bg-[size:50px_50px]"></div>

      {/* Register card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-slate-900/80 backdrop-blur-xl p-8 rounded-2xl border border-cyan-500/20 shadow-[0_0_50px_rgba(6,182,212,0.15)]">
          {/* Logo & Title */}
          <div className="text-center mb-8">
            <img
              src="public\AnStrikes.svg"
              alt="AntStrike CTI Logo"
              className="w-32 h-auto mx-auto mb-4"
            />
            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
              Créer votre compte
            </h1>
            <p className="text-slate-400">
              Démarrez votre essai gratuit de 90 jours
            </p>
          </div>

          {/* Trial badge */}
          <div className="mb-6 p-4 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-lg">
            <div className="flex items-center gap-2 text-cyan-300 mb-2">
              <CheckCircle className="w-5 h-5" />
              <span className="font-semibold">Période d'essai gratuite</span>
            </div>
            <ul className="text-sm text-slate-400 space-y-1 ml-7">
              <li>✓ 90 jours d'accès complet</li>
              <li>✓ Toutes les fonctionnalités</li>
              <li>✓ Aucune carte bancaire requise</li>
            </ul>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          {/* Register form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tenantName" className="text-slate-300 flex items-center gap-2">
                <Building className="w-4 h-4" />
                Nom de l'organisation
              </Label>
              <Input
                id="tenantName"
                type="text"
                placeholder="Acme Corporation"
                value={tenantName}
                onChange={(e) => setTenantName(e.target.value)}
                required
                className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-cyan-500 focus:ring-cyan-500/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-300 flex items-center gap-2">
                <User className="w-4 h-4" />
                Votre nom
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-cyan-500 focus:ring-cyan-500/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email professionnel
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@exemple.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-cyan-500 focus:ring-cyan-500/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-300 flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Mot de passe
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-cyan-500 focus:ring-cyan-500/20"
              />
              <p className="text-xs text-slate-500">Minimum 8 caractères</p>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-semibold py-6 text-lg shadow-lg shadow-cyan-500/30 transition-all hover:shadow-cyan-500/50"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Création...
                </div>
              ) : (
                'Démarrer l\'Essai Gratuit'
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-sm text-slate-500">
              Vous avez déjà un compte ?{' '}
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-cyan-400 hover:text-cyan-300 font-medium"
              >
                Se connecter
              </button>
            </p>
          </div>

          {/* Terms */}
          <div className="mt-6 text-center">
            <p className="text-xs text-slate-600">
              En créant un compte, vous acceptez nos{' '}
              <a href="#" className="text-cyan-400 hover:underline">
                Conditions d'utilisation
              </a>{' '}
              et{' '}
              <a href="#" className="text-cyan-400 hover:underline">
                Politique de confidentialité
              </a>
            </p>
          </div>
        </div>

        {/* Version badge */}
        <div className="text-center mt-6">
          <p className="text-xs text-slate-600">
            Version 1.0.0 • Sécurisé par AntStrike
          </p>
        </div>
      </div>
    </div>
  );
}

