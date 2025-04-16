<script setup>
defineProps({
  technique: {
    type: Object,
    required: true,
  },
});
</script>

<template>
  <div class="breathing-guide">
    <p>{{ technique.desc }}:</p>
    <ul>
      <li v-for="(step, index) in technique.steps" :key="index">
        {{ step.action }} <span>{{ step.duration }} giây</span>
      </li>
    </ul>
    <p class="benefit">
      <strong>Lợi ích:</strong> {{ technique.benefit }}<br />
      <strong>Độ khó:</strong> {{ technique.difficulty }}<br />
      <strong>Dành cho:</strong> {{ technique.audience }}
    </p>
  </div>
</template>

<style scoped>
.breathing-guide {
  color: #818181;
  font-weight: bold;
  margin-top: 2rem;
  text-align: left;
  background: #f5f5f5;
  padding: 1rem;
  border-radius: 8px;
}
.breathing-guide span {
  font-weight: bold;
  color: #818181;
}
.breathing-guide .benefit {
  font-weight: normal;
  font-size: 0.9rem;
  margin-top: 0.5rem;
  color: #666;
}
</style>