<template>
  <span class="arrow" aria-hidden="true">
    <svg viewBox="0 0 17 17" width="17" height="17">
      <path
        d="M4 13 L13 4 M6 4 H13 V11"
        fill="none"
        stroke="currentColor"
        stroke-width="1.4"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  </span>
</template>

<style scoped>
.arrow {
  display: grid;
  width: 48px;
  height: 48px;
  place-items: center;
  border: 1px solid currentColor;
  border-radius: 50%;
  color: #121212;
  background: rgba(255, 255, 255, 0.35);
}
</style>
