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
  color: hotpink;
}

</style>
