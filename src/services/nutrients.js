// Зеркало NUTRIFLOW_BACKEND/src/bll/utils/nutrients.js — используется для
// динамической отрисовки полей формы ингредиента и колонок расчёта КБЖУ рецепта.
export const MACRO_FIELDS = [
  { field: 'calories', label: 'Калории', unit: 'ккал' },
  { field: 'protein', label: 'Белки', unit: 'г' },
  { field: 'carbs', label: 'Углеводы', unit: 'г' },
  { field: 'fat', label: 'Жиры', unit: 'г' },
  { field: 'fiber', label: 'Клетчатка', unit: 'г' },
  { field: 'sugar', label: 'Сахар', unit: 'г' },
  { field: 'saturated_fat', label: 'Насыщенные жиры', unit: 'г' },
  { field: 'cholesterol', label: 'Холестерин', unit: 'мг' },
  { field: 'sodium', label: 'Натрий', unit: 'мг' },
  { field: 'omega_3', label: 'Омега-3', unit: 'г' },
  { field: 'omega_6', label: 'Омега-6', unit: 'г' }
]

export const VITAMIN_FIELDS = [
  { field: 'vitamin_a', label: 'Витамин A', unit: 'мкг' },
  { field: 'vitamin_b1', label: 'Витамин B1', unit: 'мг' },
  { field: 'vitamin_b2', label: 'Витамин B2', unit: 'мг' },
  { field: 'vitamin_b3', label: 'Витамин B3', unit: 'мг' },
  { field: 'vitamin_b5', label: 'Витамин B5', unit: 'мг' },
  { field: 'vitamin_b6', label: 'Витамин B6', unit: 'мг' },
  { field: 'vitamin_b7', label: 'Витамин B7', unit: 'мкг' },
  { field: 'vitamin_b9', label: 'Витамин B9', unit: 'мкг' },
  { field: 'vitamin_b12', label: 'Витамин B12', unit: 'мкг' },
  { field: 'vitamin_c', label: 'Витамин C', unit: 'мг' },
  { field: 'vitamin_d', label: 'Витамин D', unit: 'мкг' },
  { field: 'vitamin_e', label: 'Витамин E', unit: 'мг' },
  { field: 'vitamin_k', label: 'Витамин K', unit: 'мкг' }
]

export const MINERAL_FIELDS = [
  { field: 'calcium', label: 'Кальций', unit: 'мг' },
  { field: 'iron', label: 'Железо', unit: 'мг' },
  { field: 'magnesium', label: 'Магний', unit: 'мг' },
  { field: 'phosphorus', label: 'Фосфор', unit: 'мг' },
  { field: 'potassium', label: 'Калий', unit: 'мг' },
  { field: 'zinc', label: 'Цинк', unit: 'мг' },
  { field: 'copper', label: 'Медь', unit: 'мг' },
  { field: 'manganese', label: 'Марганец', unit: 'мг' },
  { field: 'selenium', label: 'Селен', unit: 'мкг' },
  { field: 'iodine', label: 'Йод', unit: 'мкг' }
]

export const NUTRIENT_GROUPS = [
  { key: 'macros', title: 'Макронутриенты', fields: MACRO_FIELDS },
  { key: 'vitamins', title: 'Витамины', fields: VITAMIN_FIELDS },
  { key: 'minerals', title: 'Минералы', fields: MINERAL_FIELDS }
]

export const NUTRIENT_FIELDS = [...MACRO_FIELDS, ...VITAMIN_FIELDS, ...MINERAL_FIELDS].map((f) => f.field)

export function emptyNutrientValues() {
  const values = {}
  for (const field of NUTRIENT_FIELDS) values[field] = 0
  return values
}
