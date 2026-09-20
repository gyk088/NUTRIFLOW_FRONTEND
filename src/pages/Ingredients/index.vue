<template>
  <div>
    <div class="toolbar">
      <a-input-search v-model:value="search" placeholder="Поиск по названию" style="width: 320px" @search="load" allow-clear />
      <a-button type="primary" @click="router.push({ name: 'ingredient-new' })">
        <template #icon><PlusOutlined /></template>
        Создать ингредиент
      </a-button>
    </div>

    <a-table :data-source="ingredients" :loading="loading" :columns="columns" row-key="id" :pagination="{ pageSize: 20 }">
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'image'">
          <a-avatar shape="square" :src="record.image_url" v-if="record.image_url" />
        </template>
        <template v-else-if="column.key === 'name'"> {{ record.name_ru }} / {{ record.name_en }} </template>
        <template v-else-if="column.key === 'actions'">
          <a-space>
            <a @click="router.push({ name: 'ingredient-edit', params: { id: record.id } })">Изменить</a>
            <a-popconfirm title="Удалить ингредиент?" ok-text="Удалить" cancel-text="Отмена" @confirm="remove(record.id)">
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

const router = useRouter()
const ingredients = ref([])
const loading = ref(false)
const search = ref('')

const columns = [
  { title: '', key: 'image', width: 56 },
  { title: 'Название (RU / EN)', key: 'name' },
  { title: 'Калории / 100г', dataIndex: 'calories', key: 'calories', width: 140 },
  { title: 'Белки', dataIndex: 'protein', key: 'protein', width: 100 },
  { title: 'Углеводы', dataIndex: 'carbs', key: 'carbs', width: 100 },
  { title: 'Жиры', dataIndex: 'fat', key: 'fat', width: 100 },
  { title: '', key: 'actions', width: 160 }
]

async function load() {
  loading.value = true
  try {
    const { data } = await apiClient.get('/api/v1/app/ingredients', { params: { search: search.value || undefined } })
    ingredients.value = data
  } catch (e) {
    notifyServerError(e?.response?.data?.message || e?.response?.data?.error)
  } finally {
    loading.value = false
  }
}

async function remove(id) {
  try {
    await apiClient.delete(`/api/v1/admin/ingredients/${id}`)
    notifyServerSuccess('Удалено', 'Ингредиент удалён')
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
