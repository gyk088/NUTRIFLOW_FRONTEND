// Бэкенд хранит и отдаёт только filename (например
// "e5e7ddd9-050f-4da7-b765-c6f47277e60c.jpg"), а не полный URL — базовый адрес
// раздачи файлов настраивается здесь, на стороне клиента (аналогично
// NutriFlow/src/lib/api.js на мобильном приложении).
const FILES_BASE_URL = import.meta.env.VITE_FILES_BASE_URL

export function toFileUrl(filename) {
  if (!filename) return undefined
  return `${FILES_BASE_URL}/${filename}`
}
