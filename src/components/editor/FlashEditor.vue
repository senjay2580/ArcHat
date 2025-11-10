
<template>
  <div class="flash-editor-container">
    <el-image-viewer
      v-if="showImageViewer"
      :url-list="imageViewerList"
      :initial-index="imageViewerIndex"
      @close="showImageViewer = false"
      teleported
    />
    <div v-if="editor" class="editor-toolbar">
      <div class="toolbar-left">
        <button @click="editor.chain().focus().toggleBold().run()" :class="{ 'is-active': editor.isActive('bold') }" title="Bold"><b>B</b></button>
        <button @click="editor.chain().focus().toggleItalic().run()" :class="{ 'is-active': editor.isActive('italic') }" title="Italic"><i>I</i></button>
        <button @click="editor.chain().focus().toggleUnderline().run()" :class="{ 'is-active': editor.isActive('underline') }" title="Underline"><u>U</u></button>
        <button @click="editor.chain().focus().toggleStrike().run()" :class="{ 'is-active': editor.isActive('strike') }" title="Strikethrough"><s>S</s></button>
        <button @click="toggleColorPicker" title="Text Color" ref="colorButton" class="color-button">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M9.62 12L12 5.67L14.38 12H9.62M11 3L5.5 17h2.25l1.12-3h6.25l1.12 3H18.5L13 3h-2Z"/><rect x="4" y="20" width="16" height="3" :fill="currentTextColor" rx="1"/></svg>
        </button>
        <div class="toolbar-divider"></div>
        <button @click="editor.chain().focus().toggleHeading({ level: 1 }).run()" :class="{ 'is-active': editor.isActive('heading', { level: 1 }) }" title="Heading 1">H1</button>
        <button @click="editor.chain().focus().toggleHeading({ level: 2 }).run()" :class="{ 'is-active': editor.isActive('heading', { level: 2 }) }" title="Heading 2">H2</button>
        <div class="toolbar-divider"></div>
        <button @click="editor.chain().focus().toggleBulletList().run()" :class="{ 'is-active': editor.isActive('bulletList') }" title="Bullet List">&#x2022;</button>
        <button @click="editor.chain().focus().toggleOrderedList().run()" :class="{ 'is-active': editor.isActive('orderedList') }" title="Ordered List">1.</button>
        <button @click="editor.chain().focus().toggleBlockquote().run()" :class="{ 'is-active': editor.isActive('blockquote') }" title="Blockquote">&#x201C;&#x201D;</button>
        <button @click="toggleCustomEmojiPicker" title="Emoji" ref="emojiButton">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8s-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8S14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8S7 8.67 7 9.5S7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/></svg>
        </button>
        <button @click="insertImage" title="Image">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>
        </button>
        <button @click="editor.chain().focus().toggleCodeBlock().run()" :class="{ 'is-active': editor.isActive('codeBlock') }" title="Code Block">&lt;/&gt;</button>
        <div class="toolbar-divider"></div>
        <button @click="editor.chain().focus().undo().run()" :disabled="!editor.can().undo()" title="Undo">&#x21A9;</button>
        <button @click="editor.chain().focus().redo().run()" :disabled="!editor.can().redo()" title="Redo">&#x21AA;</button>
        <div class="toolbar-divider"></div>
        <button @click="emit('request-fullscreen')" title="Fullscreen">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M5 19h4v-2H7v-2H5v4zM5 7h2V5h2V3H5v4zm14 12h-4v2h4v-4h-2v2zm0-14h-2v2h-2v2h4V3z"/></svg>
        </button>
      
      </div>
      <div class="toolbar-right">
       
        <arc-tooltip content="Ctrl + S 保存" placement="top" effect="dark">
          <danger-button @click="saveContent" :disabled="!canSave" type="gradient-green">
            <span  style="display: flex;align-items: center; color: #c9ea63 !important;"><svg xmlns="http://www.w3.org/2000/svg" width="20"  viewBox="0 0 24 24"><!-- Icon from Material Symbols by Google - https://github.com/google/material-design-icons/blob/master/LICENSE --><path fill="currentColor" d="M5 21q-.825 0-1.412-.587T3 19V5q0-.825.588-1.412T5 3h11.175q.4 0 .763.15t.637.425l2.85 2.85q.275.275.425.638t.15.762V19q0 .825-.587 1.413T19 21zm7-3q1.25 0 2.125-.875T15 15t-.875-2.125T12 12t-2.125.875T9 15t.875 2.125T12 18m-5-8h7q.425 0 .713-.288T15 9V7q0-.425-.288-.712T14 6H7q-.425 0-.712.288T6 7v2q0 .425.288.713T7 10"/></svg> <b style="color: #fff; margin-left: 5px;">保存</b> </span>
          </danger-button>
        </arc-tooltip>
            
      </div>
    </div>
    <editor-content :editor="editor" class="editor-content"/>
    <CustomEmojiPicker 
      :show="showCustomEmojiPicker" 
      :style="emojiPickerStyle"
      @select="onCustomEmojiSelect"
      @close="showCustomEmojiPicker = false"
    />
    <!-- Color Picker Component -->
    <ColorPicker 
      :show="showColorPicker" 
      :style="colorPickerStyle"
      @select="setTextColor"
      @remove="removeTextColor"
      @close="showColorPicker = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, provide, onMounted, onUnmounted } from 'vue';
import { useEditor, EditorContent, VueRenderer, VueNodeViewRenderer } from '@tiptap/vue-3';
import tippy from 'tippy.js';
import StarterKit from '@tiptap/starter-kit';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { createLowlight } from 'lowlight';
import CodeBlockWithButtons from '@/components/misc/CodeBlockWithButtons.vue';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import python from 'highlight.js/lib/languages/python';
import java from 'highlight.js/lib/languages/java';
import css from 'highlight.js/lib/languages/css';
import html from 'highlight.js/lib/languages/xml';
import json from 'highlight.js/lib/languages/json';
import bash from 'highlight.js/lib/languages/bash';
import c from 'highlight.js/lib/languages/c';
import cpp from 'highlight.js/lib/languages/cpp';
import go from 'highlight.js/lib/languages/go';
import ruby from 'highlight.js/lib/languages/ruby';
import rust from 'highlight.js/lib/languages/rust';
import swift from 'highlight.js/lib/languages/swift';
import yaml from 'highlight.js/lib/languages/yaml';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import Blockquote from '@tiptap/extension-blockquote';
import { Emoji, gitHubEmojis } from '@tiptap/extension-emoji';
import Mention from '@tiptap/extension-mention';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';

// Extend the default Image extension to allow custom attributes
const CustomImage = Image.extend({
  addNodeView() {
    return VueNodeViewRenderer(ImageView);
  },

  addAttributes() {
    return {
      ...this.parent?.(), // Keep the parent attributes
      class: {
        default: null, // Allow class attribute
      },
      style: {
        default: null, // Allow style attribute
      },
    };
  },
});
import MentionList from '@/components/editor/MentionList.vue';
import EmojiList from '@/components/interaction/EmojiList.vue';
import CustomEmojiPicker from '@/components/interaction/CustomEmojiPicker.vue';
import ColorPicker from '@/components/form/ColorPicker.vue';
import ImageView from '@/components/interaction/ImageView.vue';
import ArcTooltip from '@/components/misc/ArcTooltip.vue';
import DangerButton from '@/components/form/DangerButton.vue';
import { watch } from 'vue';
import { ElImageViewer } from 'element-plus';
// 创建 lowlight 实例
const lowlight = createLowlight();

// 注册语言
lowlight.register('javascript', javascript);
lowlight.register('typescript', typescript);
lowlight.register('python', python);
lowlight.register('java', java);
lowlight.register('css', css);
lowlight.register('html', html);
lowlight.register('json', json);
lowlight.register('bash', bash);
lowlight.register('c', c);
lowlight.register('cpp', cpp);
lowlight.register('go', go);
lowlight.register('ruby', ruby);
lowlight.register('rust', rust);
lowlight.register('swift', swift);
lowlight.register('typescript', typescript);
lowlight.register('yaml', yaml);

const props = defineProps({
  initialContent: {
    type: String,
    default: '',
  }
});

const emit = defineEmits(['update:modelValue', 'save-draft', 'request-fullscreen']);

const emojiButton = ref(null);
const showCustomEmojiPicker = ref(false);
const emojiPickerStyle = ref({});

// Color picker state
const colorButton = ref(null);
const showColorPicker = ref(false);
const colorPickerStyle = ref({});
const currentTextColor = ref('#000000');

// Image viewer state
const showImageViewer = ref(false);
const imageViewerList = ref([]);
const imageViewerIndex = ref(0);

const toggleCustomEmojiPicker = () => {
  if (showCustomEmojiPicker.value) {
    showCustomEmojiPicker.value = false;
    return;
  }

  const button = emojiButton.value;
  if (button) {
    const rect = button.getBoundingClientRect();
    emojiPickerStyle.value = {
      // Position it fixed relative to the viewport
      position: 'fixed',
      top: `${rect.bottom + 10}px`, // 5px offset from the button
      left: `${rect.left}px`,
    };
    showCustomEmojiPicker.value = true;
  }
};

const openImageViewer = (src) => {
  const images = [];
  if (editor.value) {
    editor.value.state.doc.descendants((node) => {
      if (node.type.name === 'image') {
        images.push(node.attrs.src);
      }
    });
  }
  const currentIndex = images.findIndex(imgSrc => imgSrc === src);
  if (currentIndex !== -1) {
    imageViewerList.value = images;
    imageViewerIndex.value = currentIndex;
    showImageViewer.value = true;
  }
};

provide('openImageViewer', openImageViewer);

const onCustomEmojiSelect = (emoji) => {
  editor.value.chain().focus().setImage({
    src: emoji.src,
    alt: emoji.name,
    title: emoji.name,
    class: 'inline-emoji', // For non-selectable/draggable styles
   
  }).run();
  showCustomEmojiPicker.value = false;
};

// Color picker functions
const toggleColorPicker = () => {
  if (showColorPicker.value) {
    showColorPicker.value = false;
    return;
  }

  const button = colorButton.value;
  if (button) {
    const rect = button.getBoundingClientRect();
    colorPickerStyle.value = {
      position: 'fixed',
      top: `${rect.bottom + 10}px`,
      left: `${rect.left}px`,
    };
    showColorPicker.value = true;
  }
};

const setTextColor = (color) => {
  if (editor.value) {
    editor.value.chain().focus().setColor(color).run();
    currentTextColor.value = color;
    showColorPicker.value = false;
  }
};

const removeTextColor = () => {
  if (editor.value) {
    editor.value.chain().focus().unsetColor().run();
    currentTextColor.value = '#000000';
    showColorPicker.value = false;
  }
};

// 字数统计功能
const wordCount = computed(() => {
  if (!editor.value) return 0;
  const text = editor.value.getText();
  return text.length;
});

const contentStats = computed(() => {
  if (!editor.value) return { characters: 0, images: 0, codeBlocks: 0 };
  
  const text = editor.value.getText();

  return {
    characters: text.length,

  };
});

// Mention suggestion list - you can customize this
const mentionSuggestions = [
  { id: 1, label: 'Ice Box' },
  { id: 2, label: 'Depending' },
  { id: 3, label: 'Completed' },
  { id: 4, label: 'In Progress' },
  { id: 5, label: 'In Review' },
  { id: 6, label: 'Backlog' },
  { id: 7, label: 'Cancelled' },
  { id: 8, label: 'Deferred' },
  { id: 9, label: 'Done' },
  { id: 10, label: 'In Testing' },
  { id: 11, label: 'In Review' },

];

// Unified image upload function
const uploadImage = (file) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    const src = e.target?.result;
    if (src && editor.value) {
      // Insert image with a default size, e.g., medium
      editor.value.chain().focus().setImage({ src, class: 'image-medium' }).run();
    }
  };
  reader.readAsDataURL(file);
};

// 1. Trigger file input on button click
const insertImage = () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.onchange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadImage(file);
    }
  };
  input.click();
};

// Handle image paste
const handlePaste = (view, event) => {
  const items = event.clipboardData?.items;
  if (!items) return false;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item.type.indexOf('image') !== -1) {
      event.preventDefault();
      const file = item.getAsFile();
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const src = e.target?.result;
          if (src && editor.value) {
            editor.value.chain().focus().setImage({ src }).run();
          }
        };
        reader.readAsDataURL(file);
      }
      return true;
    }
  }
  return false;
};

// 计算是否可以保存
const canSave = computed(() => {
  if (!editor.value) return false;
  const content = editor.value.getHTML();
  const plainText = new DOMParser().parseFromString(content, 'text/html').body.textContent || "";
  return plainText.trim().length > 0;
});

const editor = useEditor({
  editorProps: {
    attributes: {
      spellcheck: 'false',
    },
    handleKeyDown: (view, event) => {
      // 处理Markdown快捷键
      if (event.key === 'Enter') {
        const { state } = view;
        const { selection } = state;
        const { $from } = selection;
        const currentLine = $from.nodeBefore?.textContent || '';
        
        // 检查是否在代码块语法中
        if (currentLine.trim().startsWith('```')) {
          // 让TipTap处理代码块创建
          return false;
        }
      }
      return false;
    },
    handleDrop: function(view, event, slice, moved) {
      if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]) {
        event.preventDefault();
        const file = event.dataTransfer.files[0];
        if (file.type.startsWith('image/')) {
          uploadImage(file);
        }
        return true; // Indicate that we've handled the drop
      }
      return false;
    },
    handlePaste: handlePaste,
  },
  content: props.initialContent,
  extensions: [
    Placeholder.configure({
      placeholder: '开始记录你的想法...',
    }),
    StarterKit.configure({
      codeBlock: false, // 禁用默认的代码块，使用带高亮的版本
      blockquote: false, // 禁用默认的blockquote，使用自定义配置
    }),
    CodeBlockLowlight.extend({
      addNodeView() {
        return VueNodeViewRenderer(CodeBlockWithButtons)
      },
    }).configure({
      lowlight,
    }),
    Blockquote.configure({
      HTMLAttributes: {
        class: 'custom-blockquote',
      },
    }),
    // Our custom Image extension that allows class and style attributes
    CustomImage.configure({
      inline: true,
      allowBase64: true,
    }),
    // Standard Link extension
    Link.configure({
      openOnClick: true,
    }),
    // Standard Emoji extension
    Emoji.configure({
      emojis: gitHubEmojis,
      enableEmoticons: true,
      suggestion: {
        items: ({ query }) => gitHubEmojis.filter(({ shortcodes }) => shortcodes.some(shortcode => shortcode.startsWith(query.toLowerCase()))).slice(0, 10),
        render: () => {
          let component, popup;
          return {
            onStart: props => {
              component = new VueRenderer(EmojiList, { props, editor: props.editor });
              popup = tippy('body', { getReferenceClientRect: props.clientRect, appendTo: () => document.body, content: component.element, showOnCreate: true, interactive: true, trigger: 'manual', placement: 'bottom-start' });
            },
            onUpdate: props => { component.updateProps(props); popup[0].setProps({ getReferenceClientRect: props.clientRect }); },
            onKeyDown: ({ event }) => component.ref?.onKeyDown(event),
            onExit: () => { popup[0].destroy(); component.destroy(); },
          };
        },
      },
    }),
    Mention.configure({
      HTMLAttributes: {
        class: 'mention',
      },
      suggestion: {
        items: ({ query }) => {
          return mentionSuggestions
            .filter(item => item.label.toLowerCase().startsWith(query.toLowerCase()))
            .slice(0, mentionSuggestions.length);
        },
        render: () => {
          let component;
          let popup;
          return {
            onStart: (props) => {
              component = new VueRenderer(MentionList, {
                props,
                editor: props.editor,
              });
              popup = tippy('body', {
                getReferenceClientRect: props.clientRect,
                appendTo: () => document.body,
                content: component.element,
                showOnCreate: true,
                interactive: true,
                trigger: 'manual',
                placement: 'bottom-start',
              });
            },
            onUpdate(props) {
              component.updateProps(props);
              popup[0].setProps({
                getReferenceClientRect: props.clientRect,
              });
            },
            onKeyDown({ event }) {
              if (event.key === 'Escape') {
                return false;
              }
              return component.ref?.onKeyDown({ event });
            },
            onExit() {
              popup[0].destroy();
              component.destroy();
            },
          };
        },
      },
    }),
    // Text style and color extensions
    TextStyle,
    Color.configure({
      types: ['textStyle'],
    }),
    // Standard Underline extension
    Underline,
  ],
  onUpdate: ({ editor }) => {
    // 当内容变化时发出事件
    emit('update:modelValue', editor.getHTML());
  },
});

const saveContent = () => {
  if (editor.value) {
    const htmlContent = editor.value.getHTML();
    emit('save-draft', htmlContent);
  }
};

// 键盘事件处理函数
const handleKeyDown = (event) => {
  // 检查是否按下了 Ctrl+S (Windows/Linux) 或 Cmd+S (Mac)
  if ((event.ctrlKey || event.metaKey) && event.key === 's') {
    // 检查是否应该处理这个快捷键
    const shouldHandle = isEditorFocused();
    
    if (shouldHandle) {
      event.preventDefault(); // 只有在编辑器相关状态下才阻止浏览器默认的保存行为
      if (canSave.value) {
        saveContent();
      }
    }
  }
};

// 检查编辑器是否处于焦点状态或相关弹窗是否打开
const isEditorFocused = () => {
  // 检查编辑器是否有焦点
  if (editor.value && editor.value.isFocused) {
    return true;
  }
  
  // 检查是否有相关弹窗打开
  if (showCustomEmojiPicker.value || showColorPicker.value) {
    return true;
  }
  
  // 检查当前焦点元素是否在编辑器容器内
  const activeElement = document.activeElement;
  const editorContainer = document.querySelector('.flash-editor-container');
  if (editorContainer && activeElement && editorContainer.contains(activeElement)) {
    return true;
  }
  
  return false;
};

// 组件挂载时添加键盘事件监听
onMounted(() => {
  document.addEventListener('keydown', handleKeyDown);
});

// 组件卸载时移除键盘事件监听
onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown);
});

const clearContent = () => {
  if(editor.value) {
    editor.value.commands.setContent('');
    localStorage.removeItem('flash-editor-draft');
  }
};
// 暴露方法给父组件
const setContent = (content) => {
  if (editor.value) {
    editor.value.commands.setContent(content);
  }
};

const getContent = () => {
  if (editor.value) {
    return editor.value.getHTML();
  }
  return '';
};

defineExpose({
  setContent,
  getContent,
  clearContent,
  wordCount,
  contentStats
});
</script>

<style scoped>
.flash-editor-container {
  background-color: #ffffff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  height: 100%; /* 确保容器占满父元素高度 */
  overflow: hidden; /* 防止自身滚动 */
}

.flash-editor-container:focus-within {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.editor-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  background: #f8fafc;
  border-bottom: 1px solid #e5e7eb;
  flex-shrink: 0;
  position: sticky; /* 固定工具栏 */
  top: 0;
  z-index: 10;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 4px;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 4rem;
}

.toolbar-divider {
  width: 1px;
  height: 24px;
  background: #d1d5db;
  margin: 0 8px;
}

.editor-toolbar button {
  font-family: 'Inter', sans-serif;
  border: none;
  background-color: transparent;
  color: #578ce0;
  padding: 8px 12px;
  margin: 0 2px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  transition: background-color 0.2s, color 0.2s;
}

.editor-toolbar button:hover {
  background-color: #f3f4f6;
}
:deep(.toolbar-right button) {
  padding: 0 !important;
}
:deep(.toolbar-right button):hover  {
  background-color: transparent !important;
}
.editor-toolbar button.is-active {
  background-color: #e0e7ff;
  color: #3b82f6;
}

.editor-toolbar button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}



.editor-content {
  padding: 70px; /* 调整内边距 */
  flex: 1; /* 占据剩余空间 */
  overflow-y: auto; /* 内部滚动 */
}
.editor-content :deep( a) {
  color: #10b981 !important;
}

.editor-content :deep(.ProseMirror) {
  height: 500px;
  outline: none;
  font-size: 16px;
  line-height: 1.6;
  color: #374151;
}

.editor-content :deep(.ProseMirror p.is-editor-empty:first-child::before) {
  content: attr(data-placeholder);
  float: left;
  color: #adb5bd;
  pointer-events: none;
  height: 0;
}

.editor-content :deep(.ProseMirror p) {
  margin: 0 0 16px 0;
}

.editor-content :deep(.ProseMirror h1) {
  font-size: 2em;
  font-weight: 700;
  margin: 24px 0 16px 0;
  color: #111827;
}

.editor-content :deep(.ProseMirror h2) {
  font-size: 1.5em;
  font-weight: 600;
  margin: 20px 0 12px 0;
  color: #111827;
}

.editor-content :deep(.ProseMirror ul),
.editor-content :deep(.ProseMirror ol) {
  padding-left: 24px;
  margin: 16px 0;
}

.editor-content :deep(.ProseMirror li) {
  margin: 4px 0;
}

/* --- Light Mode High Contrast Code Block --- */
.editor-content :deep(pre) {
  background: #091c41;; 
  color: #adbef3; /* Default Soft White */
  border-radius: 14px;
  padding: 12px;
  margin: 20px auto ;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
  line-height: 1.4;
  max-width: 98%;
  max-height: 60vh;
  overflow: auto;  
}
span {
  color: #005cc5 !important;
}
.editor-content :deep(.ProseMirror code) {
  background: #f3f4f6;
  color: #dc2626;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.9em;
}

.editor-content :deep(.ProseMirror pre code) {
  background: transparent;
  color: inherit;
  padding: 0;

}
.edit-section {
  overflow: hidden;
}
/* --- Final & Complete Syntax Highlighting --- */

/* Light Mode (on dark background) - "Vibrant Ink" */
.editor-content :deep(.hljs-comment) { color: #75715e; font-style: italic; } /* Grey */
.editor-content :deep(.hljs-attribute) { color: #fd971f; } /* Orange */
.editor-content :deep(.hljs-attr) { color: #fd971f; } /* Orange */
.editor-content :deep(.hljs-operator) { color: #f92672; } /* Pink */
.editor-content :deep(.hljs-keyword) { color: #f92672; } /* Pink */
.editor-content :deep(.hljs-string) { color: #e6db74; } /* Lemony-Chiffon */
.editor-content :deep(.hljs-variable), .editor-content :deep(.hljs-template-variable), .editor-content :deep(.hljs-subst) { color: #f8f8f2; } /* Soft White */
.editor-content :deep(.hljs-number), .editor-content :deep(.hljs-literal) { color: #ae81ff; } /* Purple */
.editor-content :deep(.hljs-type) { color: #66d9ef; font-style: italic; } /* Italic Cyan */
.editor-content :deep(.hljs-params) { color: #fd971f; } /* Orange */
.editor-content :deep(.hljs-built_in) { color: #a6e22e; } /* Bright Green */
.editor-content :deep(.hljs-title), .editor-content :deep(.hljs-function) { color: #a6e22e; } /* Bright Green */
.editor-content :deep(.hljs-property) { color: #66d9ef; } /* Cyan */
.editor-content :deep(.hljs-meta) { color: #f92672; } /* Pink */
.editor-content :deep(.hljs-selector-class) { color: #a6e22e; } /* Bright Green */
.editor-content :deep(.hljs-selector-id) { color: #fd971f; } /* Orange */
.editor-content :deep(.hljs-selector-tag) { color: #f92672; } /* Pink */
.editor-content :deep(.hljs-selector-attr) { color: #66d9ef; } /* Cyan */
.editor-content :deep(.hljs-selector-pseudo) { color: #ae81ff; } /* Purple */
.editor-content :deep(.hljs-tag) { color: #f92672; } /* Pink */
.editor-content :deep(.hljs-name) { color: #a6e22e; } /* Bright Green */
.editor-content :deep(.hljs-class) { color: #66d9ef; } /* Cyan */
.editor-content :deep(.hljs-regexp) { color: #e6db74; } /* Lemony-Chiffon */
.editor-content :deep(.hljs-link) { color: #66d9ef; text-decoration: underline; } /* Cyan */
.editor-content :deep(.hljs-symbol) { color: #ae81ff; } /* Purple */
.editor-content :deep(.hljs-bullet) { color: #f92672; } /* Pink */
.editor-content :deep(.hljs-code) { color: #e6db74; } /* Lemony-Chiffon */
.editor-content :deep(.hljs-formula) { color: #ae81ff; } /* Purple */
.editor-content :deep(.hljs-section) { color: #a6e22e; font-weight: bold; } /* Bright Green */
.editor-content :deep(.hljs-quote) { color: #75715e; font-style: italic; } /* Grey */
.editor-content :deep(.hljs-doctag) { color: #fd971f; } /* Orange */
.editor-content :deep(.hljs-deletion) { background: #f92672; color: #f8f8f2; } /* Pink background */
.editor-content :deep(.hljs-addition) { background: #a6e22e; color: #272822; } /* Green background */
.editor-content :deep(.hljs-emphasis) { font-style: italic; } /* Italic */
.editor-content :deep(.hljs-strong) { font-weight: bold; } /* Bold */
.editor-content :deep(.hljs-punctuation) { color: #f92672; } /* Pink */
/* Dark Mode (on light background) - "Crystal Clear" */
.dark-mode .editor-content :deep(.hljs-comment) { color: #6a737d; font-style: italic; } /* Grey */
.dark-mode .editor-content :deep(.hljs-attribute) { color: #005cc5; } /* Blue */
.dark-mode .editor-content :deep(.hljs-attr) { color: #005cc5; } /* Blue */
.dark-mode .editor-content :deep(.hljs-operator) { color: #d73a49; } /* Red */
.dark-mode .editor-content :deep(.hljs-keyword) { color: #d73a49; } /* Red */
.dark-mode .editor-content :deep(.hljs-string) { color: #032f62; } /* Dark Blue */
.dark-mode .editor-content :deep(.hljs-variable), .dark-mode .editor-content :deep(.hljs-template-variable), .dark-mode .editor-content :deep(.hljs-subst) { color: #383a42; } /* Dark Slate Gray */
.dark-mode .editor-content :deep(.hljs-punctuation) { color: #ff7301; } /* Pink */
.dark-mode .editor-content :deep(.hljs-number), .dark-mode .editor-content :deep(.hljs-literal) { color: #005cc5; } /* Blue */
.dark-mode .editor-content :deep(.hljs-type) { color: #d73a49; } /* Red */
.dark-mode .editor-content :deep(.hljs-params) { color: #e36209; } /* Orange */
.dark-mode .editor-content :deep(.hljs-built_in) { color: #6f42c1; } /* Purple */
.dark-mode .editor-content :deep(.hljs-title), .dark-mode .editor-content :deep(.hljs-function) { color: #6f42c1; } /* Purple */
.dark-mode .editor-content :deep(.hljs-property) { color: #005cc5; } /* Blue */
.dark-mode .editor-content :deep(.hljs-meta) { color: #d73a49; } /* Red */
.dark-mode .editor-content :deep(.hljs-selector-class) { color: #6f42c1; } /* Purple */
.dark-mode .editor-content :deep(.hljs-selector-id) { color: #e36209; } /* Orange */
.dark-mode .editor-content :deep(.hljs-selector-tag) { color: #d73a49; } /* Red */
.dark-mode .editor-content :deep(.hljs-selector-attr) { color: #005cc5; } /* Blue */
.dark-mode .editor-content :deep(.hljs-selector-pseudo) { color: #6f42c1; } /* Purple */
.dark-mode .editor-content :deep(.hljs-tag) { color: #d73a49; } /* Red */
.dark-mode .editor-content :deep(.hljs-name) { color: #6f42c1; } /* Purple */
.dark-mode .editor-content :deep(.hljs-class) { color: #005cc5; } /* Blue */
.dark-mode .editor-content :deep(.hljs-regexp) { color: #032f62; } /* Dark Blue */
.dark-mode .editor-content :deep(.hljs-link) { color: #005cc5; text-decoration: underline; } /* Blue */
.dark-mode .editor-content :deep(.hljs-symbol) { color: #6f42c1; } /* Purple */
.dark-mode .editor-content :deep(.hljs-bullet) { color: #d73a49; } /* Red */
.dark-mode .editor-content :deep(.hljs-code) { color: #032f62; } /* Dark Blue */
.dark-mode .editor-content :deep(.hljs-formula) { color: #6f42c1; } /* Purple */
.dark-mode .editor-content :deep(.hljs-section) { color: #6f42c1; font-weight: bold; } /* Purple */
.dark-mode .editor-content :deep(.hljs-quote) { color: #6a737d; font-style: italic; } /* Grey */
.dark-mode .editor-content :deep(.hljs-doctag) { color: #e36209; } /* Orange */
.dark-mode .editor-content :deep(.hljs-deletion) { background: #d73a49; color: #ffffff; } /* Red background */
.dark-mode .editor-content :deep(.hljs-addition) { background: #28a745; color: #ffffff; } /* Green background */
.dark-mode .editor-content :deep(.hljs-emphasis) { font-style: italic; } /* Italic */
.dark-mode .editor-content :deep(.hljs-strong) { font-weight: bold; } /* Bold */
.dark-mode .editor-content :deep(.hljs-title), .dark-mode .editor-content :deep(.hljs-function) { color: #6f42c1; } /* Purple */
.dark-mode .editor-content :deep(.hljs-property) { color: #005cc5; } /* Blue */
.dark-mode .editor-content :deep(.hljs-meta) { color: #d73a49; } /* Red */
/* Dark Mode Styles */
.dark-mode .flash-editor-container {
  background-color: #1f2937; /* 深灰蓝背景 */
  border-color: #374151;
}

.dark-mode .editor-toolbar {
  background-color: #111827; /* 更深的背景 */
  border-bottom-color: #374151;
}

.dark-mode .toolbar-button {
  color: #d1d5db; /* 亮灰色图标 */
}

.dark-mode .toolbar-button:hover,
.dark-mode .toolbar-button.is-active {
  background-color: #374151;
  color: #ffffff;
}

.dark-mode .editor-content :deep(.ProseMirror) {
  color: #d1d5db; /* 亮灰色文本 */
}

.dark-mode .editor-content :deep(.ProseMirror p) {
    color: #d1d5db;
}

.dark-mode .editor-content :deep(.ProseMirror h1),
.dark-mode .editor-content :deep(.ProseMirror h2),
.dark-mode .editor-content :deep(.ProseMirror h3) {
    color: #f3f4f6;
}

/* --- Dark Mode High Contrast Code Block --- */
.dark-mode .editor-content :deep(pre) {
  background: #f8f8f2; /* 柔和白色背景 */
  max-height: 60vh;
  overflow: auto;
  color: #383a42; /* Default Dark Slate Gray */
}

.dark-mode .editor-content :deep(.ProseMirror pre code) {
  color: rgb(55, 170, 236);
}

/* Emoji Picker Styles */
.emoji-picker {
  position: absolute;
  top: 60px;
  right: 20px;
  background: white;
  border: 1px solid #e1e5e9;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  width: 500px;
  max-height: 350px;
  overflow: hidden;
}

.emoji-picker-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 24px;
  border-bottom: 1px solid #e1e5e9;
  background: #f8f9fa;
  position: relative;
}

.emoji-picker .window-controls {
  display: flex;
  gap: 8px;
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
}

.emoji-picker .control-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.emoji-picker .control-dot.close { 
  background-color: #ff5f56; 
}

.emoji-picker .control-dot.close:hover {
  opacity: 0.8;
}

.emoji-picker .control-dot.minimize { 
  background-color: #ffbd2e; 
  cursor: not-allowed;
}

.emoji-picker .control-dot.expand { 
  background-color: #27c93f; 
  cursor: not-allowed;
}

.emoji-picker-title {
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  text-align: center;
  flex-grow: 1;
}

.emoji-picker-spacer {
  width: 60px; /* Same width as window-controls to center the title */
}

.emoji-grid {
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  gap: 4px;
  padding: 16px;
  max-height: 280px;
  overflow-y: auto;
}

.emoji-button {
  background: none;
  border: none;
  font-size: 20px;
  padding: 8px;
  cursor: pointer;
  border-radius: 6px;
  transition: background-color 0.15s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: 1;
}

.emoji-button:hover {
  background-color: #f3f4f6;
}

/* Dark mode emoji picker */
.dark-mode .emoji-picker {
  background: #1f2937;
  border-color: #374151;
}

.dark-mode .emoji-picker-header {
  background: #111827;
  border-bottom-color: #374151;
}

.dark-mode .emoji-picker-title {
  color: #f3f4f6;
}

.dark-mode .emoji-button:hover {
  background-color: #374151;
}

/* Word Count Display Styles */
.word-count-display {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-right: 12px;
  padding: 6px 12px;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 8px;
  font-size: 13px;
  position: relative;
}

.word-count-label {
  color: #6b7280;
  font-weight: 500;
}

.word-count-number {
  color: #3b82f6;
  font-weight: 600;
  font-family: monospace;
}

.word-count-detail {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  font-size: 11px;
  opacity: 0;
  visibility: hidden;
  transition: all 0.2s ease;
  transform: translateY(-5px);
}

.word-count-display:hover .word-count-detail {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.word-count-detail div {
  display: flex;
  justify-content: space-between;
  margin-bottom: 2px;
  color: #6b7280;
}

.word-count-detail div:last-child {
  margin-bottom: 0;
}

/* Dark mode word count */
.dark-mode .word-count-display {
  background: rgba(59, 130, 246, 0.2);
  border-color: rgba(59, 130, 246, 0.3);
}

.dark-mode .word-count-label {
  color: #9ca3af;
}

.dark-mode .word-count-number {
  color: #60a5fa;
}

.dark-mode .word-count-detail {
  background: #1f2937;
  border-color: #374151;
}

.dark-mode .word-count-detail div {
  color: #9ca3af;
}

/* Custom Blockquote Styles */
.editor-content :deep(.custom-blockquote) {
  border-left: 4px solid #3b82f6;
  padding-left: 16px;
  margin: 16px 0;
  font-style: italic;
  color: #6b7280;
  background: #f8fafc;
  padding: 12px 16px;
  border-radius: 0 8px 8px 0;
}

.dark-mode .editor-content :deep(.custom-blockquote) {
  background: #1e293b;
  color: #cbd5e1;
  border-left-color: #60a5fa;
}

/* Mention Styles */
.editor-content :deep(.mention) {
  background: #dbeafe;
  color: #1d4ed8;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.15s ease;
}

.editor-content :deep(.mention:hover) {
  background: #bfdbfe;
  color: #1e40af;
}

.dark-mode .editor-content :deep(.mention) {
  background: #1e3a8a;
  color: #93c5fd;
}

.dark-mode .editor-content :deep(.mention:hover) {
  background: #1e40af;
  color: #dbeafe;
}

/* Custom Image Styles */
.flash-editor-container .editor-content :deep(.ProseMirror img.inline-emoji) {
  height: 32px !important; /* Force size */
  width: auto !important;
  max-width: none !important;
  max-height: none !important;
  display: inline-block !important;
  vertical-align: middle !important;
  user-select: none !important; /* Prevent selection */
  pointer-events: none !important; /* Prevent drag */
  background: transparent !important; /* Override any background */
  border: none !important;
  padding: 0 !important;
  margin: 0 0.1em !important;
  box-shadow: none !important;

}


/* Scrollbar for emoji picker */
.emoji-grid::-webkit-scrollbar {
  width: 6px;
}

.emoji-grid::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.emoji-grid::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.emoji-grid::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.dark-mode .emoji-grid::-webkit-scrollbar-track {
  background: #374151;
}

.dark-mode .emoji-grid::-webkit-scrollbar-thumb {
  background: #6b7280;
}

.dark-mode .emoji-grid::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}
</style>


