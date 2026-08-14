import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './i18n'
import './styles/fi2t.css'
import './cms/edit-mode.css'
import './styles/cms-builder-embed.css'
import { applyPublicCssVars } from './lib/applyPublicCssVars'

applyPublicCssVars()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
