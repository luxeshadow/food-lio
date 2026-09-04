<script setup lang="ts">
import { AppColors } from '../constants/app_colors'

const skeletonBackground = AppColors.periodBackground

withDefaults(defineProps<{ count?: number }>(), { count: 4 })
</script>

<template>
  <div role="status" aria-live="polite">
    <span class="sr-only">Chargement des produits…</span>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-6" aria-hidden="true">
      <div v-for="item in count" :key="item" class="bg-white p-4 rounded-xl shadow-md">
        <div class="skeleton skeleton-image rounded-lg mb-3"></div>
        <div class="skeleton skeleton-title mb-2"></div>
        <div class="skeleton skeleton-text mb-2"></div>
        <div class="skeleton skeleton-description mb-4"></div>
        <div class="pt-2 border-t border-gray-100">
          <div class="skeleton skeleton-price"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.skeleton {
  background-color: v-bind(skeletonBackground);
  border-radius: 6px;
  animation: skeleton-pulse 1.5s ease-in-out infinite;
}

.skeleton-image { width: 100%; aspect-ratio: 4 / 3; border-radius: 8px; }
.skeleton-title { width: 65%; height: 24px; }
.skeleton-text { width: 100%; height: 12px; }
.skeleton-description { width: 80%; height: 12px; }
.skeleton-price { width: 25%; height: 24px; }

@keyframes skeleton-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.45; }
}

@media (prefers-reduced-motion: reduce) {
  .skeleton { animation: none; }
}
</style>
