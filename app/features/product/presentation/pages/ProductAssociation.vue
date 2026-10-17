<script setup lang="ts">
import { useProductAssociations } from '../store/use_product_associations'

const { products, periods, associations, form, loading, loadingAssociations, submitting, error, listError, choicesError, success, loadChoices, loadAssociations, submit, remove } = useProductAssociations()
const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']
</script>

<template>
  <main>
    <nav class="flex flex-wrap gap-4 text-sm mb-8" aria-label="Gestion des produits">
      <NuxtLink to="/" class="underline">Voir le menu</NuxtLink>
      <NuxtLink to="/create-product" class="underline">Créer un produit</NuxtLink>
      <NuxtLink to="/associate-product" aria-current="page" class="font-semibold">Associer aux menus</NuxtLink>
    </nav>
    <h1 class="text-3xl font-bold mb-2">Associer un produit à un menu</h1>
    <p class="text-gray-600 mb-6">Choisissez le produit, le jour et la période. Le même produit peut apparaître dans plusieurs menus.</p>
    <p v-if="loading" role="status">Chargement des produits et périodes…</p>
    <p v-else-if="choicesError" class="text-red-600" role="alert">{{ choicesError }} <button type="button" class="underline" @click="loadChoices">Réessayer</button></p>
    <p v-else-if="!products.length">Aucun produit disponible. <NuxtLink to="/create-product" class="underline">Créer un produit</NuxtLink></p>
    <p v-else-if="!periods.length">Ajoutez une période dans la table periods de Supabase, par exemple Midi ou Soir. <button type="button" class="underline" @click="loadChoices">Actualiser</button></p>
    <template v-else>
      <form class="bg-white rounded-xl shadow-md p-6 mb-8" novalidate @submit.prevent="submit">
        <fieldset :disabled="submitting" class="space-y-5">
          <div><label for="menu-product" class="block font-medium mb-2">Produit *</label><select id="menu-product" v-model.number="form.productId" class="w-full border rounded-lg px-3 py-2" required><option :value="0">Choisir un produit</option><option v-for="product in products" :key="product.id" :value="product.id">{{ product.name }} — {{ product.category?.name }}{{ product.isAvailable ? '' : ' (indisponible)' }}</option></select></div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label for="menu-day" class="block font-medium mb-2">Jour *</label><select id="menu-day" v-model.number="form.dayOfWeek" class="w-full border rounded-lg px-3 py-2"><option v-for="(day, index) in days" :key="day" :value="index + 1">{{ day }}</option></select></div>
            <div><label for="menu-period" class="block font-medium mb-2">Période *</label><select id="menu-period" v-model.number="form.periodId" class="w-full border rounded-lg px-3 py-2"><option :value="0">Choisir une période</option><option v-for="period in periods" :key="period.id" :value="period.id">{{ period.name }}</option></select></div>
          </div>
          <div><label for="menu-item-type" class="block font-medium mb-2">Section du menu *</label><select id="menu-item-type" v-model="form.itemType" class="w-full border rounded-lg px-3 py-2"><option value="repas">Repas</option><option value="dessert">Dessert</option></select></div>
          <p v-if="error" class="text-red-600" role="alert">{{ error }}</p>
          <p v-if="success" class="text-green-700" role="status">{{ success }}</p>
          <button type="submit" class="text-white font-semibold px-6 py-3 rounded-lg disabled:opacity-50" style="background: var(--menu-primary)" :disabled="submitting">{{ submitting ? 'Enregistrement…' : 'Enregistrer l’association' }}</button>
        </fieldset>
      </form>
      <section v-if="form.productId" class="bg-white rounded-xl shadow-md p-6" :aria-busy="loadingAssociations">
        <h2 class="text-xl font-bold mb-4">Menus de ce produit</h2>
        <p v-if="loadingAssociations" role="status">Chargement des associations…</p>
        <p v-else-if="listError" class="text-red-600" role="alert">{{ listError }} <button type="button" class="underline" @click="loadAssociations">Réessayer</button></p>
        <p v-else-if="!associations.length" class="text-gray-600">Ce produit n’est encore associé à aucun menu.</p>
        <ul v-else class="divide-y divide-gray-100">
          <li v-for="association in associations" :key="association.id" class="flex flex-wrap items-center justify-between gap-3 py-3">
            <span>{{ days[association.dayOfWeek - 1] }} · {{ association.periodName }} · {{ association.itemType === 'repas' ? 'Repas' : 'Dessert' }}</span>
            <button type="button" class="text-red-600 underline disabled:opacity-50" :disabled="submitting" @click="remove(association)">Retirer du menu</button>
          </li>
        </ul>
      </section>
    </template>
  </main>
</template>
