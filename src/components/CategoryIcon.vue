<template>
  <div class="cat-icon-wrap" :style="{ color: color }">
    <!-- 0. Özel Yüklenen SVG (iconSvg varsa) -->
    <div
      v-if="sanitizedCustomSvg"
      class="custom-svg-holder"
      v-html="sanitizedCustomSvg"
    ></div>

    <!-- 1. Dikiş Makineleri (sewing / sewing_machine) -->
    <svg v-else-if="type === 'sewing' || type === 'sewing_machine'" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M3 19h18" />
      <path d="M5 19v-4h6a2 2 0 0 0 2-2V9h-3V6h8a2 2 0 0 1 2 2v11" />
      <path d="M8 9v5" />
      <circle cx="17" cy="11" r="1.5" fill="currentColor" />
    </svg>

    <!-- 2. Overlok Makineleri (overlock) -->
    <svg v-else-if="type === 'overlock'" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="9" cy="12" r="5" />
      <circle cx="15" cy="12" r="5" />
    </svg>

    <!-- 3. Reçme Makineleri (coverstitch) -->
    <svg v-else-if="type === 'coverstitch'" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <line x1="7" y1="14" x2="9" y2="14" />
      <line x1="11" y1="14" x2="13" y2="14" />
      <line x1="15" y1="14" x2="17" y2="14" />
    </svg>

    <!-- 4. İlik-Düğme Makineleri (buttonhole) -->
    <svg v-else-if="type === 'buttonhole'" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="8" />
      <circle cx="10" cy="10" r="1.2" fill="currentColor" />
      <circle cx="14" cy="10" r="1.2" fill="currentColor" />
      <circle cx="10" cy="14" r="1.2" fill="currentColor" />
      <circle cx="14" cy="14" r="1.2" fill="currentColor" />
    </svg>

    <!-- 5. Kesim Sistemleri / Makas (cutting) -->
    <svg v-else-if="type === 'cutting'" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="6" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <line x1="20" y1="4" x2="8.12" y2="15.88" />
      <line x1="14.47" y1="14.48" x2="20" y2="20" />
      <line x1="8.12" y1="8.12" x2="12" y2="12" />
    </svg>

    <!-- 6. Ütü & Buhar Kazanları (ironing) -->
    <svg v-else-if="type === 'ironing'" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M3 17h18l-2-7H9a6 6 0 0 0-6 7Z" />
      <path d="M9 10V7a2 2 0 0 1 2-2h6" />
      <line x1="6" y1="20" x2="6" y2="21" />
      <line x1="12" y1="20" x2="12" y2="21" />
      <line x1="18" y1="20" x2="18" y2="21" />
    </svg>

    <!-- 7. Nakış & İşleme Makineleri (embroidery) -->
    <svg v-else-if="type === 'embroidery'" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="13" r="7" />
      <rect x="10" y="3" width="4" height="3" rx="1" />
      <path d="M9.5 13l1.8 1.8 3.5-3.6" />
    </svg>

    <!-- 8. Örme & Triko Makineleri (knitting) -->
    <svg v-else-if="type === 'knitting'" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="6" />
      <path d="M8 9c2.5 1 5.5 1 8 0" />
      <path d="M7 13c3 1.2 7 1.2 10 0" />
      <line x1="4" y1="20" x2="20" y2="4" />
      <line x1="4" y1="4" x2="20" y2="20" />
    </svg>

    <!-- 9. Pres & Yapıştırma Makineleri (pressing) -->
    <svg v-else-if="type === 'pressing'" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="4" y="4" width="16" height="4" rx="1" />
      <rect x="4" y="16" width="16" height="4" rx="1" />
      <line x1="12" y1="8" x2="12" y2="13" />
      <polyline points="9 11 12 14 15 11" />
    </svg>

    <!-- 10. İplik & Bobin / Sarım (thread) -->
    <svg v-else-if="type === 'thread'" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="6" y="3" width="12" height="3" rx="1" />
      <rect x="6" y="18" width="12" height="3" rx="1" />
      <path d="M8 6v12" />
      <path d="M16 6v12" />
      <line x1="8" y1="10" x2="16" y2="10" />
      <line x1="8" y1="14" x2="16" y2="14" />
    </svg>

    <!-- 11. Kumaş Serim & Kontrol (fabric) -->
    <svg v-else-if="type === 'fabric'" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <ellipse cx="7" cy="12" rx="3" ry="7" />
      <path d="M7 5h11a3 7 0 0 1 0 14H7" />
      <circle cx="7" cy="12" r="1" fill="currentColor" />
    </svg>

    <!-- 12. Otomasyon & Servo Motor (automation) -->
    <svg v-else-if="type === 'automation'" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="6" y="6" width="12" height="12" rx="2" />
      <rect x="9" y="9" width="6" height="6" rx="1" />
      <line x1="9" y1="2" x2="9" y2="6" />
      <line x1="15" y1="2" x2="15" y2="6" />
      <line x1="9" y1="18" x2="9" y2="22" />
      <line x1="15" y1="18" x2="15" y2="22" />
      <line x1="2" y1="9" x2="6" y2="9" />
      <line x1="2" y1="15" x2="6" y2="15" />
      <line x1="18" y1="9" x2="22" y2="9" />
      <line x1="18" y1="15" x2="22" y2="15" />
    </svg>

    <!-- 13. Yedek Parçalar / Dişli (spareparts - varsayılan) -->
    <svg v-else viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  type: {
    type: String,
    default: 'sewing'
  },
  color: {
    type: String,
    default: '#ea580c'
  },
  svg: {
    type: String,
    default: ''
  }
})

const sanitizedCustomSvg = computed(() => {
  const raw = (props.svg || '').trim()
  if (!raw || !raw.includes('<svg')) return ''
  // <script> ve event handler'ları temizle
  return raw
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/\son\w+="[^"]*"/gi, '')
})
</script>

<style scoped>
.cat-icon-wrap {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
}

.custom-svg-holder {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
}

.custom-svg-holder :deep(svg) {
  width: 20px;
  height: 20px;
}
</style>
