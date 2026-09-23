<template>
  <div class="editor" :class="{ focused }">
    <div class="toolbar" v-if="editor">
      <a-space size="small" wrap>
        <a-button size="small" :type="editor.isActive('bold') ? 'primary' : 'default'" @click="editor.chain().focus().toggleBold().run()">
          <BoldOutlined />
        </a-button>
        <a-button size="small" :type="editor.isActive('italic') ? 'primary' : 'default'" @click="editor.chain().focus().toggleItalic().run()">
          <ItalicOutlined />
        </a-button>
        <a-button size="small" :type="editor.isActive('strike') ? 'primary' : 'default'" @click="editor.chain().focus().toggleStrike().run()">
          <StrikethroughOutlined />
        </a-button>
        <a-divider type="vertical" />
        <a-button
          size="small"
          :type="editor.isActive('heading', { level: 2 }) ? 'primary' : 'default'"
          @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
        >
          H2
        </a-button>
        <a-button
          size="small"
          :type="editor.isActive('heading', { level: 3 }) ? 'primary' : 'default'"
          @click="editor.chain().focus().toggleHeading({ level: 3 }).run()"
        >
          H3
        </a-button>
        <a-divider type="vertical" />
        <a-button size="small" :type="editor.isActive('bulletList') ? 'primary' : 'default'" @click="editor.chain().focus().toggleBulletList().run()">
          <UnorderedListOutlined />
        </a-button>
        <a-button size="small" :type="editor.isActive('orderedList') ? 'primary' : 'default'" @click="editor.chain().focus().toggleOrderedList().run()">
          <OrderedListOutlined />
        </a-button>
        <a-button size="small" :type="editor.isActive('blockquote') ? 'primary' : 'default'" @click="editor.chain().focus().toggleBlockquote().run()">
          <BlockOutlined />
        </a-button>
        <a-divider type="vertical" />
        <a-button size="small" :type="editor.isActive('link') ? 'primary' : 'default'" @click="setLink">
          <LinkOutlined />
        </a-button>
        <a-divider type="vertical" />
        <a-button size="small" @click="editor.chain().focus().undo().run()">
          <UndoOutlined />
        </a-button>
        <a-button size="small" @click="editor.chain().focus().redo().run()">
          <RedoOutlined />
        </a-button>
      </a-space>
    </div>
    <EditorContent :editor="editor" class="editor-content" />
  </div>
</template>

<script setup>
import { onBeforeUnmount, ref, watch } from 'vue'
import { Editor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import {
  BoldOutlined,
  ItalicOutlined,
  StrikethroughOutlined,
  UnorderedListOutlined,
  OrderedListOutlined,
  BlockOutlined,
  LinkOutlined,
  UndoOutlined,
  RedoOutlined
} from '@ant-design/icons-vue'

const props = defineProps({ modelValue: String })
const emit = defineEmits(['update:modelValue'])

const focused = ref(false)

const editor = new Editor({
  content: props.modelValue || '',
  extensions: [StarterKit, Link.configure({ openOnClick: false })],
  onUpdate: ({ editor: e }) => emit('update:modelValue', e.getHTML()),
  onFocus: () => (focused.value = true),
  onBlur: () => (focused.value = false)
})

watch(
  () => props.modelValue,
  (value) => {
    if (value !== editor.getHTML()) editor.commands.setContent(value || '', { emitUpdate: false })
  }
)

function setLink() {
  const previousUrl = editor.getAttributes('link').href
  const url = window.prompt('Ссылка', previousUrl)
  if (url === null) return
  if (url === '') {
    editor.chain().focus().extendMarkRange('link').unsetLink().run()
    return
  }
  editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
}

onBeforeUnmount(() => editor.destroy())
</script>

<style scoped>
.editor {
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  transition: border-color 0.2s;
}

.editor.focused {
  border-color: #4096ff;
}

.toolbar {
  padding: 8px;
  border-bottom: 1px solid #f0f0f0;
}

.editor-content {
  padding: 12px;
  min-height: 240px;
}

.editor-content :deep(.ProseMirror) {
  min-height: 220px;
  outline: none;
}

.editor-content :deep(p) {
  margin: 0 0 0.75em;
}

.editor-content :deep(blockquote) {
  border-left: 3px solid #d9d9d9;
  margin: 0 0 0.75em;
  padding-left: 12px;
  color: rgba(0, 0, 0, 0.65);
}
</style>
