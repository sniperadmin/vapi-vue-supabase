<template>
  <div class="login-view">
    <AuthForm />
  </div>
</template>

<script setup>
import AuthForm from '../components/AuthForm.vue'
</script>

<style scoped>
.login-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>