<template>
<button :class="classes"><slot /></button>
</template>

<script>
export default {
  name: 'Button',
  computed: {
    classes() {
      return {
        [this.$style.btn]: true,
      }
    }
  }
}
</script>

<style module>
.btn {
  --button-dark: #333333;
  --button-line-height: 1.25rem;
  --button-font-size: 1rem;
  --button-light: #e9e9e9;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  user-select: none;
  appearance: none;
  cursor: pointer;
  box-sizing: border-box;
  transition-property: all;
  transition-duration: 200ms;
  color: var(--button-dark);
  background-color: var(--button-light);
  border-color: var(--button-light);
  border-style: solid;
  border-width: 1px;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Ubuntu, 'Helvetica Neue', sans-serif;
  font-weight: 400;
  font-size: var(--button-font-size);
  line-height: var(--button-line-height);
  padding-block-start: 0.5rem;
  padding-block-end: 0.5rem;
  padding-inline-start: 0.75rem;
  padding-inline-end: 0.75rem;
  text-decoration: none;
  text-align: center;
  outline: none;
}

@media (prefers-reduced-motion) {
  .btn {
    transition-duration: 0.001ms !important;
  }
}

</style>
