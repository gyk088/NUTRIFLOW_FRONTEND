<template>
  <a-layout style="min-height: 100vh">
    <a-layout-sider :width="240" collapsible v-model:collapsed="collapsed" theme="dark">
      <div class="logo">{{ collapsed ? 'NF' : 'NutriFlow' }}</div>
      <a-menu theme="dark" mode="inline" :selectedKeys="[selectedKey]" @click="onMenuClick">
        <a-menu-item key="ingredients">
          <AppleOutlined />
          <span>Ингредиенты</span>
        </a-menu-item>
        <a-menu-item key="recipes">
          <BookOutlined />
          <span>Рецепты</span>
        </a-menu-item>
        <a-menu-item key="tags">
          <TagsOutlined />
          <span>Теги</span>
        </a-menu-item>
        <a-menu-item key="users" v-if="auth.isSuperAdmin">
          <TeamOutlined />
          <span>Пользователи</span>
        </a-menu-item>
      </a-menu>

      <div class="logout-wrapper">
        <a-button type="text" class="logout-btn" @click="handleLogout" :loading="auth.loading">
          <template #icon><LogoutOutlined /></template>
          <span v-if="!collapsed">Выйти</span>
        </a-button>
      </div>
    </a-layout-sider>

    <a-layout>
      <a-layout-header class="header">
        <span class="page-title">{{ route.meta.title }}</span>
        <span class="user-email">{{ auth.user?.email }}</span>
      </a-layout-header>
      <a-layout-content class="content">
        <router-view />
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Modal } from 'ant-design-vue'
import { AppleOutlined, BookOutlined, TagsOutlined, TeamOutlined, LogoutOutlined } from '@ant-design/icons-vue'
import { useAuth } from '@/stores/auth'

const collapsed = ref(false)
const router = useRouter()
const route = useRoute()
const auth = useAuth()

// Первый URL-сегмент задаёт активный пункт меню и для списка, и для
// страниц создания/редактирования (/recipes/new, /recipes/:id -> "recipes").
const selectedKey = ref(route.path.split('/')[1])
router.afterEach((to) => {
  selectedKey.value = to.path.split('/')[1]
})

function onMenuClick({ key }) {
  router.push({ name: key })
}

function handleLogout() {
  Modal.confirm({
    title: 'Выход из системы',
    content: 'Вы уверены, что хотите выйти?',
    okText: 'Да, выйти',
    cancelText: 'Отмена',
    onOk: () => auth.logout()
  })
}
</script>

<style scoped>
.logo {
  height: 48px;
  margin: 16px;
  color: #fff;
  font-weight: 700;
  font-size: 18px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 8px;
}

.logout-wrapper {
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.logout-btn {
  width: 100%;
  color: #f09090;
}

.header {
  background: #fff;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.page-title {
  font-size: 18px;
  font-weight: 600;
}

.user-email {
  color: rgba(0, 0, 0, 0.45);
}

.content {
  margin: 16px;
  padding: 24px;
  background: #fff;
  border-radius: 8px;
}
</style>
