<template>
  <div class="mj-logo-box" :class="{ 'mj-logo-box--sm': size === 'sm' }">
    <div class="mj-logo-inner">
      <!-- Turuncu Çark & Hız İkonu -->
      <svg
        class="mj-logo-svg"
        viewBox="0 0 42 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M19 6C12.3726 6 7 11.3726 7 18C7 24.6274 12.3726 30 19 30C23.4 30 27.2 27.6 29.3 24"
          stroke="#f07419"
          stroke-width="3.2"
          stroke-linecap="round"
        />
        <circle cx="19" cy="18" r="5" fill="#f07419" />
        <!-- Çark Dişleri -->
        <rect x="17.5" y="2" width="3" height="4" rx="1" fill="#f07419" />
        <rect x="17.5" y="30" width="3" height="4" rx="1" fill="#f07419" />
        <rect x="3" y="16.5" width="4" height="3" rx="1" fill="#f07419" />
        <!-- Jet Hız Çizgileri -->
        <path
          d="M23 14H38L34 18H25L23 14Z"
          fill="#f07419"
        />
        <path
          d="M26 20H35L32 23H25L26 20Z"
          fill="#38bdf8"
        />
      </svg>

      <div class="mj-logo-text-wrap">
        <div class="mj-logo-brand">
          <span class="brand-makina">Makina</span><span class="brand-jet">Jet</span>
        </div>
        <div class="mj-logo-tagline">Tekstil Makinesinde Alım Satımın Hızlı Adresi</div>
      </div>
    </div>
  </div>
</template>

<script setup>
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
  background: #0a1420;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  padding: 6px 12px;
  user-select: none;

  &--sm {
    padding: 5px 10px;
    .mj-logo-svg {
      width: 28px;
      height: 24px;
    }
    .mj-logo-brand {
      font-size: 16px;
    }
    .mj-logo-tagline {
      font-size: 6.5px;
    }
  }
}

.mj-logo-inner {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mj-logo-svg {
  width: 34px;
  height: 28px;
  flex-shrink: 0;
}

.mj-logo-text-wrap {
  display: flex;
  flex-direction: column;
  line-height: 1.05;
}

.mj-logo-brand {
  font-size: 18px;
  font-weight: 800;
  letter-spacing: -0.4px;
  font-style: italic;

  .brand-makina {
    color: #ffffff;
  }
  .brand-jet {
    color: #f07419;
  }
}

.mj-logo-tagline {
  font-size: 7px;
  color: #94a3b8;
  font-weight: 500;
  letter-spacing: 0.1px;
  margin-top: 2px;
  white-space: nowrap;
}
</style>
