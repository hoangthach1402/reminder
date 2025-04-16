import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, onValue, increment, onDisconnect } from 'firebase/database';

const firebaseConfig = {
  databaseURL: 'https://reminder-f42c2-default-rtdb.firebaseio.com',
  projectId: 'reminder-f42c2'
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Export all necessary functions
export { db, ref, set, onValue, increment, onDisconnect };