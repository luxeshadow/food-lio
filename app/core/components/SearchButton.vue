<script setup lang="ts">
import { AppAsset } from '../constants/app_asset'
import { useToast } from '../shared/use_toast'

withDefaults(defineProps<{ placement?: 'header' | 'floating' }>(), {
  placement: 'floating',
})

const { showToast } = useToast()

function showComingSoon() {
  showToast('Fonctionnalité en cours — Coming soon.', 'fi-rr-search', 'normal')
}
</script>

<template>
  <button
    type="button"
    class="search-button"
    :class="`search-button--${placement}`"
    aria-label="Rechercher"
    title="Rechercher"
    @click="showComingSoon"
  >
    <img :src="AppAsset.searchNormal" alt="">
  </button>
</template>

<style scoped>
.search-button {
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
  padding: 0;
  border: 1px solid rgb(255 255 255 / 30%);
  border-radius: 999px;
  background: #cbab6c;
  box-shadow: 0 8px 22px rgb(0 0 0 / 25%);
  cursor: pointer;
}

.search-button img {
  width: 23px;
  height: 23px;
  object-fit: contain;
}

.search-button--floating {
  position: fixed;
  right: 18px;
  bottom: 20px;
  z-index: 900;
}

.search-button--header {
  display: none;
}

@media (min-width: 641px) {
  .search-button--floating {
    display: none;
  }

  .search-button--header {
    position: absolute;
    top: 24px;
    right: 24px;
    display: grid;
  }
}
</style>
