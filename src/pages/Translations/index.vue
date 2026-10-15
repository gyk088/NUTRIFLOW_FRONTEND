<template>
  <div>
    <div class="toolbar">
      <a-space>
        <a-select v-model:value="lang" style="width: 160px" :options="languageOptions" @change="load" />
        <a-input-search v-model:value="search" placeholder="Поиск по ключу или значению" style="width: 320px" allow-clear />
      </a-space>
      <a-button type="primary" @click="openAdd">
        <template #icon><PlusOutlined /></template>
        Добавить ключ
      </a-button>
    </div>

    <a-table :data-source="filteredRows" :loading="loading" :columns="columns" row-key="key" :pagination="{ pageSize: 20 }">
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'key'">
          <code>{{ record.key }}</code>
        </template>
        <template v-else-if="column.key === 'value'">
          <a-textarea v-model:value="record.value" auto-size :disabled="record.saving" @blur="save(record)" />
        </template>
        <template v-else-if="column.key === 'actions'">
          <a-popconfirm title="Удалить ключ?" ok-text="Удалить" cancel-text="Отмена" @confirm="remove(record.key)">
            <a class="danger-link">Удалить</a>
          </a-popconfirm>
        </template>
      </template>
    </a-table>

    <a-modal v-model:open="addModalOpen" title="Добавить ключ" ok-text="Добавить" cancel-text="Отмена" :confirm-loading="adding" @ok="confirmAdd">
      <a-form layout="vertical">
        <a-form-item label="Ключ">
          <a-input v-model:value="newKey" placeholder="common.back" />
        </a-form-item>
        <a-form-item label="Значение">
          <a-textarea v-model:value="newValue" auto-size />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import apiClient from '@/services/api.js'
import { notifyServerError, notifyServerSuccess } from '@/services/notify.js'

// Бэкенд хранит это как плоский словарь key -> value на язык (app_translation),
// отдельно от переводимого контента (recipe_translation и т.п.). Он
// накладывается в приложении поверх встроенного статического i18n JSON —
// ключ, отсутствующий здесь, просто берётся из бандла, поэтому не каждый
// ключ из мобильного кода обязан присутствовать в этой таблице.
const languages = ref([])
const lang = ref('ru')
const rows = ref([])
const loading = ref(false)
const search = ref('')

const languageOptions = computed(() => languages.value.map((l) => ({ value: l.code, label: l.name })))

const columns = [
  { title: 'Ключ', key: 'key', width: 320 },
  { title: 'Значение', key: 'value' },
  { title: '', key: 'actions', width: 100 }
]

const filteredRows = computed(() => {
  if (!search.value) return rows.value
  const needle = search.value.toLowerCase()
  return rows.value.filter((r) => r.key.toLowerCase().includes(needle) || r.value.toLowerCase().includes(needle))
})

async function loadLanguages() {
  const { data } = await apiClient.get('/api/v1/app/languages')
  languages.value = data
  if (!data.some((l) => l.code === lang.value)) lang.value = data[0]?.code
}

async function load() {
  if (!lang.value) return
  loading.value = true
  try {
    const { data } = await apiClient.get(`/api/v1/admin/translations/${lang.value}`)
    rows.value = Object.entries(data)
      .map(([key, value]) => ({ key, value }))
      .sort((a, b) => a.key.localeCompare(b.key))
  } catch (e) {
    notifyServerError(e?.response?.data?.message || e?.response?.data?.error)
  } finally {
    loading.value = false
  }
}

async function save(record) {
  record.saving = true
  try {
    await apiClient.put(`/api/v1/admin/translations/${lang.value}`, { [record.key]: record.value })
  } catch (e) {
    notifyServerError(e?.response?.data?.message || e?.response?.data?.error)
  } finally {
    record.saving = false
  }
}

async function remove(key) {
  try {
    await apiClient.delete(`/api/v1/admin/translations/${lang.value}/${encodeURIComponent(key)}`)
    rows.value = rows.value.filter((r) => r.key !== key)
    notifyServerSuccess('Удалено', 'Ключ удалён')
  } catch (e) {
    notifyServerError(e?.response?.data?.message || e?.response?.data?.error)
  }
}

const addModalOpen = ref(false)
const adding = ref(false)
const newKey = ref('')
const newValue = ref('')

function openAdd() {
  newKey.value = ''
  newValue.value = ''
  addModalOpen.value = true
}

async function confirmAdd() {
  const key = newKey.value.trim()
  if (!key) return
  adding.value = true
  try {
    await apiClient.put(`/api/v1/admin/translations/${lang.value}`, { [key]: newValue.value })
    addModalOpen.value = false
    await load()
    notifyServerSuccess('Добавлено', 'Ключ добавлен')
  } catch (e) {
    notifyServerError(e?.response?.data?.message || e?.response?.data?.error)
  } finally {
    adding.value = false
  }
}

onMounted(async () => {
  await loadLanguages()
  await load()
})
</script>

<style scoped>
.toolbar {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
}

code {
  word-break: break-all;
}

.danger-link {
  color: #ff4d4f;
}
</style>
