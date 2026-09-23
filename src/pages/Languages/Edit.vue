<template>
  <a-card :title="isNew ? 'Новый язык' : 'Редактирование языка'" :loading="loading" style="max-width: 480px">
    <a-form layout="vertical" :model="form" @finish="onSubmit">
      <a-form-item label="Код" name="code" :rules="[{ required: true, message: 'Укажите код языка' }]">
        <a-input v-model:value="form.code" placeholder="pl, fr, de..." :disabled="!isNew" />
      </a-form-item>

      <a-form-item label="Название" name="name" :rules="[{ required: true, message: 'Укажите название' }]">
        <a-input v-model:value="form.name" placeholder="Polski" />
      </a-form-item>

      <a-form-item>
        <a-checkbox v-model:checked="form.is_default">Язык по умолчанию (fallback, если перевода нет)</a-checkbox>
      </a-form-item>

      <a-space>
        <a-button type="primary" html-type="submit" :loading="saving">Сохранить</a-button>
        <a-button @click="router.push({ name: 'languages' })">Отмена</a-button>
      </a-space>
    </a-form>
  </a-card>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import apiClient from '@/services/api.js'
import { notifyServerError, notifyServerSuccess } from '@/services/notify.js'

const route = useRoute()
const router = useRouter()
const isNew = computed(() => route.name === 'language-new')

const loading = ref(false)
const saving = ref(false)
const form = reactive({ code: '', name: '', is_default: false })

async function load() {
  if (isNew.value) return
  loading.value = true
  try {
    const { data } = await apiClient.get('/api/v1/app/languages')
    const language = data.find((l) => l.code === route.params.code)
    if (!language) throw new Error('Язык не найден')
    form.code = language.code
    form.name = language.name
    form.is_default = language.is_default
  } catch (e) {
    notifyServerError(e?.response?.data?.message || e?.message || e?.response?.data?.error)
  } finally {
    loading.value = false
  }
}

async function onSubmit() {
  saving.value = true
  try {
    if (isNew.value) {
      await apiClient.post('/api/v1/admin/languages', form)
    } else {
      await apiClient.put(`/api/v1/admin/languages/${route.params.code}`, { name: form.name, is_default: form.is_default || undefined })
    }
    notifyServerSuccess('Сохранено', 'Язык сохранён')
    router.push({ name: 'languages' })
  } catch (e) {
    notifyServerError(e?.response?.data?.message || e?.response?.data?.error)
  } finally {
    saving.value = false
  }
}

load()
</script>
