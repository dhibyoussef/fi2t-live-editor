const CHANNEL = 'gc-content-sync'
const STORAGE_KEY = 'gc-content-sync'

export type ContentSyncSource = 'website' | 'dashboard'

export interface ContentSyncMessage {
  type: 'content-updated'
  page: string
  source: ContentSyncSource
  at: number
}

/** Notify other tabs (dashboard ↔ website) that content was saved. */
export function notifyContentSaved(page: string, source: ContentSyncSource) {
  const msg: ContentSyncMessage = { type: 'content-updated', page, source, at: Date.now() }
  try {
    const ch = new BroadcastChannel(CHANNEL)
    ch.postMessage(msg)
    ch.close()
  } catch {
    /* BroadcastChannel unavailable */
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(msg))
}

/** Subscribe to content updates from the other app/tab. */
export function onContentUpdated(
  handler: (msg: ContentSyncMessage) => void,
): () => void {
  let channel: BroadcastChannel | null = null
  try {
    channel = new BroadcastChannel(CHANNEL)
    channel.onmessage = (e: MessageEvent<ContentSyncMessage>) => {
      if (e.data?.type === 'content-updated') handler(e.data)
    }
  } catch {
    /* fallback: storage only */
  }

  const onStorage = (e: StorageEvent) => {
    if (e.key !== STORAGE_KEY || !e.newValue) return
    try {
      const msg = JSON.parse(e.newValue) as ContentSyncMessage
      if (msg.type === 'content-updated') handler(msg)
    } catch {
      /* ignore */
    }
  }
  window.addEventListener('storage', onStorage)

  return () => {
    channel?.close()
    window.removeEventListener('storage', onStorage)
  }
}
