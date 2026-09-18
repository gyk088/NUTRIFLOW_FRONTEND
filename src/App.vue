<template>
  <a-config-provider :locale="locale" :theme="{ token: { colorPrimary: '#4CAF50' } }">
    <component :is="layoutName" />
  </a-config-provider>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import ruRU from 'ant-design-vue/es/locale/ru_RU'
import dayjs from 'dayjs'
import 'dayjs/locale/ru'
import EmptyLayout from '@/layouts/Empty.vue'
import MainLayout from '@/layouts/Home.vue'

dayjs.locale('ru')

const route = useRoute()
const locale = ruRU

const layoutName = computed(() => {
  switch (route.meta.layout) {
    case 'main':
      return MainLayout
    default:
      return EmptyLayout
  }
})
</script>
