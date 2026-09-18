<template>
  <a-card class="auth-card" title="NutriFlow Admin">
    <a-form layout="vertical" :model="form" @finish="onSubmit">
      <a-form-item
        label="Email"
        name="email"
        :rules="[
          { required: true, message: 'Введите email' },
          { type: 'email', message: 'Некорректный email' }
        ]"
      >
        <a-input v-model:value="form.email" placeholder="you@example.com" autocomplete="username" />
      </a-form-item>

      <a-form-item label="Пароль" name="password" :rules="[{ required: true, message: 'Введите пароль' }]">
        <a-input-password v-model:value="form.password" placeholder="Введите пароль" autocomplete="current-password" />
      </a-form-item>

      <a-button type="primary" html-type="submit" block :loading="auth.loading">Войти</a-button>
    </a-form>
  </a-card>
</template>

<script setup>
import { reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const auth = useAuth()

const form = reactive({ email: '', password: '' })

async function onSubmit() {
  const success = await auth.login(form.email, form.password)
  if (success) {
    router.push(route.query.redirect || { name: 'ingredients' })
  }
}
</script>

<style scoped>
.auth-card {
  width: 380px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  border-radius: 12px;
}
</style>
