<template>
  <a-upload
    list-type="picture-card"
    :file-list="fileList"
    :custom-request="handleUpload"
    :before-upload="beforeUpload"
    :max-count="1"
    accept="image/jpeg,image/png,image/webp,image/gif"
    @remove="handleRemove"
  >
    <div v-if="!modelValue">
      <LoadingOutlined v-if="uploading" />
      <PlusOutlined v-else />
      <div style="margin-top: 8px">Загрузить</div>
    </div>
  </a-upload>
</template>

<script setup>
import { computed, ref } from 'vue'
import { PlusOutlined, LoadingOutlined } from '@ant-design/icons-vue'
import apiClient from '@/services/api.js'
import { notifyServerError } from '@/services/notify.js'

const props = defineProps({ modelValue: String })
const emit = defineEmits(['update:modelValue'])

const uploading = ref(false)

const fileList = computed(() =>
  props.modelValue ? [{ uid: '-1', name: 'image', status: 'done', url: props.modelValue }] : []
)

function beforeUpload(file) {
  const isLt5M = file.size / 1024 / 1024 < 5
  if (!isLt5M) notifyServerError('Файл должен быть меньше 5 МБ')
  return isLt5M
}

async function handleUpload({ file, onSuccess, onError }) {
  const formData = new FormData()
  formData.append('file', file)
  uploading.value = true
  try {
    const { data } = await apiClient.post('/api/v1/admin/files', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    emit('update:modelValue', data.url)
    onSuccess(data)
  } catch (e) {
    notifyServerError(e?.response?.data?.error || 'Не удалось загрузить файл')
    onError(e)
  } finally {
    uploading.value = false
  }
}

function handleRemove() {
  emit('update:modelValue', '')
}
</script>
