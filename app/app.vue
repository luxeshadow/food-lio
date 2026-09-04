<template>
  <div class="app" :style="menuColors">
    <NuxtRouteAnnouncer />
    <BackgroundAnimation v-if="route.path === '/'" />
    <NuxtPage />
  </div>
</template>

<script setup lang="ts">
import { AppColors } from './core/constants/app_colors'
import BackgroundAnimation from './core/components/BackgroundAnimation.vue'

const route = useRoute()
const menuColors = {
  '--menu-primary': AppColors.primary,
  '--menu-white': AppColors.white,
  '--menu-primary-shadow': AppColors.primaryShadow,
  '--menu-period-background': AppColors.periodBackground,
  '--menu-period-text': AppColors.periodText,
}
</script>

<style>
html,
body {
  min-height: 100%;
  margin: 0;
  font-family: Inter, Arial, sans-serif;
}

html { scroll-behavior: smooth; }
body, html { overflow-x: hidden; }
h1, h2, h3 { font-family: 'Bricolage Grotesque', sans-serif; }

body {
  color: #1f2937;
  background: linear-gradient(to bottom, #fcf4e6, #ffffff);
}

main {
  max-width: 896px;
  margin: 0 auto;
  padding: 32px 16px;
}
</style>
