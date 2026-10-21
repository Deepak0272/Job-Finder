import mongoose from 'mongoose';
import { localStore } from './localStore.js';

let isMongo = false;

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (uri && uri.trim() !== '') {
    try {
      console.log(`[Database] Attempting connection to MongoDB at: ${uri.replace(/\/\/[^@]+@/, '//***:***@')}`);
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 3000,
      });
      isMongo = true;
      console.log('✅ [Database] Successfully connected to configured MongoDB');
      return;
    } catch (err) {
      console.warn(`⚠️ [Database] Could not connect to MONGODB_URI: ${err.message}`);
      console.log('⚡ [Database] Switching to instant, zero-dependency embedded datastore.');
    }
  } else {
    console.log('⚡ [Database] No external MONGODB_URI provided. Initializing instant embedded datastore...');
  }

  // Initialize local file-backed JSON store
  localStore.init();
  isMongo = false;
  console.log('✅ [Database] Embedded Datastore initialized (persisted at backend/data/store.json)');
  console.log('💡 [Database] Tip: You can supply a MONGODB_URI in backend/.env anytime to use MongoDB Atlas or local mongod.');
};

export const isUsingMongo = () => isMongo;

export const closeDB = async () => {
  if (isMongo) {
    await mongoose.disconnect();
  } else {
    localStore.persist();
  }
};
