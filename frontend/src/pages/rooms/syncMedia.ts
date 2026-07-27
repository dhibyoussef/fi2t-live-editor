import api from '../../api/client'
import type { RoomImage } from './RoomImagesEditor'

export async function syncMedia(
  mediableType: string,
  mediableId: number,
  images: RoomImage[],
  removedIds: number[],
) {
  for (const id of removedIds) {
    await api.delete(`/admin/media/${id}`)
  }
  for (let i = 0; i < images.length; i++) {
    const img = images[i]
    if (img.id) {
      await api.put(`/admin/media/${img.id}`, {
        alt_text: img.alt_text ?? '',
        is_cover: !!img.is_cover,
        sort_order: i,
      })
    } else if (img.url) {
      await api.post('/admin/media', {
        mediable_type: mediableType,
        mediable_id: mediableId,
        url: img.url,
        alt_text: img.alt_text ?? '',
        type: 'IMAGE',
        sort_order: i,
        is_cover: !!img.is_cover,
      })
    }
  }
}
