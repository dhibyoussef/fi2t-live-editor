import { publicUrl } from './publicUrl'

/** CSS background images that cannot go through React `publicUrl()`. */
const CSS_IMAGE_VARS: Array<[string, string]> = [
  ['--fi2t-img-org-stat-card', '/images/org-stat-card.png'],
  ['--fi2t-img-golf-etat-wm', '/images/groupement-media/golf-etat-wm.png?v=1'],
]

export function applyPublicCssVars() {
  const root = document.documentElement
  for (const [name, path] of CSS_IMAGE_VARS) {
    root.style.setProperty(name, `url("${publicUrl(path)}")`)
  }
}
