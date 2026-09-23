<template>
  <a-card :title="isNew ? 'Новая статья' : 'Редактирование статьи'" :loading="loading">
    <a-form v-if="isNew" layout="vertical" :model="form" @finish="onCreate">
      <a-row :gutter="24">
        <a-col :span="6">
          <a-form-item label="Язык" name="languageCode" :rules="[{ required: true, message: 'Выберите язык' }]">
            <a-select v-model:value="form.languageCode" :options="languageOptions" />
          </a-form-item>
        </a-col>
        <a-col :span="18">
          <a-form-item label="Название" name="title" :rules="[{ required: true, message: 'Укажите название' }]">
            <a-input v-model:value="form.title" placeholder="Как правильно считать калории" />
          </a-form-item>
        </a-col>
      </a-row>

      <a-form-item label="Картинка">
        <ImageUpload v-model="form.image_url" />
      </a-form-item>

      <a-form-item label="Теги">
        <a-select v-model:value="form.tagIds" mode="multiple" placeholder="Выберите теги" :options="tagOptions" option-filter-prop="label" />
      </a-form-item>

      <a-form-item label="Текст статьи">
        <RichTextEditor v-model="form.content" />
      </a-form-item>

      <a-space>
        <a-button type="primary" html-type="submit" :loading="saving">Создать</a-button>
        <a-button @click="router.push({ name: 'articles' })">Отмена</a-button>
      </a-space>
    </a-form>

    <template v-else>
      <a-form layout="vertical" :model="form" @finish="onUpdate">
        <a-form-item label="Картинка">
          <ImageUpload v-model="form.image_url" />
        </a-form-item>

        <a-form-item label="Теги">
          <a-select v-model:value="form.tagIds" mode="multiple" placeholder="Выберите теги" :options="tagOptions" option-filter-prop="label" />
        </a-form-item>

        <a-space style="margin-bottom: 24px">
          <a-button type="primary" html-type="submit" :loading="saving">Сохранить</a-button>
          <a-button @click="router.push({ name: 'articles' })">Отмена</a-button>
          <a-popconfirm title="Удалить статью целиком (все языки)?" ok-text="Удалить" cancel-text="Отмена" @confirm="removeArticle">
            <a-button danger>Удалить</a-button>
          </a-popconfirm>
        </a-space>
      </a-form>

      <a-divider>Тексты по языкам</a-divider>

      <TranslationTabs :translations="translations" :languages="languages" @add-language="onAddLanguage">
        <template #default="{ translation }">
          <a-form-item label="Название">
            <a-input v-model:value="translation.title" />
          </a-form-item>
          <a-form-item label="Текст статьи">
            <RichTextEditor v-model="translation.content" />
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
import apiClient from '@/services/api.js'
import { notifyServerError, notifyServerSuccess } from '@/services/notify.js'
import ImageUpload from '@/components/ImageUpload.vue'
import RichTextEditor from '@/components/RichTextEditor.vue'
import TranslationTabs from '@/components/TranslationTabs.vue'

const route = useRoute()
const router = useRouter()
const isNew = computed(() => route.name === 'article-new')

const loading = ref(false)
const saving = ref(false)
const savingTranslation = ref(null)
const tagOptions = ref([])
const languages = ref([])
const languageOptions = computed(() => languages.value.map((l) => ({ value: l.code, label: l.name })))
const translations = ref([])

const form = reactive({
  languageCode: undefined,
  title: '',
  image_url: '',
  content: '',
  tagIds: []
})

async function loadOptions() {
  const [{ data: tags }, { data: langs }] = await Promise.all([
    apiClient.get('/api/v1/app/tags'),
    apiClient.get('/api/v1/app/languages')
  ])
  tagOptions.value = tags.map((t) => ({ value: t.id, label: t.name }))
  languages.value = langs
  if (isNew.value) form.languageCode = langs.find((l) => l.is_default)?.code || langs[0]?.code
}

async function load() {
  loading.value = true
  try {
    await loadOptions()
    if (!isNew.value) {
      const { data } = await apiClient.get(`/api/v1/admin/articles/${route.params.id}`)
      form.image_url = data.image_url
      form.tagIds = data.tagIds
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
    const article = await apiClient.post('/api/v1/admin/articles', form)
    notifyServerSuccess('Создано', 'Статья создана')
    router.push({ name: 'article-edit', params: { id: article.data.id } })
  } catch (e) {
    notifyServerError(e?.response?.data?.message || e?.response?.data?.error)
  } finally {
    saving.value = false
  }
}

async function onUpdate() {
  saving.value = true
  try {
    await apiClient.put(`/api/v1/admin/articles/${route.params.id}`, { image_url: form.image_url, tagIds: form.tagIds })
    notifyServerSuccess('Сохранено', 'Статья сохранена')
  } catch (e) {
    notifyServerError(e?.response?.data?.message || e?.response?.data?.error)
  } finally {
    saving.value = false
  }
}

function onAddLanguage(languageCode) {
  translations.value.push({ language_code: languageCode, title: '', content: '' })
}

async function saveTranslation(translation) {
  savingTranslation.value = translation.language_code
  try {
    await apiClient.put(`/api/v1/admin/articles/${route.params.id}/translations/${translation.language_code}`, {
      title: translation.title,
      content: translation.content
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
    await apiClient.delete(`/api/v1/admin/articles/${route.params.id}/translations/${languageCode}`)
    translations.value = translations.value.filter((t) => t.language_code !== languageCode)
    notifyServerSuccess('Удалено', 'Перевод удалён')
  } catch (e) {
    notifyServerError(e?.response?.data?.message || e?.response?.data?.error)
  }
}

async function removeArticle() {
  try {
    await apiClient.delete(`/api/v1/admin/articles/${route.params.id}`)
    notifyServerSuccess('Удалено', 'Статья удалена')
    router.push({ name: 'articles' })
  } catch (e) {
    notifyServerError(e?.response?.data?.message || e?.response?.data?.error)
  }
}

// route.params.id меняется с undefined на реальный id после редиректа
// со страницы создания на страницу редактирования — тот же компонент не
// пересоздаётся, поэтому watch (а не разовый вызов load()) нужен, чтобы
// подтянуть переводы для только что созданной статьи.
watch(() => route.params.id, load, { immediate: true })
</script>
