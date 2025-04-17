import { createRouter, createWebHistory } from 'vue-router';
import Meditation from '../components/Meditation.vue';
import StudyMode from '../components/StudyMode.vue';

const routes = [
  {
    path: '/',
    name: 'Meditation',
    component: Meditation,
  },
  {
    path: '/study',
    name: 'StudyMode',
    component: StudyMode,
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router; 