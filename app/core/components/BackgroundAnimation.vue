<script setup lang="ts">
import { AppAsset } from '../constants/app_asset'

const props = withDefaults(defineProps<{
  imageSrc?: string
  mobileCount?: number
  desktopCount?: number
}>(), {
  imageSrc: AppAsset.nature,
  mobileCount: 12,
  desktopCount: 35,
})

const canvas = ref<HTMLCanvasElement | null>(null)

type Petal = {
  x: number
  y: number
  size: number
  speedX: number
  speedY: number
  swing: number
  swingSpeed: number
}

let animationFrame = 0
let petals: Petal[] = []
let image: HTMLImageElement | null = null

const isMobile = () => window.innerWidth <= 768
const petalCount = () => isMobile() ? props.mobileCount : props.desktopCount

function createPetal(randomY = false): Petal {
  const element = canvas.value!
  const size = isMobile() ? Math.random() * 15 + 15 : Math.random() * 30 + 25
  const speedY = (Math.random() * 1.4 + 0.8) * (isMobile() ? 0.5 : 1)

  return {
    x: Math.random() * element.width,
    y: randomY ? Math.random() * element.height : -60,
    size,
    speedY,
    speedX: Math.random() * 0.4 - 0.2,
    swing: Math.random() * Math.PI,
    swingSpeed: Math.random() * 0.03 + 0.01,
  }
}

function resize() {
  if (!canvas.value) return
  canvas.value.width = window.innerWidth
  canvas.value.height = window.innerHeight

  const count = petalCount()
  petals = petals.slice(0, count)
  while (petals.length < count) petals.push(createPetal(true))
}

function animate() {
  if (!canvas.value || !image) return
  const context = canvas.value.getContext('2d')
  if (!context) return

  context.clearRect(0, 0, canvas.value.width, canvas.value.height)

  petals.forEach((petal, index) => {
    petal.swing += petal.swingSpeed
    petal.y += petal.speedY
    petal.x += petal.speedX + Math.sin(petal.swing) * 1.3

    context.drawImage(
      image!,
      petal.x - petal.size / 2,
      petal.y - petal.size / 2,
      petal.size,
      petal.size,
    )

    const isOutside = petal.y > canvas.value!.height + 60
      || petal.x < -60
      || petal.x > canvas.value!.width + 60

    if (isOutside) petals[index] = createPetal()
  })

  animationFrame = requestAnimationFrame(animate)
}

function loadImage(source: string) {
  cancelAnimationFrame(animationFrame)
  image = new Image()
  image.src = source
  image.onload = animate
}

watch(() => props.imageSrc, loadImage)

onMounted(() => {
  resize()
  window.addEventListener('resize', resize)
  loadImage(props.imageSrc)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(animationFrame)
  window.removeEventListener('resize', resize)
})
</script>

<template>
  <canvas ref="canvas" class="background-animation" aria-hidden="true" />
</template>

<style scoped>
.background-animation {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100vh;
  pointer-events: none;
  z-index: 9999;
}
</style>
