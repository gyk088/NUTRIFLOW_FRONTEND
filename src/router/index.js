import { createRouter, createWebHistory } from 'vue-router'
import { useAuth } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/auth',
      name: 'auth',
      component: () => import('@/pages/Auth/index.vue'),
      meta: { title: 'Вход', layout: 'empty', public: true }
    },
    {
      path: '/',
      redirect: '/ingredients'
    },
    {
      path: '/ingredients',
      name: 'ingredients',
      component: () => import('@/pages/Ingredients/index.vue'),
      meta: { title: 'Ингредиенты', layout: 'main' }
    },
    {
      path: '/ingredients/new',
      name: 'ingredient-new',
      component: () => import('@/pages/Ingredients/Edit.vue'),
      meta: { title: 'Новый ингредиент', layout: 'main' }
    },
    {
      path: '/ingredients/:id',
      name: 'ingredient-edit',
      component: () => import('@/pages/Ingredients/Edit.vue'),
      meta: { title: 'Ингредиент', layout: 'main' }
    },
    {
      path: '/recipes',
      name: 'recipes',
      component: () => import('@/pages/Recipes/index.vue'),
      meta: { title: 'Рецепты', layout: 'main' }
    },
    {
      path: '/recipes/new',
      name: 'recipe-new',
      component: () => import('@/pages/Recipes/Edit.vue'),
      meta: { title: 'Новый рецепт', layout: 'main' }
    },
    {
      path: '/recipes/:id',
      name: 'recipe-edit',
      component: () => import('@/pages/Recipes/Edit.vue'),
      meta: { title: 'Рецепт', layout: 'main' }
    },
    {
      path: '/articles',
      name: 'articles',
      component: () => import('@/pages/Articles/index.vue'),
      meta: { title: 'Статьи', layout: 'main' }
    },
    {
      path: '/articles/new',
      name: 'article-new',
      component: () => import('@/pages/Articles/Edit.vue'),
      meta: { title: 'Новая статья', layout: 'main' }
    },
    {
      path: '/articles/:id',
      name: 'article-edit',
      component: () => import('@/pages/Articles/Edit.vue'),
      meta: { title: 'Статья', layout: 'main' }
    },
    {
      path: '/languages',
      name: 'languages',
      component: () => import('@/pages/Languages/index.vue'),
      meta: { title: 'Языки', layout: 'main' }
    },
    {
      path: '/languages/new',
      name: 'language-new',
      component: () => import('@/pages/Languages/Edit.vue'),
      meta: { title: 'Новый язык', layout: 'main' }
    },
    {
      path: '/languages/:code',
      name: 'language-edit',
      component: () => import('@/pages/Languages/Edit.vue'),
      meta: { title: 'Язык', layout: 'main' }
    },
    {
      path: '/tags',
      name: 'tags',
      component: () => import('@/pages/Tags/index.vue'),
      meta: { title: 'Теги', layout: 'main' }
    },
    {
      path: '/tags/new',
      name: 'tag-new',
      component: () => import('@/pages/Tags/Edit.vue'),
      meta: { title: 'Новый тег', layout: 'main' }
    },
    {
      path: '/tags/:id',
      name: 'tag-edit',
      component: () => import('@/pages/Tags/Edit.vue'),
      meta: { title: 'Тег', layout: 'main' }
    },
    {
      path: '/users',
      name: 'users',
      component: () => import('@/pages/Users/index.vue'),
      meta: { title: 'Пользователи', layout: 'main', superAdminOnly: true }
    }
  ]
})

router.beforeEach((to) => {
  const auth = useAuth()
  if (!to.meta.public && !auth.isAuthenticated) {
    return { name: 'auth', query: { redirect: to.fullPath } }
  }
  if (to.name === 'auth' && auth.isAuthenticated) {
    return { name: 'ingredients' }
  }
  if (to.meta.superAdminOnly && !auth.isSuperAdmin) {
    return { name: 'ingredients' }
  }
  return true
})

export default router
