<template>
  <a-card :title="isNew ? 'Новый тег' : 'Редактирование тега'" :loading="loading" style="max-width: 480px">
    <a-form layout="vertical" :model="form" @finish="onSubmit">
      <a-form-item label="Тип" name="type" :rules="[{ required: true, message: 'Укажите тип' }]">
        <a-auto-complete
          v-model:value="form.type"
          :options="typeOptions"
          placeholder="category, dietary... или свой новый тип"
          :filter-option="filterTypeOption"
        />
      </a-form-item>

      <a-form-item label="Название (RU)" name="name_ru" :rules="[{ required: true, message: 'Укажите название на русском' }]">
        <a-input v-model:value="form.name_ru" placeholder="завтрак, вегетарианское..." />
      </a-form-item>

      <a-form-item label="Название (EN)" name="name_en" :rules="[{ required: true, message: 'Укажите название на английском' }]">
        <a-input v-model:value="form.name_en" placeholder="breakfast, vegetarian..." />
      </a-form-item>

      <a-space>
        <a-button type="primary" html-type="submit" :loading="saving">Сохранить</a-button>
        <a-button @click="router.push({ name: 'tags' })">Отмена</a-button>
      </a-space>
    </a-form>
  </a-card>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import apiClient from '@/services/api.js'
import { notifyServerError, notifyServerSuccess } from '@/services/notify.js'
import { TAG_TYPES, TEXT_TAG_TYPES } from '@/services/const.js'

const route = useRoute()
const router = useRouter()
const isNew = computed(() => route.name === 'tag-new')

const loading = ref(false)
const saving = ref(false)
const form = reactive({ type: undefined, name_ru: '', name_en: '' })

const knownTypeValues = new Set(Object.values(TAG_TYPES))
const knownTypeOptions = Object.values(TAG_TYPES).map((value) => ({
  value,
  label: TEXT_TAG_TYPES[value]
}))
// Дополняется на load() типами, которые уже встречаются среди тегов, но не
// входят в предустановленный список (кто-то уже завёл свой тип).
const typeOptions = ref(knownTypeOptions)

function filterTypeOption(input, option) {
  const query = input.toLowerCase()
  return option.value.toLowerCase().includes(query) || (option.label || '').toLowerCase().includes(query)
}

async function loadTypeOptions() {
  const { data } = await apiClient.get('/api/v1/tags')
  const extraTypes = [...new Set(data.map((t) => t.type))].filter((type) => !knownTypeValues.has(type))
  typeOptions.value = [...knownTypeOptions, ...extraTypes.map((type) => ({ value: type, label: type }))]
}

async function load() {
  loading.value = true
  try {
    await loadTypeOptions()
    if (isNew.value) return
    const { data } = await apiClient.get(`/api/v1/tags/${route.params.id}`)
    form.type = data.type
    form.name_ru = data.name_ru
    form.name_en = data.name_en
  } catch (e) {
    notifyServerError(e?.response?.data?.message || e?.response?.data?.error)
  } finally {
    loading.value = false
  }
}

async function onSubmit() {
  saving.value = true
  const payload = { type: form.type, name_ru: form.name_ru, name_en: form.name_en }
  try {
    if (isNew.value) {
      await apiClient.post('/api/v1/tags', payload)
    } else {
      await apiClient.put(`/api/v1/tags/${route.params.id}`, payload)
    }
    notifyServerSuccess('Сохранено', 'Тег сохранён')
    router.push({ name: 'tags' })
  } catch (e) {
    notifyServerError(e?.response?.data?.message || e?.response?.data?.error)
  } finally {
    saving.value = false
  }
}

load()
</script>
