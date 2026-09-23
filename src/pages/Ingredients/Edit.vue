<template>
  <a-card :title="isNew ? 'Новый ингредиент' : 'Редактирование ингредиента'" :loading="loading">
    <a-form v-if="isNew" layout="vertical" :model="form" @finish="onCreate">
      <a-row :gutter="24">
        <a-col :span="8">
          <a-form-item label="Язык" name="languageCode" :rules="[{ required: true, message: 'Выберите язык' }]">
            <a-select v-model:value="form.languageCode" :options="languageOptions" />
          </a-form-item>
        </a-col>
        <a-col :span="8">
          <a-form-item label="Название" name="name" :rules="[{ required: true, message: 'Укажите название' }]">
            <a-input v-model:value="form.name" placeholder="Куриная грудка" />
          </a-form-item>
        </a-col>
        <a-col :span="8">
          <a-form-item label="Картинка">
            <ImageUpload v-model="form.image_url" />
          </a-form-item>
        </a-col>
      </a-row>

      <a-form-item label="Аллергены">
        <a-select v-model:value="form.tagIds" mode="multiple" placeholder="Выберите аллергены" :options="allergenOptions" option-filter-prop="label" />
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
        <a-button type="primary" html-type="submit" :loading="saving">Создать</a-button>
        <a-button @click="router.push({ name: 'ingredients' })">Отмена</a-button>
      </a-space>
    </a-form>

    <template v-else>
      <a-form layout="vertical" :model="form" @finish="onUpdate">
        <a-row :gutter="24">
          <a-col :span="8">
            <a-form-item label="Картинка">
              <ImageUpload v-model="form.image_url" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item label="Аллергены">
          <a-select v-model:value="form.tagIds" mode="multiple" placeholder="Выберите аллергены" :options="allergenOptions" option-filter-prop="label" />
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

        <a-space style="margin-bottom: 24px">
          <a-button type="primary" html-type="submit" :loading="saving">Сохранить</a-button>
          <a-button @click="router.push({ name: 'ingredients' })">Отмена</a-button>
          <a-popconfirm title="Удалить ингредиент целиком (все языки)?" ok-text="Удалить" cancel-text="Отмена" @confirm="removeIngredient">
            <a-button danger>Удалить</a-button>
          </a-popconfirm>
        </a-space>
      </a-form>

      <a-divider>Названия по языкам</a-divider>

      <TranslationTabs :translations="translations" :languages="languages" @add-language="onAddLanguage">
        <template #default="{ translation }">
          <a-form-item label="Название">
            <a-input v-model:value="translation.name" placeholder="Куриная грудка" />
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
import { NUTRIENT_GROUPS, emptyNutrientValues } from '@/services/nutrients.js'
import { TAG_TYPES } from '@/services/const.js'
import ImageUpload from '@/components/ImageUpload.vue'
import TranslationTabs from '@/components/TranslationTabs.vue'

const route = useRoute()
const router = useRouter()
const isNew = computed(() => route.name === 'ingredient-new')

const loading = ref(false)
const saving = ref(false)
const savingTranslation = ref(null)
const openGroups = ref(['macros'])
const gramsPerUnitRows = ref([])
const allergenOptions = ref([])
const languages = ref([])
const languageOptions = computed(() => languages.value.map((l) => ({ value: l.code, label: l.name })))
const translations = ref([])

const form = reactive({
  languageCode: undefined,
  name: '',
  image_url: '',
  tagIds: [],
  ...emptyNutrientValues()
})

async function loadAllergenOptions() {
  const { data } = await apiClient.get('/api/v1/app/tags', { params: { type: TAG_TYPES.ALLERGEN } })
  allergenOptions.value = data.map((t) => ({ value: t.id, label: t.name }))
}

async function loadLanguages() {
  const { data } = await apiClient.get('/api/v1/app/languages')
  languages.value = data
  if (isNew.value) form.languageCode = data.find((l) => l.is_default)?.code || data[0]?.code
}

async function load() {
  loading.value = true
  try {
    await Promise.all([loadAllergenOptions(), loadLanguages()])
    if (isNew.value) return
    const { data } = await apiClient.get(`/api/v1/admin/ingredients/${route.params.id}`)
    Object.assign(form, data)
    translations.value = data.translations
    gramsPerUnitRows.value = Object.entries(data.grams_per_unit || {}).map(([unit, grams]) => ({ unit, grams }))
  } catch (e) {
    notifyServerError(e?.response?.data?.message || e?.response?.data?.error)
  } finally {
    loading.value = false
  }
}

function buildGramsPerUnit() {
  const grams_per_unit = {}
  for (const row of gramsPerUnitRows.value) {
    if (row.unit && row.grams) grams_per_unit[row.unit] = row.grams
  }
  return grams_per_unit
}

async function onCreate() {
  saving.value = true
  try {
    const payload = { ...form, grams_per_unit: buildGramsPerUnit() }
    const ingredient = await apiClient.post('/api/v1/admin/ingredients', payload)
    notifyServerSuccess('Создано', 'Ингредиент создан')
    router.push({ name: 'ingredient-edit', params: { id: ingredient.data.id } })
  } catch (e) {
    notifyServerError(e?.response?.data?.message || e?.response?.data?.error)
  } finally {
    saving.value = false
  }
}

async function onUpdate() {
  saving.value = true
  try {
    const payload = { ...form, grams_per_unit: buildGramsPerUnit() }
    await apiClient.put(`/api/v1/admin/ingredients/${route.params.id}`, payload)
    notifyServerSuccess('Сохранено', 'Ингредиент сохранён')
  } catch (e) {
    notifyServerError(e?.response?.data?.message || e?.response?.data?.error)
  } finally {
    saving.value = false
  }
}

function onAddLanguage(languageCode) {
  translations.value.push({ language_code: languageCode, name: '' })
}

async function saveTranslation(translation) {
  savingTranslation.value = translation.language_code
  try {
    await apiClient.put(`/api/v1/admin/ingredients/${route.params.id}/translations/${translation.language_code}`, { name: translation.name })
    notifyServerSuccess('Сохранено', 'Перевод сохранён')
  } catch (e) {
    notifyServerError(e?.response?.data?.message || e?.response?.data?.error)
  } finally {
    savingTranslation.value = null
  }
}

async function removeTranslation(languageCode) {
  try {
    await apiClient.delete(`/api/v1/admin/ingredients/${route.params.id}/translations/${languageCode}`)
    translations.value = translations.value.filter((t) => t.language_code !== languageCode)
    notifyServerSuccess('Удалено', 'Перевод удалён')
  } catch (e) {
    notifyServerError(e?.response?.data?.message || e?.response?.data?.error)
  }
}

async function removeIngredient() {
  try {
    await apiClient.delete(`/api/v1/admin/ingredients/${route.params.id}`)
    notifyServerSuccess('Удалено', 'Ингредиент удалён')
    router.push({ name: 'ingredients' })
  } catch (e) {
    notifyServerError(e?.response?.data?.message || e?.response?.data?.error)
  }
}

// route.params.id меняется с undefined на реальный id после редиректа
// со страницы создания на страницу редактирования — тот же компонент не
// пересоздаётся, поэтому watch (а не разовый вызов load()) нужен, чтобы
// подтянуть переводы только что созданного ингредиента.
watch(() => route.params.id, load, { immediate: true })
</script>

<style scoped>
.gpu-row {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
  align-items: center;
}
</style>
