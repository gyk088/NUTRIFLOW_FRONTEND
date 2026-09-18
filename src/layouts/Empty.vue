<template>
  <div class="empty-layout">
    <router-view />
  </div>
</template>

<style scoped>
.empty-layout {
  min-height: 100vh;
  min-width: 100vw;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f2f5;
}
</style>
