<template>
  <a-card :title="isNew ? 'Новый рецепт' : 'Редактирование рецепта'" :loading="loading">
    <a-form v-if="isNew" layout="vertical" :model="form" @finish="onCreate">
      <a-row :gutter="24">
        <a-col :span="6">
          <a-form-item label="Язык" name="languageCode" :rules="[{ required: true, message: 'Выберите язык' }]">
            <a-select v-model:value="form.languageCode" :options="languageOptions" />
          </a-form-item>
        </a-col>
        <a-col :span="14">
          <a-form-item label="Название" name="name" :rules="[{ required: true, message: 'Укажите название' }]">
            <a-input v-model:value="form.name" placeholder="Курица с рисом на гриле" />
          </a-form-item>
        </a-col>
        <a-col :span="4">
          <a-form-item label="Порций">
            <a-input-number v-model:value="form.servings" :min="1" style="width: 100%" />
          </a-form-item>
        </a-col>
      </a-row>

      <a-form-item label="Время готовки">
        <a-input v-model:value="form.cook_time" placeholder="30 минут" />
      </a-form-item>

      <a-form-item label="Картинка">
        <ImageUpload v-model="form.image_url" />
      </a-form-item>

      <a-form-item label="Описание">
        <a-textarea v-model:value="form.description" :rows="3" />
      </a-form-item>

      <a-form-item label="Шаги приготовления">
        <a-textarea v-model:value="form.steps" :rows="6" placeholder="1. ...&#10;2. ...&#10;3. ..." />
      </a-form-item>

      <a-form-item label="Теги">
        <a-select v-model:value="form.tagIds" mode="multiple" placeholder="Выберите теги" :options="tagOptions" option-filter-prop="label" />
      </a-form-item>

      <a-form-item label="Состав рецепта">
        <div v-for="(row, index) in ingredientRows" :key="index" class="composition-row">
          <a-select v-model:value="row.ingredient_id" show-search placeholder="Ингредиент" :options="ingredientOptions" option-filter-prop="label" style="flex: 1" />
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

      <a-space>
        <a-button type="primary" html-type="submit" :loading="saving">Создать</a-button>
        <a-button @click="router.push({ name: 'recipes' })">Отмена</a-button>
      </a-space>
    </a-form>

    <template v-else>
      <a-form layout="vertical" :model="form" @finish="onUpdate">
        <a-row :gutter="24">
          <a-col :span="4">
            <a-form-item label="Порций">
              <a-input-number v-model:value="form.servings" :min="1" style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col :span="10">
            <a-form-item label="Картинка">
              <ImageUpload v-model="form.image_url" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item label="Теги">
          <a-select v-model:value="form.tagIds" mode="multiple" placeholder="Выберите теги" :options="tagOptions" option-filter-prop="label" />
        </a-form-item>

        <a-form-item label="Состав рецепта">
          <div v-for="(row, index) in ingredientRows" :key="index" class="composition-row">
            <a-select v-model:value="row.ingredient_id" show-search placeholder="Ингредиент" :options="ingredientOptions" option-filter-prop="label" style="flex: 1" />
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

        <a-space style="margin-bottom: 24px">
          <a-button type="primary" html-type="submit" :loading="saving">Сохранить</a-button>
          <a-button @click="router.push({ name: 'recipes' })">Отмена</a-button>
          <a-popconfirm title="Удалить рецепт целиком (все языки)?" ok-text="Удалить" cancel-text="Отмена" @confirm="removeRecipe">
            <a-button danger>Удалить</a-button>
          </a-popconfirm>
        </a-space>
      </a-form>

      <a-divider>Тексты по языкам</a-divider>

      <TranslationTabs :translations="translations" :languages="languages" @add-language="onAddLanguage">
        <template #default="{ translation }">
          <a-form-item label="Название" :rules="[{ required: true }]">
            <a-input v-model:value="translation.name" placeholder="Курица с рисом на гриле" />
          </a-form-item>
          <a-form-item label="Время готовки">
            <a-input v-model:value="translation.cook_time" placeholder="30 минут" />
          </a-form-item>
          <a-form-item label="Описание">
            <a-textarea v-model:value="translation.description" :rows="3" />
          </a-form-item>
          <a-form-item label="Шаги приготовления">
            <a-textarea v-model:value="translation.steps" :rows="6" placeholder="1. ...&#10;2. ...&#10;3. ..." />
          </a-form-item>
          <a-space>
            <a-button type="primary" :loading="savingTranslation === translation.language_code" @click="saveTranslation(translation)">
              Сохранить перевод
            </a-button>
            <a-popconfirm
              v-if="translations.length > 1"
              title="Удалить перевод на этом языке?"
              ok-text="Удалить"
              cancel-text="Отмена"
              @confirm="removeTranslation(translation.language_code)"
            >
              <a-button danger>Удалить перевод</a-button>
            </a-popconfirm>
          </a-space>
        </template>
      </TranslationTabs>
    </template>
  </a-card>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons-vue'
import apiClient from '@/services/api.js'
import { notifyServerError, notifyServerSuccess } from '@/services/notify.js'
import ImageUpload from '@/components/ImageUpload.vue'
import TranslationTabs from '@/components/TranslationTabs.vue'

const route = useRoute()
const router = useRouter()
const isNew = computed(() => route.name === 'recipe-new')

const loading = ref(false)
const saving = ref(false)
const savingTranslation = ref(null)
const ingredientRows = ref([])
const ingredientOptions = ref([])
const tagOptions = ref([])
const nutrition = ref(null)
const languages = ref([])
const languageOptions = computed(() => languages.value.map((l) => ({ value: l.code, label: l.name })))
const translations = ref([])

const unitOptions = ['g', 'kg', 'ml', 'l', 'piece', 'tbsp', 'tsp', 'cup', 'slice', 'clove'].map((u) => ({ value: u, label: u }))

const form = reactive({
  languageCode: undefined,
  name: '',
  description: '',
  cook_time: '',
  steps: '',
  image_url: '',
  servings: 1,
  tagIds: []
})

async function loadOptions() {
  const [{ data: ingredients }, { data: tags }, { data: langs }] = await Promise.all([
    apiClient.get('/api/v1/app/ingredients'),
    apiClient.get('/api/v1/app/tags'),
    apiClient.get('/api/v1/app/languages')
  ])
  ingredientOptions.value = ingredients.map((i) => ({ value: i.id, label: i.name }))
  tagOptions.value = tags.map((t) => ({ value: t.id, label: t.name }))
  languages.value = langs
  if (isNew.value) form.languageCode = langs.find((l) => l.is_default)?.code || langs[0]?.code
}

async function load() {
  loading.value = true
  try {
    await loadOptions()
    if (!isNew.value) {
      const { data } = await apiClient.get(`/api/v1/admin/recipes/${route.params.id}`)
      form.image_url = data.image_url
      form.servings = data.servings
      form.tagIds = data.tagIds
      translations.value = data.translations
      ingredientRows.value = data.ingredients.map((row) => ({
        ingredient_id: row.ingredient_id,
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

function buildIngredients() {
  return ingredientRows.value
    .filter((row) => row.ingredient_id && row.quantity)
    .map((row) => ({ ingredient_id: row.ingredient_id, quantity: row.quantity, unit: row.unit }))
}

async function onCreate() {
  saving.value = true
  try {
    const payload = { ...form, ingredients: buildIngredients() }
    const recipe = await apiClient.post('/api/v1/admin/recipes', payload)
    notifyServerSuccess('Создано', 'Рецепт создан')
    router.push({ name: 'recipe-edit', params: { id: recipe.data.id } })
  } catch (e) {
    notifyServerError(e?.response?.data?.message || e?.response?.data?.error)
  } finally {
    saving.value = false
  }
}

async function onUpdate() {
  saving.value = true
  try {
    const payload = {
      image_url: form.image_url,
      servings: form.servings,
      tagIds: form.tagIds,
      ingredients: buildIngredients()
    }
    const { data } = await apiClient.put(`/api/v1/admin/recipes/${route.params.id}`, payload)
    nutrition.value = data.nutrition?.perServing
    notifyServerSuccess('Сохранено', 'Рецепт сохранён')
  } catch (e) {
    notifyServerError(e?.response?.data?.message || e?.response?.data?.error)
  } finally {
    saving.value = false
  }
}

function onAddLanguage(languageCode) {
  translations.value.push({ language_code: languageCode, name: '', description: '', cook_time: '', steps: '' })
}

async function saveTranslation(translation) {
  savingTranslation.value = translation.language_code
  try {
    await apiClient.put(`/api/v1/admin/recipes/${route.params.id}/translations/${translation.language_code}`, {
      name: translation.name,
      description: translation.description,
      cook_time: translation.cook_time,
      steps: translation.steps
    })
    notifyServerSuccess('Сохранено', 'Перевод сохранён')
  } catch (e) {
    notifyServerError(e?.response?.data?.message || e?.response?.data?.error)
  } finally {
    savingTranslation.value = null
  }
}

async function removeTranslation(languageCode) {
  try {
    await apiClient.delete(`/api/v1/admin/recipes/${route.params.id}/translations/${languageCode}`)
    translations.value = translations.value.filter((t) => t.language_code !== languageCode)
    notifyServerSuccess('Удалено', 'Перевод удалён')
  } catch (e) {
    notifyServerError(e?.response?.data?.message || e?.response?.data?.error)
  }
}

async function removeRecipe() {
  try {
    await apiClient.delete(`/api/v1/admin/recipes/${route.params.id}`)
    notifyServerSuccess('Удалено', 'Рецепт удалён')
    router.push({ name: 'recipes' })
  } catch (e) {
    notifyServerError(e?.response?.data?.message || e?.response?.data?.error)
  }
}

// route.params.id меняется с undefined на реальный id после редиректа
// со страницы создания на страницу редактирования — тот же компонент не
// пересоздаётся, поэтому watch (а не разовый вызов load()) нужен, чтобы
// подтянуть переводы только что созданного рецепта.
watch(() => route.params.id, load, { immediate: true })
</script>

<style scoped>
.composition-row {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
  align-items: center;
}
</style>
