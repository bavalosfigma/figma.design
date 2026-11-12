<script setup>
import WipTypeOn from './motion/WipTypeOn.vue'

const body =
  'Lorem ipsum dolor sit amet consectetur. Faucibus id donec et ac quam. Mauris dictum commodo et in risus faucibus. Consectetur pharetra hendrerit viverra cursus et ullamcorper ultricies. Tristique volutpat a nibh rhoncus et tortor pulvinar.'
</script>

<template>
  <aside class="wip-information">
    <p class="wip-information__head">
      <span class="wip-information__tag">
        <WipTypeOn class="type-editorial-caption" text="A." trigger="mount" queue :ms="32" nowrap />
      </span>
      <WipTypeOn
        class="wip-information__title type-editorial-caption"
        text="Information"
        trigger="mount"
        queue
        :ms="24"
        nowrap
      />
    </p>
    <WipTypeOn as="p" class="wip-information__body type-body-small" :text="body" trigger="mount" queue :ms="8" />
  </aside>
</template>

<style scoped>
.wip-information {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: flex-start;
}

.wip-information__head {
  display: flex;
  gap: 5px;
  align-items: center;
  margin: 0;
}

.wip-information__tag {
  padding: 2px 4px;
  color: #6b6b6b;
  background: #e4ff97;
}

.wip-information__title {
  color: var(--wip-ink-soft);
  white-space: nowrap;
}

.wip-information__body {
  margin: 0;
  color: var(--wip-ink);
}
</style>
