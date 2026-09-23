<template>
  <a-card :title="isNew ? 'Новый тег' : 'Редактирование тега'" :loading="loading" style="max-width: 640px">
    <a-form v-if="isNew" layout="vertical" :model="form" @finish="onCreate">
      <a-form-item label="Язык" name="languageCode" :rules="[{ required: true, message: 'Выберите язык' }]">
        <a-select v-model:value="form.languageCode" :options="languageOptions" />
      </a-form-item>

      <a-form-item label="Тип" name="type" :rules="[{ required: true, message: 'Укажите тип' }]">
        <a-auto-complete
          v-model:value="form.type"
          :options="typeOptions"
          placeholder="category, dietary... или свой новый тип"
          :filter-option="filterTypeOption"
        />
      </a-form-item>

      <a-form-item label="Название" name="name" :rules="[{ required: true, message: 'Укажите название' }]">
        <a-input v-model:value="form.name" placeholder="завтрак, вегетарианское..." />
      </a-form-item>

      <a-space>
        <a-button type="primary" html-type="submit" :loading="saving">Создать</a-button>
        <a-button @click="router.push({ name: 'tags' })">Отмена</a-button>
      </a-space>
    </a-form>

    <template v-else>
      <a-form layout="vertical" style="margin-bottom: 24px">
        <a-form-item label="Тип">
          <a-auto-complete
            v-model:value="type"
            :options="typeOptions"
            :filter-option="filterTypeOption"
            style="max-width: 320px"
          />
        </a-form-item>
        <a-button @click="saveType" :loading="savingType">Сохранить тип</a-button>
      </a-form>

      <TranslationTabs :translations="translations" :languages="languages" @add-language="onAddLanguage">
        <template #default="{ translation }">
          <a-form-item label="Название">
            <a-input v-model:value="translation.name" placeholder="завтрак, вегетарианское..." />
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

      <a-popconfirm title="Удалить тег целиком (все языки)?" ok-text="Удалить" cancel-text="Отмена" @confirm="removeTag">
        <a-button danger style="margin-top: 24px">Удалить тег</a-button>
      </a-popconfirm>
    </template>
  </a-card>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import apiClient from '@/services/api.js'
import { notifyServerError, notifyServerSuccess } from '@/services/notify.js'
import { TAG_TYPES, TEXT_TAG_TYPES } from '@/services/const.js'
import TranslationTabs from '@/components/TranslationTabs.vue'

const route = useRoute()
const router = useRouter()
const isNew = computed(() => route.name === 'tag-new')

const loading = ref(false)
const saving = ref(false)
const savingType = ref(false)
const savingTranslation = ref(null)

const languages = ref([])
const languageOptions = computed(() => languages.value.map((l) => ({ value: l.code, label: l.name })))

const form = reactive({ languageCode: undefined, type: undefined, name: '' })
const type = ref('')
const translations = ref([])

const knownTypeValues = new Set(Object.values(TAG_TYPES))
const knownTypeOptions = Object.values(TAG_TYPES).map((value) => ({ value, label: TEXT_TAG_TYPES[value] }))
const typeOptions = ref(knownTypeOptions)

function filterTypeOption(input, option) {
  const query = input.toLowerCase()
  return option.value.toLowerCase().includes(query) || (option.label || '').toLowerCase().includes(query)
}

async function loadTypeOptions() {
  const { data } = await apiClient.get('/api/v1/app/tags')
  const extraTypes = [...new Set(data.map((t) => t.type))].filter((t) => !knownTypeValues.has(t))
  typeOptions.value = [...knownTypeOptions, ...extraTypes.map((t) => ({ value: t, label: t }))]
}

async function loadLanguages() {
  const { data } = await apiClient.get('/api/v1/app/languages')
  languages.value = data
  if (isNew.value) form.languageCode = data.find((l) => l.is_default)?.code || data[0]?.code
}

async function load() {
  loading.value = true
  try {
    await Promise.all([loadTypeOptions(), loadLanguages()])
    if (!isNew.value) {
      const { data } = await apiClient.get(`/api/v1/admin/tags/${route.params.id}`)
      type.value = data.type
      translations.value = data.translations
    }
  } catch (e) {
    notifyServerError(e?.response?.data?.message || e?.response?.data?.error)
  } finally {
    loading.value = false
  }
}

async function onCreate() {
  saving.value = true
  try {
    const tag = await apiClient.post('/api/v1/admin/tags', form)
    notifyServerSuccess('Создано', 'Тег создан')
    router.push({ name: 'tag-edit', params: { id: tag.data.id } })
  } catch (e) {
    notifyServerError(e?.response?.data?.message || e?.response?.data?.error)
  } finally {
    saving.value = false
  }
}

async function saveType() {
  savingType.value = true
  try {
    await apiClient.put(`/api/v1/admin/tags/${route.params.id}`, { type: type.value })
    notifyServerSuccess('Сохранено', 'Тип сохранён')
  } catch (e) {
    notifyServerError(e?.response?.data?.message || e?.response?.data?.error)
  } finally {
    savingType.value = false
  }
}

function onAddLanguage(languageCode) {
  translations.value.push({ language_code: languageCode, name: '' })
}

async function saveTranslation(translation) {
  savingTranslation.value = translation.language_code
  try {
    await apiClient.put(`/api/v1/admin/tags/${route.params.id}/translations/${translation.language_code}`, { name: translation.name })
    notifyServerSuccess('Сохранено', 'Перевод сохранён')
  } catch (e) {
    notifyServerError(e?.response?.data?.message || e?.response?.data?.error)
  } finally {
    savingTranslation.value = null
  }
}

async function removeTranslation(languageCode) {
  try {
    await apiClient.delete(`/api/v1/admin/tags/${route.params.id}/translations/${languageCode}`)
    translations.value = translations.value.filter((t) => t.language_code !== languageCode)
    notifyServerSuccess('Удалено', 'Перевод удалён')
  } catch (e) {
    notifyServerError(e?.response?.data?.message || e?.response?.data?.error)
  }
}

async function removeTag() {
  try {
    await apiClient.delete(`/api/v1/admin/tags/${route.params.id}`)
    notifyServerSuccess('Удалено', 'Тег удалён')
    router.push({ name: 'tags' })
  } catch (e) {
    notifyServerError(e?.response?.data?.message || e?.response?.data?.error)
  }
}

// route.params.id меняется с undefined на реальный id после редиректа
// со страницы создания на страницу редактирования — тот же компонент не
// пересоздаётся, поэтому watch (а не разовый вызов load()) нужен, чтобы
// подтянуть переводы только что созданного тега.
watch(() => route.params.id, load, { immediate: true })
</script>
