import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { apiClient } from '../../api/client'
import { useAuthStore } from '../../store/authStore'
import toast from 'react-hot-toast'
import { adminAsset } from '../../lib/adminAsset'

export default function LoginPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const setAuth = useAuthStore(s => s.setAuth)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await apiClient.post('/auth/login', { email, password })
      setAuth(data.user, data.token)
      toast.success('Bienvenue sur FI2T')
      navigate('/dashboard')
    } catch (err: unknown) {
      const ax = err as { code?: string; response?: { status?: number; data?: { message?: string } } }
      if (ax.response?.status === 429) {
        toast.error('Trop de tentatives — réessayez dans une minute')
      } else if (ax.response?.status === 403) {
        toast.error(ax.response.data?.message || 'Accès refusé')
      } else if (ax.code === 'ECONNABORTED' || ax.code === 'ERR_NETWORK') {
        toast.error('Serveur indisponible — vérifiez que MySQL (XAMPP) et l’API (:8000) sont démarrés')
      } else {
        toast.error(t('login.invalid_credentials') || t('login.error') || 'Identifiants incorrects')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-shell fi2t-login">
      <div className="login-brand">
        <div className="login-brand-orb login-brand-orb-top" />
        <div className="login-brand-orb login-brand-orb-bottom" />

        <div className="login-brand-logo animate-fade-in">
          <div className="login-logo-icon">
            <img src={adminAsset('logo-white.png')} alt="FI2T" />
          </div>
          <div>
            <p className="login-logo-name">FI2T</p>
            <p className="login-logo-sub">CMS Live Editor</p>
          </div>
        </div>

        <div className="login-brand-hero animate-fade-in" style={{ animationDelay: '80ms' }}>
          <div className="login-brand-pill">Fédération du Tourisme Tunisien</div>
          <h1 className="login-brand-headline">
            Unir, innover<br />
            <span className="text-gold-gradient">et valoriser</span>
          </h1>
          <p className="login-brand-desc">
            Back-office dédié au contenu du site : pages, textes, images et live editor.
          </p>
        </div>

        <p className="login-brand-copyright">
          © 2026 FI2T — Fédération Interprofessionnelle du Tourisme Tunisien
        </p>
        <div className="login-brand-separator" />
      </div>

      <div className="login-form-panel">
        <div className="login-mobile-logo">
          <div className="login-logo-icon login-logo-icon-sm">
            <img src={adminAsset('logo.png')} alt="FI2T" />
          </div>
          <span className="login-mobile-brand">FI2T</span>
        </div>

        <div className="login-form-box animate-fade-in">
          <div className="login-form-header">
            <h2 className="login-form-title">{t('login.welcome') || 'Connexion'}</h2>
            <p className="login-form-subtitle">CMS FI2T — Live Editor</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="gc-field">
              <label className="gc-label">{t('login.email') || 'Email'}</label>
              <input
                type="email"
                className="gc-input"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@fi2t.tn"
                required
                autoComplete="username"
              />
            </div>

            <div className="gc-field">
              <label className="gc-label">{t('login.password') || 'Mot de passe'}</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  className="gc-input"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="login-eye-btn"
                  onClick={() => setShowPass(v => !v)}
                  aria-label="Afficher le mot de passe"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" className="gc-btn gc-btn-primary" disabled={loading} style={{ width: '100%' }}>
              {loading ? <Loader2 className="animate-spin" size={16} /> : null}
              {t('login.submit') || 'Se connecter'}
            </button>
          </form>

          <p className="login-footer-note">
            Accès réservé aux administrateurs FI2T. Session chiffrée · jeton à durée limitée.
          </p>
        </div>
      </div>
    </div>
  )
}
