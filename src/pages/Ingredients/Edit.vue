<template>
  <a-card :title="isNew ? 'Новый ингредиент' : 'Редактирование ингредиента'" :loading="loading">
    <a-form layout="vertical" :model="form" @finish="onSubmit">
      <a-row :gutter="24">
        <a-col :span="8">
          <a-form-item label="Название (RU)" name="name_ru" :rules="[{ required: true, message: 'Укажите название на русском' }]">
            <a-input v-model:value="form.name_ru" placeholder="Куриная грудка" />
          </a-form-item>
        </a-col>
        <a-col :span="8">
          <a-form-item label="Название (EN)" name="name_en" :rules="[{ required: true, message: 'Укажите название на английском' }]">
            <a-input v-model:value="form.name_en" placeholder="Chicken breast" />
          </a-form-item>
        </a-col>
        <a-col :span="8">
          <a-form-item label="Картинка">
            <ImageUpload v-model="form.image_url" />
          </a-form-item>
        </a-col>
      </a-row>

      <a-form-item label="Аллергены">
        <a-select
          v-model:value="form.tagIds"
          mode="multiple"
          placeholder="Выберите аллергены"
          :options="allergenOptions"
          option-filter-prop="label"
        />
      </a-form-item>

      <a-form-item label="Вес порционных единиц (граммы на штуку/ложку/чашку...)">
        <div v-for="(row, index) in gramsPerUnitRows" :key="index" class="gpu-row">
          <a-input v-model:value="row.unit" placeholder="piece, tbsp, cup..." style="width: 160px" />
          <a-input-number v-model:value="row.grams" placeholder="граммы" :min="0" style="width: 140px" />
          <a-button danger type="text" @click="gramsPerUnitRows.splice(index, 1)">
            <DeleteOutlined />
          </a-button>
        </div>
        <a-button type="dashed" block @click="gramsPerUnitRows.push({ unit: '', grams: undefined })">
          <PlusOutlined /> Добавить единицу
        </a-button>
      </a-form-item>

      <a-collapse v-model:active-key="openGroups" :bordered="false" style="margin-bottom: 24px">
        <a-collapse-panel v-for="group in NUTRIENT_GROUPS" :key="group.key" :header="group.title">
          <a-row :gutter="16">
            <a-col :span="6" v-for="nutrient in group.fields" :key="nutrient.field">
              <a-form-item :label="`${nutrient.label} (${nutrient.unit})`">
                <a-input-number v-model:value="form[nutrient.field]" :min="0" :step="0.1" style="width: 100%" />
              </a-form-item>
            </a-col>
          </a-row>
        </a-collapse-panel>
      </a-collapse>

      <a-space>
        <a-button type="primary" html-type="submit" :loading="saving">Сохранить</a-button>
        <a-button @click="router.push({ name: 'ingredients' })">Отмена</a-button>
        <a-popconfirm v-if="!isNew" title="Удалить ингредиент?" ok-text="Удалить" cancel-text="Отмена" @confirm="remove">
          <a-button danger>Удалить</a-button>
        </a-popconfirm>
      </a-space>
    </a-form>
  </a-card>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons-vue'
import apiClient from '@/services/api.js'
import { notifyServerError, notifyServerSuccess } from '@/services/notify.js'
import { NUTRIENT_GROUPS, emptyNutrientValues } from '@/services/nutrients.js'
import { TAG_TYPES } from '@/services/const.js'
import ImageUpload from '@/components/ImageUpload.vue'

const route = useRoute()
const router = useRouter()
const isNew = computed(() => route.name === 'ingredient-new')

const loading = ref(false)
const saving = ref(false)
const openGroups = ref(['macros'])
const gramsPerUnitRows = ref([])
const allergenOptions = ref([])

const form = reactive({
  name_ru: '',
  name_en: '',
  image_url: '',
  tagIds: [],
  ...emptyNutrientValues()
})

async function loadAllergenOptions() {
  const { data } = await apiClient.get('/api/v1/app/tags', { params: { type: TAG_TYPES.ALLERGEN } })
  allergenOptions.value = data.map((t) => ({ value: t.id, label: `${t.name_ru} / ${t.name_en}` }))
}

async function load() {
  loading.value = true
  try {
    await loadAllergenOptions()
    if (isNew.value) return
    const { data } = await apiClient.get(`/api/v1/app/ingredients/${route.params.id}`)
    Object.assign(form, data)
    form.tagIds = (data.tags || []).map((t) => t.id)
    gramsPerUnitRows.value = Object.entries(data.grams_per_unit || {}).map(([unit, grams]) => ({ unit, grams }))
  } catch (e) {
    notifyServerError(e?.response?.data?.message || e?.response?.data?.error)
  } finally {
    loading.value = false
  }
}

function buildPayload() {
  const grams_per_unit = {}
  for (const row of gramsPerUnitRows.value) {
    if (row.unit && row.grams) grams_per_unit[row.unit] = row.grams
  }
  return { ...form, grams_per_unit }
}

async function onSubmit() {
  saving.value = true
  try {
    const payload = buildPayload()
    if (isNew.value) {
      await apiClient.post('/api/v1/admin/ingredients', payload)
    } else {
      await apiClient.put(`/api/v1/admin/ingredients/${route.params.id}`, payload)
    }
    notifyServerSuccess('Сохранено', 'Ингредиент сохранён')
    router.push({ name: 'ingredients' })
  } catch (e) {
    notifyServerError(e?.response?.data?.message || e?.response?.data?.error)
  } finally {
    saving.value = false
  }
}

async function remove() {
  try {
    await apiClient.delete(`/api/v1/admin/ingredients/${route.params.id}`)
    notifyServerSuccess('Удалено', 'Ингредиент удалён')
    router.push({ name: 'ingredients' })
  } catch (e) {
    notifyServerError(e?.response?.data?.message || e?.response?.data?.error)
  }
}

load()
</script>

<style scoped>
.gpu-row {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
  align-items: center;
}
</style>
