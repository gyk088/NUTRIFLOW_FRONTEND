// Совпадает с NUTRIFLOW_BACKEND/src/bll/utils/const.js
export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  USER: 'user'
}

export const TEXT_ROLES = {
  super_admin: 'Супер-админ',
  admin: 'Администратор',
  user: 'Пользователь'
}

export const TAG_TYPES = {
  CATEGORY: 'category',
  MEAL_TYPE: 'meal_type',
  DIETARY: 'dietary',
  ALLERGEN: 'allergen',
  FOOD_GROUP: 'food_group'
}

export const TEXT_TAG_TYPES = {
  category: 'Категория',
  meal_type: 'Тип приёма пищи',
  dietary: 'Диета',
  allergen: 'Аллерген',
  food_group: 'Группа продуктов'
}

// Совпадает с MEASURE_UNITS в NUTRIFLOW_BACKEND/src/bll/utils/const.js
export const UNIT_OPTIONS = [
  { value: 'g', label: 'g — граммы' },
  { value: 'kg', label: 'kg — килограммы' },
  { value: 'ml', label: 'ml — миллилитры' },
  { value: 'l', label: 'l — литры' },
  { value: 'piece', label: 'piece — штуки' },
  { value: 'tbsp', label: 'tbsp — столовые ложки' },
  { value: 'tsp', label: 'tsp — чайные ложки' },
  { value: 'cup', label: 'cup — чашки' },
  { value: 'slice', label: 'slice — ломтики' },
  { value: 'clove', label: 'clove — зубчики' }
]
