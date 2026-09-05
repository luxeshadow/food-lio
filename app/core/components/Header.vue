<script setup lang="ts">
import { AppColors } from '../constants/app_colors'
import { AppAsset } from '../constants/app_asset'
import type { Category } from '../../features/categorie/domain/entities/category'

const headerWhite = AppColors.white
const headerBlack = AppColors.black
const headerBorder = AppColors.border
const headerPrimary = AppColors.primary
const headerTextMuted = AppColors.textMuted

const categoryIcons: Record<string, string> = {
  nourriture: AppAsset.food,
  nouriture: AppAsset.food,
  dessert: AppAsset.pannaCotta,
  desert: AppAsset.pannaCotta,
  boisson: AppAsset.toast,
  'fruit-de-mer': AppAsset.seafood,
  'fruits-de-mer': AppAsset.seafood,
  fruit_mere: AppAsset.seafood,
}

const props = defineProps<{ categories: Category[], activeCategory: string }>()
// const navigation = computed(() => [
//   { id: 'menu-du-jour', label: 'Menu du Jour', icon: 'https://i.postimg.cc/DygVbSYH/calendar.png' },
//   ...props.categories.filter(category => category.slug !== 'menu-du-jour').map(category => ({
//     id: category.slug, label: category.name, icon: '',
//   })),
// ])

const navigation = computed(() =>
  props.categories
    .filter(category => category.slug !== 'menu-du-jour')
    .sort((first, second) => {
      const firstIsFood = ['nourriture', 'nouriture'].includes(first.slug)
      const secondIsFood = ['nourriture', 'nouriture'].includes(second.slug)
      return Number(secondIsFood) - Number(firstIsFood)
    })
    .map(category => ({
      id: category.slug,
      label: category.name,
      icon: categoryIcons[category.slug] ?? '',
    }))
)

const emit = defineEmits<{
  categoryChange: [category: string]
}>()

function selectCategory(category: string) {
  emit('categoryChange', category)
}
</script>

<template>
  <header class="app-header">
    <div class="brand">
      <!-- <div class="logo-frame">
        <img :src="AppAsset.logo" alt="Logo RAN Restaurant" class="logo">
      </div> -->
      <h1 style="margin-top: 15px;"><span></span> Menu Digital</h1>
    </div>

    <p >Scannez le QR code pour consulter notre menu</p>

    <nav aria-label="Catégories du menu">
      <button
        v-for="category in navigation"
        :key="category.id"
        type="button"
        :class="{ active: activeCategory === category.id }"
        :aria-pressed="activeCategory === category.id"
        @click="selectCategory(category.id)"
      >
        <img v-if="category.icon" :src="category.icon" alt="">
        {{ category.label }}
      </button>
    </nav>
  </header>
</template>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 1000;
  padding: 24px 16px 32px;
  overflow: hidden;
  text-align: center;
  color: v-bind(headerWhite);
  background: v-bind(headerBlack);
  border-bottom: 1px solid v-bind(headerBorder);
  box-shadow: 0 10px 15px rgb(0 0 0 / 20%);
}

.brand {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.logo-frame {
  position: relative;
  width: 105px;
  height: 58px;
  flex: 0 0 auto;
  overflow: hidden;
  margin-right: -18px;
}

.logo {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 105px;
  height: 105px;
  object-fit: contain;
  transform: translate(-50%, -50%) scale(1.45);
}

h1 {
  margin: 0;
  color: v-bind(headerPrimary);
  font-size: clamp(1.25rem, 4vw, 1.875rem);
}

h1 span {
  color: v-bind(headerWhite);
}

p {
  max-width: 448px;
  margin: 16px auto 0;
  color: v-bind(headerTextMuted);
  font-size: 0.875rem;
}

nav {
  display: flex;
  gap: 24px;
  margin-top: 24px;
  padding: 0 8px 4px;
  overflow-x: auto;
  scrollbar-width: none;
}

nav::-webkit-scrollbar {
  display: none;
}

button {
  display: inline-flex;
  align-items: center;
  flex: 0 0 auto;
  gap: 8px;
  padding: 4px 0;
  border: 0;
  border-bottom: 2px solid transparent;
  color: #d1d5db;
  background: transparent;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
  transition: color 0.2s ease, border-color 0.2s ease;
}

button:hover,
button.active {
  color: v-bind(headerPrimary);
}

button.active {
  border-bottom-color: v-bind(headerPrimary);
}

button img {
  width: 20px;
  height: 20px;
  object-fit: contain;
}

@media (max-width: 640px) {
  .app-header {
    padding-top: 4px;
  }

  .brand {
    gap: 0;
  }

  .logo-frame {
    width: 125px;
    height: 68px;
    margin-right: -24px;
  }

  .logo {
    width: 65px;
    height: 100px;
  }

  nav {
    justify-content: flex-start;
  }
}
</style>
