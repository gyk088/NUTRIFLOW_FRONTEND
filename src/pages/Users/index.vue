<template>
  <a-table :data-source="users" :loading="loading" :columns="columns" row-key="id" :pagination="{ pageSize: 20 }">
    <template #bodyCell="{ column, record }">
      <template v-if="column.key === 'role'">
        <a-select
          v-model:value="record.role"
          :options="roleOptions"
          style="width: 180px"
          :disabled="record.id === auth.user?.id"
          @change="(role) => changeRole(record, role)"
        />
      </template>
      <template v-else-if="column.key === 'ctime'">
        {{ new Date(record.ctime).toLocaleDateString() }}
      </template>
    </template>
  </a-table>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import apiClient from '@/services/api.js'
import { notifyServerError, notifyServerSuccess } from '@/services/notify.js'
import { ROLES, TEXT_ROLES } from '@/services/const.js'
import { useAuth } from '@/stores/auth.js'

const auth = useAuth()
const users = ref([])
const loading = ref(false)

const roleOptions = Object.values(ROLES).map((value) => ({ value, label: TEXT_ROLES[value] }))

const columns = [
  { title: 'Email', dataIndex: 'email', key: 'email' },
  { title: 'Имя', dataIndex: 'name', key: 'name' },
  { title: 'Роль', key: 'role', width: 200 },
  { title: 'Регистрация', key: 'ctime', width: 140 }
]

async function load() {
  loading.value = true
  try {
    const { data } = await apiClient.get('/api/v1/users')
    users.value = data
  } catch (e) {
    notifyServerError(e?.response?.data?.message || e?.response?.data?.error)
  } finally {
    loading.value = false
  }
}

async function changeRole(record, role) {
  const previousRole = record.role
  try {
    await apiClient.put(`/api/v1/users/${record.id}/role`, { role })
    notifyServerSuccess('Сохранено', `Роль пользователя ${record.email} изменена`)
  } catch (e) {
    record.role = previousRole
    notifyServerError(e?.response?.data?.message || e?.response?.data?.error)
  }
}

onMounted(load)
</script>
