import api from '../api/client'

export async function autoTranslate(text: string, from: string, to: string): Promise<string> {
  const value = text.trim()
  if (!value || from === to) return text
  try {
    const { data } = await api.post('/admin/translate', { text, from, to }, { timeout: 30000 })
    return typeof data?.text === 'string' && data.text.trim() ? data.text : text
  } catch {
    return text
  }
}

export async function autoTranslateMany(texts: string[], from: string, to: string): Promise<string[]> {
  if (!texts.length) return []
  try {
    const { data } = await api.post('/admin/translate', {
      text: texts[0] ?? '',
      texts,
      from,
      to,
    }, { timeout: 60000 })
    return Array.isArray(data?.texts) ? data.texts : texts
  } catch {
    return texts
  }
}
