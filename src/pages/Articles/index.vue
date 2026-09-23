<template>
  <div>
    <div class="toolbar">
      <a-input-search v-model:value="search" placeholder="Поиск по названию" style="width: 320px" @search="load" allow-clear />
      <a-button type="primary" @click="router.push({ name: 'article-new' })">
        <template #icon><PlusOutlined /></template>
        Создать статью
      </a-button>
    </div>

    <a-table :data-source="articles" :loading="loading" :columns="columns" row-key="id" :pagination="{ pageSize: 20 }">
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'image'">
          <a-avatar shape="square" :src="record.image_url" v-if="record.image_url" />
        </template>
        <template v-else-if="column.key === 'title'">
          {{ record.title }}
          <template v-if="record.availableLanguages?.length > 1">
            <a-tag v-for="code in record.availableLanguages" :key="code">{{ code }}</a-tag>
          </template>
        </template>
        <template v-else-if="column.key === 'tags'">
          <a-space wrap>
            <a-tag v-for="tag in record.tags" :key="tag.id">{{ tag.name }}</a-tag>
          </a-space>
        </template>
        <template v-else-if="column.key === 'ctime'">
          {{ dayjs(record.ctime).format('DD.MM.YYYY HH:mm') }}
        </template>
        <template v-else-if="column.key === 'actions'">
          <a-space>
            <a @click="router.push({ name: 'article-edit', params: { id: record.id } })">Изменить</a>
            <a-popconfirm title="Удалить статью?" ok-text="Удалить" cancel-text="Отмена" @confirm="remove(record.id)">
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
import dayjs from 'dayjs'
import { PlusOutlined } from '@ant-design/icons-vue'
import apiClient from '@/services/api.js'
import { notifyServerError, notifyServerSuccess } from '@/services/notify.js'

const router = useRouter()
const articles = ref([])
const loading = ref(false)
const search = ref('')

const columns = [
  { title: '', key: 'image', width: 56 },
  { title: 'Название', key: 'title' },
  { title: 'Теги', key: 'tags' },
  { title: 'Создана', key: 'ctime', width: 160 },
  { title: '', key: 'actions', width: 160 }
]

async function load() {
  loading.value = true
  try {
    const { data } = await apiClient.get('/api/v1/app/articles', { params: { search: search.value || undefined } })
    articles.value = data
  } catch (e) {
    notifyServerError(e?.response?.data?.message || e?.response?.data?.error)
  } finally {
    loading.value = false
  }
}

async function remove(id) {
  try {
    await apiClient.delete(`/api/v1/admin/articles/${id}`)
    notifyServerSuccess('Удалено', 'Статья удалена')
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
