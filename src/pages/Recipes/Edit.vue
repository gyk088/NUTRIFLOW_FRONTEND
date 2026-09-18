<template>
  <a-card :title="isNew ? 'Новый рецепт' : 'Редактирование рецепта'" :loading="loading">
    <a-form layout="vertical" :model="form" @finish="onSubmit">
      <a-row :gutter="24">
        <a-col :span="10">
          <a-form-item label="Название (RU)" name="name_ru" :rules="[{ required: true, message: 'Укажите название на русском' }]">
            <a-input v-model:value="form.name_ru" placeholder="Курица с рисом на гриле" />
          </a-form-item>
        </a-col>
        <a-col :span="10">
          <a-form-item label="Название (EN)" name="name_en" :rules="[{ required: true, message: 'Укажите название на английском' }]">
            <a-input v-model:value="form.name_en" placeholder="Grilled Chicken with Rice" />
          </a-form-item>
        </a-col>
        <a-col :span="4">
          <a-form-item label="Порций">
            <a-input-number v-model:value="form.servings" :min="1" style="width: 100%" />
          </a-form-item>
        </a-col>
      </a-row>

      <a-row :gutter="24">
        <a-col :span="10">
          <a-form-item label="Время готовки (RU)">
            <a-input v-model:value="form.cook_time_ru" placeholder="30 минут" />
          </a-form-item>
        </a-col>
        <a-col :span="10">
          <a-form-item label="Время готовки (EN)">
            <a-input v-model:value="form.cook_time_en" placeholder="30 minutes" />
          </a-form-item>
        </a-col>
      </a-row>

      <a-form-item label="Картинка">
        <ImageUpload v-model="form.image_url" />
      </a-form-item>

      <a-row :gutter="24">
        <a-col :span="12">
          <a-form-item label="Описание (RU)">
            <a-textarea v-model:value="form.description_ru" :rows="3" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="Описание (EN)">
            <a-textarea v-model:value="form.description_en" :rows="3" />
          </a-form-item>
        </a-col>
      </a-row>

      <a-row :gutter="24">
        <a-col :span="12">
          <a-form-item label="Шаги приготовления (RU)">
            <a-textarea v-model:value="form.steps_ru" :rows="6" placeholder="1. ...&#10;2. ...&#10;3. ..." />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="Шаги приготовления (EN)">
            <a-textarea v-model:value="form.steps_en" :rows="6" placeholder="1. ...&#10;2. ...&#10;3. ..." />
          </a-form-item>
        </a-col>
      </a-row>

      <a-form-item label="Теги">
        <a-select
          v-model:value="form.tagIds"
          mode="multiple"
          placeholder="Выберите теги"
          :options="tagOptions"
          option-filter-prop="label"
        />
      </a-form-item>

      <a-form-item label="Состав рецепта">
        <div v-for="(row, index) in ingredientRows" :key="index" class="composition-row">
          <a-select
            v-model:value="row.ingredient_id"
            show-search
            placeholder="Ингредиент"
            :options="ingredientOptions"
            option-filter-prop="label"
            style="flex: 1"
          />
          <a-input-number v-model:value="row.quantity" placeholder="кол-во" :min="0" style="width: 120px" />
          <a-select v-model:value="row.unit" :options="unitOptions" style="width: 110px" />
          <a-button danger type="text" @click="ingredientRows.splice(index, 1)">
            <DeleteOutlined />
          </a-button>
        </div>
        <a-button type="dashed" block @click="ingredientRows.push({ ingredient_id: undefined, quantity: undefined, unit: 'g' })">
          <PlusOutlined /> Добавить ингредиент
        </a-button>
      </a-form-item>

      <a-descriptions v-if="nutrition" title="КБЖУ на порцию (по последнему сохранению)" bordered size="small" :column="4" style="margin-bottom: 24px">
        <a-descriptions-item label="Калории">{{ nutrition.calories }} ккал</a-descriptions-item>
        <a-descriptions-item label="Белки">{{ nutrition.protein }} г</a-descriptions-item>
        <a-descriptions-item label="Углеводы">{{ nutrition.carbs }} г</a-descriptions-item>
        <a-descriptions-item label="Жиры">{{ nutrition.fat }} г</a-descriptions-item>
      </a-descriptions>

      <a-space>
        <a-button type="primary" html-type="submit" :loading="saving">Сохранить</a-button>
        <a-button @click="router.push({ name: 'recipes' })">Отмена</a-button>
        <a-popconfirm v-if="!isNew" title="Удалить рецепт?" ok-text="Удалить" cancel-text="Отмена" @confirm="remove">
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
import { TEXT_TAG_TYPES } from '@/services/const.js'
import ImageUpload from '@/components/ImageUpload.vue'

const route = useRoute()
const router = useRouter()
const isNew = computed(() => route.name === 'recipe-new')

const loading = ref(false)
const saving = ref(false)
const ingredientRows = ref([])
const ingredientOptions = ref([])
const tagOptions = ref([])
const nutrition = ref(null)

const unitOptions = ['g', 'kg', 'ml', 'l', 'piece', 'tbsp', 'tsp', 'cup', 'slice', 'clove'].map((u) => ({ value: u, label: u }))

const form = reactive({
  name_ru: '',
  name_en: '',
  description_ru: '',
  description_en: '',
  cook_time_ru: '',
  cook_time_en: '',
  steps_ru: '',
  steps_en: '',
  image_url: '',
  servings: 1,
  tagIds: []
})

async function loadOptions() {
  const [{ data: ingredients }, { data: tags }] = await Promise.all([
    apiClient.get('/api/v1/ingredients'),
    apiClient.get('/api/v1/tags')
  ])
  ingredientOptions.value = ingredients.map((i) => ({ value: i.id, label: `${i.name_ru} / ${i.name_en}` }))
  tagOptions.value = tags.map((t) => ({ value: t.id, label: `${TEXT_TAG_TYPES[t.type] || t.type}: ${t.name_ru} / ${t.name_en}` }))
}

async function load() {
  loading.value = true
  try {
    await loadOptions()
    if (!isNew.value) {
      const { data } = await apiClient.get(`/api/v1/recipes/${route.params.id}`)
      form.name_ru = data.name_ru
      form.name_en = data.name_en
      form.description_ru = data.description_ru
      form.description_en = data.description_en
      form.cook_time_ru = data.cook_time_ru
      form.cook_time_en = data.cook_time_en
      form.steps_ru = data.steps_ru
      form.steps_en = data.steps_en
      form.image_url = data.image_url
      form.servings = data.servings
      form.tagIds = data.tags.map((t) => t.id)
      ingredientRows.value = data.ingredients.map((row) => ({
        ingredient_id: row.ingredient?.id,
        quantity: Number(row.quantity),
        unit: row.unit
      }))
      nutrition.value = data.nutrition?.perServing
    }
  } catch (e) {
    notifyServerError(e?.response?.data?.message || e?.response?.data?.error)
  } finally {
    loading.value = false
  }
}

async function onSubmit() {
  saving.value = true
  const { tagIds, ...data } = form
  const payload = {
    ...data,
    tagIds,
    ingredients: ingredientRows.value
      .filter((row) => row.ingredient_id && row.quantity)
      .map((row) => ({ ingredient_id: row.ingredient_id, quantity: row.quantity, unit: row.unit }))
  }
  try {
    if (isNew.value) {
      await apiClient.post('/api/v1/recipes', payload)
    } else {
      await apiClient.put(`/api/v1/recipes/${route.params.id}`, payload)
    }
    notifyServerSuccess('Сохранено', 'Рецепт сохранён')
    router.push({ name: 'recipes' })
  } catch (e) {
    notifyServerError(e?.response?.data?.message || e?.response?.data?.error)
  } finally {
    saving.value = false
  }
}

async function remove() {
  try {
    await apiClient.delete(`/api/v1/recipes/${route.params.id}`)
    notifyServerSuccess('Удалено', 'Рецепт удалён')
    router.push({ name: 'recipes' })
  } catch (e) {
    notifyServerError(e?.response?.data?.message || e?.response?.data?.error)
  }
}

load()
</script>

<style scoped>
.composition-row {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
  align-items: center;
}
</style>
