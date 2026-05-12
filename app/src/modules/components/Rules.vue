<script setup lang="ts">
export interface RuleSection {
  type: 'title' | 'text' | 'list' | 'alert';
  content: string | string[];
  highlight?: boolean;
}

defineProps<{
  title: string;
  sections: RuleSection[];
  isOpen: boolean;
}>();

const emit = defineEmits(['close']);
</script>

<template>
  <Transition name="fade">
    <div v-if="isOpen" class="rules-overlay" @click.self="emit('close')">
      <div class="rules-modal">
        <header>
          <h2>{{ title }}</h2>
          <button class="close-btn" @click="emit('close')">&times;</button>
        </header>

        <div class="rules-content">
          <div v-for="(section, index) in sections" :key="index" class="rule-block">

            <h3 v-if="section.type === 'title'">{{ section.content }}</h3>

            <p v-if="section.type === 'text'"
               :class="{ 'highlight-box': section.highlight }"
               v-html="section.content">
            </p>

            <ul v-if="section.type === 'list' && Array.isArray(section.content)">
              <li v-for="(item, i) in section.content" :key="i" v-html="item"></li>
            </ul>

            <div v-if="section.type === 'alert'" class="rule-alert">
              <strong>⚠️ Attention :</strong> <span v-html="section.content"></span>
            </div>

          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.rules-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.rules-modal {
  background: #2a2a2a;
  color: #eee;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  border: 1px solid #444;
  box-shadow: 0 20px 50px rgba(0,0,0,0.5);
}

header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #444;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.rules-content {
  padding: 1.5rem;
  overflow-y: auto;
  line-height: 1.6;
}

.rule-block { margin-bottom: 1.2rem; }

h3 { color: #42b883; margin-bottom: 0.5rem; }

/* Surlignage personnalisé via HTML injecté */
:deep(.mark) {
  background: #f1c40f;
  color: #000;
  padding: 0 4px;
  border-radius: 4px;
  font-weight: bold;
}

.highlight-box {
  background: rgba(66, 184, 131, 0.1);
  padding: 10px;
  border-left: 4px solid #42b883;
}

.rule-alert {
  background: rgba(231, 76, 60, 0.1);
  border: 1px solid #e74c3c;
  padding: 10px;
  border-radius: 8px;
  color: #ff9f94;
}

.close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 2rem;
  cursor: pointer;
}
</style>
