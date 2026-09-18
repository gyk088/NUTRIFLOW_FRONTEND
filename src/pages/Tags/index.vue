<template>
  <div>
    <div class="toolbar">
      <a-select
        v-model:value="typeFilter"
        style="width: 240px"
        placeholder="Все типы"
        allow-clear
        :options="typeOptions"
        @change="load"
      />
      <a-button type="primary" @click="router.push({ name: 'tag-new' })">
        <template #icon><PlusOutlined /></template>
        Создать тег
      </a-button>
    </div>

    <a-table :data-source="tags" :loading="loading" :columns="columns" row-key="id" :pagination="false">
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'type'">
          {{ TEXT_TAG_TYPES[record.type] || record.type }}
        </template>
        <template v-else-if="column.key === 'name'"> {{ record.name_ru }} / {{ record.name_en }} </template>
        <template v-else-if="column.key === 'actions'">
          <a-space>
            <a @click="router.push({ name: 'tag-edit', params: { id: record.id } })">Изменить</a>
            <a-popconfirm title="Удалить тег?" ok-text="Удалить" cancel-text="Отмена" @confirm="remove(record.id)">
              <a class="danger-link">Удалить</a>
            </a-popconfirm>
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
import { TAG_TYPES, TEXT_TAG_TYPES } from '@/services/const.js'

const router = useRouter()
const tags = ref([])
const loading = ref(false)
const typeFilter = ref(undefined)

const typeOptions = Object.values(TAG_TYPES).map((value) => ({
  value,
  label: TEXT_TAG_TYPES[value]
}))

const columns = [
  { title: 'Тип', key: 'type' },
  { title: 'Название (RU / EN)', key: 'name' },
  { title: '', key: 'actions', width: 160 }
]

async function load() {
  loading.value = true
  try {
    const { data } = await apiClient.get('/api/v1/tags', { params: { type: typeFilter.value } })
    tags.value = data
  } catch (e) {
    notifyServerError(e?.response?.data?.message || e?.response?.data?.error)
  } finally {
    loading.value = false
  }
}

async function remove(id) {
  try {
    await apiClient.delete(`/api/v1/tags/${id}`)
    notifyServerSuccess('Удалено', 'Тег удалён')
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
</style>
