<template>
  <div class="mj-logo-box" :class="{ 'mj-logo-box--sm': size === 'sm' }">
    <div class="mj-logo-inner">
      <!-- Uygulama İkonu (Yeni M & Dikiş İğnesi Logosu) -->
      <div class="mj-logo-img-wrap">
        <img
          :src="appLogoUrl"
          alt="MAKİNEM Uygulama Logosu"
          class="mj-logo-img"
        />
      </div>

      <!-- Sağ: MAKİNEM & ENDÜSTRİYEL MAKİNE PAZARI -->
      <div class="mj-logo-text-wrap">
        <div class="mj-logo-brand-row">
          <span class="brand-makinem">MAKİNEM</span>
          <span class="brand-orange-dot"></span>
        </div>
        <div class="mj-logo-tagline-row">
          <span class="tagline-dash"></span>
          <span class="mj-logo-tagline">ENDÜSTRİYEL MAKİNE PAZARI</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import appLogoUrl from '@/assets/app-logo.jpg'

defineProps({
  size: {
    type: String,
    default: 'md'
  }
})
</script>

<style scoped lang="scss">
.mj-logo-box {
  display: inline-flex;
  align-items: center;
  user-select: none;
  padding: 4px 6px;

  &--sm {
    padding: 2px 4px;

    .mj-logo-inner {
      gap: 10px;
    }

    .mj-logo-img-wrap {
      width: 38px;
      height: 38px;
      border-radius: 9px;
    }

    .brand-makinem {
      font-size: 18px;
      letter-spacing: 1.2px;
    }

    .brand-orange-dot {
      width: 6px;
      height: 6px;
    }

    .tagline-dash {
      width: 11px;
    }

    .mj-logo-tagline {
      font-size: 7.5px;
      letter-spacing: 0.9px;
    }
  }
}

.mj-logo-inner {
  display: flex;
  align-items: center;
  gap: 12px;
}

.mj-logo-img-wrap {
  width: 44px;
  height: 44px;
  border-radius: 11px;
  overflow: hidden;
  flex-shrink: 0;
  background: #ea6412;
  box-shadow: 0 4px 12px rgba(240, 116, 25, 0.32);
  display: flex;
  align-items: center;
  justify-content: center;
}

.mj-logo-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.mj-logo-text-wrap {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  line-height: 1.05;
}

.mj-logo-brand-row {
  display: inline-flex;
  align-items: flex-start;
  gap: 3px;
}

.brand-makinem {
  font-size: 21px;
  font-weight: 900;
  color: #ffffff;
  letter-spacing: 1.5px;
}

.brand-orange-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #f07419;
  display: inline-block;
  margin-top: 1px;
  flex-shrink: 0;
}

.mj-logo-tagline-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 4px;
}

.tagline-dash {
  width: 14px;
  height: 2px;
  border-radius: 2px;
  background: #f07419;
  display: inline-block;
  flex-shrink: 0;
}

.mj-logo-tagline {
  font-size: 8.5px;
  color: #cbd5e1;
  font-weight: 700;
  letter-spacing: 1.1px;
  white-space: nowrap;
}
</style>
