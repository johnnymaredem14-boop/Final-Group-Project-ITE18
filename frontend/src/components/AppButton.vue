<template>
  <button class="btn" :class="variant" :type="type">
    <slot />
  </button>
</template>

<script setup>
defineProps({
  variant: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: 'button'
  }
})
</script>
