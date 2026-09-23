<template>
  <div>
    <a-tabs v-model:active-key="activeKey">
      <a-tab-pane v-for="translation in translations" :key="translation.language_code" :tab="tabLabel(translation.language_code)">
        <slot :translation="translation" />
      </a-tab-pane>
    </a-tabs>

    <a-dropdown v-if="addableLanguages.length">
      <a-button type="dashed" block>
        <template #icon><PlusOutlined /></template>
        Добавить язык
      </a-button>
      <template #overlay>
        <a-menu @click="onAddLanguage">
          <a-menu-item v-for="lang in addableLanguages" :key="lang.code">{{ lang.name }}</a-menu-item>
        </a-menu>
      </template>
    </a-dropdown>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { PlusOutlined } from '@ant-design/icons-vue'

// translations: [{ language_code, ...сущностные поля }] — владеет им родитель.
// languages: [{ code, name }] — полный список настроенных языков.
const props = defineProps({
  translations: { type: Array, required: true },
  languages: { type: Array, required: true }
})
const emit = defineEmits(['add-language'])

const activeKey = ref(props.translations[0]?.language_code)

watch(
  () => props.translations.map((t) => t.language_code).join(','),
  () => {
    if (!props.translations.some((t) => t.language_code === activeKey.value)) {
      activeKey.value = props.translations[props.translations.length - 1]?.language_code
    }
  }
)

const addableLanguages = computed(() => {
  const used = new Set(props.translations.map((t) => t.language_code))
  return props.languages.filter((l) => !used.has(l.code))
})

function tabLabel(code) {
  return props.languages.find((l) => l.code === code)?.name || code
}

function onAddLanguage({ key }) {
  activeKey.value = key
  emit('add-language', key)
}
</script>
