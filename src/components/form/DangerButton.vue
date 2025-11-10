<template>
  <button type="button" :class="['custom-button', `custom-button--${type}`]" :disabled="disabled">
    <span class="shadow"></span>
    <span class="edge"></span>
    <span class="front text">
      <slot></slot>
    </span>
  </button>
</template>

<script setup>
defineProps({
  type: {
    type: String,
    default: 'danger',
    validator: (value) => [
      'danger', 'primary', 'text', 'success', 'warning',
      'black', 'yellow', 'purple', 'pink', 'orange', 'cyan', 'teal',
      'gradient-blue', 'gradient-purple', 'gradient-green', 'gradient-orange',
      'gradient-pink', 'gradient-cyan', 'gradient-teal', 'gradient-yellow'
    ].includes(value)
  },
  disabled: {
    type: Boolean,
    default: false
  }
});
</script>

<style scoped>
.custom-button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

/* From Uiverse.io by cssbuttons-io */ 
.custom-button {
 position: relative;
 border: none;
 background: transparent;
 padding: 0;
 cursor: pointer;
 outline-offset: 4px;
 transition: filter 250ms;
 user-select: none;
 touch-action: manipulation;
 font-size: 14px;
}

.shadow {
 position: absolute;
 top: 0;
 left: 0;
 width: 100%;
 height: 100%;
 border-radius: 8px;
 background: hsl(0deg 0% 0% / 0.25);
 will-change: transform;
 transform: translateY(2px);
 transition: transform
    600ms
    cubic-bezier(.3, .7, .4, 1);
}

.edge {
 position: absolute;
 top: 0;
 left: 0;
 width: 100%;
 height: 100%;
 border-radius: 8px;
 transition: background 0.3s ease;
}

.front {
 display: block;
 position: relative;
 padding: 6px 12px;
 border-radius: 8px;
 font-size: 14px;
 color: white;
 will-change: transform;
 transform: translateY(-4px);
 transition: transform
    600ms
    cubic-bezier(.3, .7, .4, 1);
}

/* 危险按钮样式 */
.custom-button--danger .edge {
  background: linear-gradient(
    to left,
    hsl(340deg 100% 16%) 0%,
    hsl(340deg 100% 32%) 8%,
    hsl(340deg 100% 32%) 92%,
    hsl(340deg 100% 16%) 100%
  );
}

.custom-button--danger .front {
  background: hsl(345deg 100% 47%);
}

/* 主要按钮样式 */
.custom-button--primary .edge {
  background: linear-gradient(
    to left,
    hsl(210deg 100% 16%) 0%,
    hsl(210deg 100% 32%) 8%,
    hsl(210deg 100% 32%) 92%,
    hsl(210deg 100% 16%) 100%
  );
}

.custom-button--primary .front {
  background: hsl(210deg 100% 47%);
}

/* 文本按钮样式 */
.custom-button--text .edge {
  background: linear-gradient(
    to left,
    hsl(210deg 100% 16%) 0%,
    hsl(210deg 100% 32%) 8%,
    hsl(210deg 100% 32%) 92%,
    hsl(210deg 100% 16%) 100%
  );
}

.custom-button--text .front {
  background: transparent;
  color: hsl(210deg 100% 47%);
  box-shadow: none;
}

/* 成功按钮样式 */
.custom-button--success .edge {
  background: linear-gradient(
    to left,
    hsl(140deg 70% 16%) 0%,
    hsl(140deg 70% 32%) 8%,
    hsl(140deg 70% 32%) 92%,
    hsl(140deg 70% 16%) 100%
  );
}

.custom-button--success .front {
  background: hsl(140deg 70% 47%);
}

/* 警告按钮样式 */
.custom-button--warning .edge {
  background: linear-gradient(
    to left,
    hsl(35deg 100% 16%) 0%,
    hsl(35deg 100% 32%) 8%,
    hsl(35deg 100% 32%) 92%,
    hsl(35deg 100% 16%) 100%
  );
}

.custom-button--warning .front {
  background: hsl(35deg 100% 47%);
}

.custom-button:hover {
 filter: brightness(110%);
}

.custom-button:hover .front {
 transform: translateY(-6px);
 transition: transform
    250ms
    cubic-bezier(.3, .7, .4, 1.5);
}

.custom-button:active .front {
 transform: translateY(-2px);
 transition: transform 34ms;
}

.custom-button:hover .shadow {
 transform: translateY(4px);
 transition: transform
    250ms
    cubic-bezier(.3, .7, .4, 1.5);
}

.custom-button:active .shadow {
 transform: translateY(1px);
 transition: transform 34ms;
}

.custom-button:focus:not(:focus-visible) {
 outline: none;
}

/* 黑色按钮样式 */
.custom-button--black .edge {
  background: linear-gradient(
    to left,
    hsl(0deg 0% 16%) 0%,
    hsl(0deg 0% 32%) 8%,
    hsl(0deg 0% 32%) 92%,
    hsl(0deg 0% 16%) 100%
  );
}

.custom-button--black .front {
  background: hsl(0deg 0% 47%);
}

/* 黄色按钮样式 */
.custom-button--yellow .edge {
  background: linear-gradient(
    to left,
    hsl(60deg 100% 16%) 0%,
    hsl(60deg 100% 32%) 8%,
    hsl(60deg 100% 32%) 92%,
    hsl(60deg 100% 16%) 100%
  );
}

.custom-button--yellow .front {
  background: hsl(60deg 100% 47%);
  color: #333;
}

/* 紫色按钮样式 */
.custom-button--purple .edge {
  background: linear-gradient(
    to left,
    hsl(270deg 100% 16%) 0%,
    hsl(270deg 100% 32%) 8%,
    hsl(270deg 100% 32%) 92%,
    hsl(270deg 100% 16%) 100%
  );
}

.custom-button--purple .front {
  background: hsl(270deg 100% 47%);
}

/* 粉色按钮样式 */
.custom-button--pink .edge {
  background: linear-gradient(
    to left,
    hsl(330deg 100% 16%) 0%,
    hsl(330deg 100% 32%) 8%,
    hsl(330deg 100% 32%) 92%,
    hsl(330deg 100% 16%) 100%
  );
}

.custom-button--pink .front {
  background: hsl(330deg 100% 47%);
}

/* 橙色按钮样式 */
.custom-button--orange .edge {
  background: linear-gradient(
    to left,
    hsl(25deg 100% 16%) 0%,
    hsl(25deg 100% 32%) 8%,
    hsl(25deg 100% 32%) 92%,
    hsl(25deg 100% 16%) 100%
  );
}

.custom-button--orange .front {
  background: hsl(25deg 100% 47%);
}

/* 青色按钮样式 */
.custom-button--cyan .edge {
  background: linear-gradient(
    to left,
    hsl(180deg 100% 16%) 0%,
    hsl(180deg 100% 32%) 8%,
    hsl(180deg 100% 32%) 92%,
    hsl(180deg 100% 16%) 100%
  );
}

.custom-button--cyan .front {
  background: hsl(180deg 100% 47%);
}

/* 蓝绿色按钮样式 */
.custom-button--teal .edge {
  background: linear-gradient(
    to left,
    hsl(175deg 100% 16%) 0%,
    hsl(175deg 100% 32%) 8%,
    hsl(175deg 100% 32%) 92%,
    hsl(175deg 100% 16%) 100%
  );
}

.custom-button--teal .front {
  background: hsl(175deg 100% 47%);
}

/* 渐变色按钮样式 */
.custom-button--gradient-blue .edge {
  background: linear-gradient(
    to left,
    hsl(210deg 100% 16%) 0%,
    hsl(210deg 100% 32%) 8%,
    hsl(210deg 100% 32%) 92%,
    hsl(210deg 100% 16%) 100%
  );
}

.custom-button--gradient-blue .front {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.custom-button--gradient-purple .edge {
  background: linear-gradient(
    to left,
    hsl(270deg 100% 16%) 0%,
    hsl(270deg 100% 32%) 8%,
    hsl(270deg 100% 32%) 92%,
    hsl(270deg 100% 16%) 100%
  );
}

.custom-button--gradient-purple .front {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.custom-button--gradient-green .edge {
  background: linear-gradient(
    to left,
    hsl(140deg 70% 16%) 0%,
    hsl(140deg 70% 32%) 8%,
    hsl(140deg 70% 32%) 92%,
    hsl(140deg 70% 16%) 100%
  );
}

.custom-button--gradient-green .front {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
}

.custom-button--gradient-orange .edge {
  background: linear-gradient(
    to left,
    hsl(25deg 100% 16%) 0%,
    hsl(25deg 100% 32%) 8%,
    hsl(25deg 100% 32%) 92%,
    hsl(25deg 100% 16%) 100%
  );
}

.custom-button--gradient-orange .front {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.custom-button--gradient-pink .edge {
  background: linear-gradient(
    to left,
    hsl(330deg 100% 16%) 0%,
    hsl(330deg 100% 32%) 8%,
    hsl(330deg 100% 32%) 92%,
    hsl(330deg 100% 16%) 100%
  );
}

.custom-button--gradient-pink .front {
  background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
}

.custom-button--gradient-cyan .edge {
  background: linear-gradient(
    to left,
    hsl(180deg 100% 16%) 0%,
    hsl(180deg 100% 32%) 8%,
    hsl(180deg 100% 32%) 92%,
    hsl(180deg 100% 16%) 100%
  );
}

.custom-button--gradient-cyan .front {
  background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
}

.custom-button--gradient-teal .edge {
  background: linear-gradient(
    to left,
    hsl(175deg 100% 16%) 0%,
    hsl(175deg 100% 32%) 8%,
    hsl(175deg 100% 32%) 92%,
    hsl(175deg 100% 16%) 100%
  );
}

.custom-button--gradient-teal .front {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.custom-button--gradient-yellow .edge {
  background: linear-gradient(
    to left,
    hsl(60deg 100% 16%) 0%,
    hsl(60deg 100% 32%) 8%,
    hsl(60deg 100% 32%) 92%,
    hsl(60deg 100% 16%) 100%
  );
}

.custom-button--gradient-yellow .front {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: #333;
}
</style>


