<template>
  <div>
    <div class="toolbar">
      <div />
      <a-button type="primary" @click="router.push({ name: 'language-new' })">
        <template #icon><PlusOutlined /></template>
        Добавить язык
      </a-button>
    </div>

    <a-table :data-source="languages" :loading="loading" :columns="columns" row-key="code" :pagination="false">
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'code'">
          <a-tag>{{ record.code }}</a-tag>
        </template>
        <template v-else-if="column.key === 'is_default'">
          <a-tag v-if="record.is_default" color="blue">По умолчанию</a-tag>
        </template>
        <template v-else-if="column.key === 'actions'">
          <a-space>
            <a @click="router.push({ name: 'language-edit', params: { code: record.code } })">Изменить</a>
            <a-popconfirm v-if="!record.is_default" title="Удалить язык?" ok-text="Удалить" cancel-text="Отмена" @confirm="remove(record.code)">
              <a class="danger-link">Удалить</a>
            </a-popconfirm>
            <span v-else class="danger-link disabled">Удалить</span>
          </a-space>
        </template>
      </template>
    </a-table>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { PlusOutlined } from '@ant-design/icons-vue'
import apiClient from '@/services/api.js'
import { notifyServerError, notifyServerSuccess } from '@/services/notify.js'

const router = useRouter()
const languages = ref([])
const loading = ref(false)

const columns = [
  { title: 'Код', key: 'code', width: 100 },
  { title: 'Название', dataIndex: 'name', key: 'name' },
  { title: '', key: 'is_default', width: 160 },
  { title: '', key: 'actions', width: 160 }
]

async function load() {
  loading.value = true
  try {
    const { data } = await apiClient.get('/api/v1/app/languages')
    languages.value = data
  } catch (e) {
    notifyServerError(e?.response?.data?.message || e?.response?.data?.error)
  } finally {
    loading.value = false
  }
}

async function remove(code) {
  try {
    await apiClient.delete(`/api/v1/admin/languages/${code}`)
    notifyServerSuccess('Удалено', 'Язык удалён')
    await load()
  } catch (e) {
    notifyServerError(e?.response?.data?.message || e?.response?.data?.error)
  }
}

onMounted(load)
</script>

<style scoped>
.toolbar {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
}

.danger-link {
  color: #ff4d4f;
}

.danger-link.disabled {
  color: rgba(0, 0, 0, 0.25);
  cursor: not-allowed;
}
</style>
