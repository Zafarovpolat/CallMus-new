<template>
  <div>
    <h1>{{ msg }}</h1>
  </div>
</template>

<script setup lang="ts">
interface Props {
  msg: string
}

defineProps<Props>()
</script>

<style scoped>
h1 {
  color: #42b883;
}
</style>
