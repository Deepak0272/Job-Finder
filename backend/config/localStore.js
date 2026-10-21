import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'store.json');

class LocalStore {
  constructor() {
    this.data = {
      users: [],
      jobs: [],
      savedjobs: [],
      applications: [],
    };
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        this.data = JSON.parse(raw);
      } else {
        this.persist();
      }
    } catch (err) {
      console.warn('[LocalStore] Warning loading store.json, using fresh store:', err.message);
    }
    this.initialized = true;
  }

  persist() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DATA_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('[LocalStore] Failed to persist data:', err.message);
    }
  }

  generateId() {
    return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
  }

  matchFilter(doc, filter = {}) {
    if (!filter || Object.keys(filter).length === 0) return true;

    for (const key of Object.keys(filter)) {
      if (key === '$or' && Array.isArray(filter.$or)) {
        const matchesAny = filter.$or.some((subFilter) => this.matchFilter(doc, subFilter));
        if (!matchesAny) return false;
        continue;
      }

      const filterVal = filter[key];
      const docVal = doc[key];

      // Handle RegExp or regex object
      if (filterVal instanceof RegExp) {
        if (!filterVal.test(String(docVal || ''))) return false;
      } else if (filterVal && typeof filterVal === 'object' && filterVal.$regex) {
        const reg = new RegExp(filterVal.$regex, filterVal.$options || '');
        if (Array.isArray(docVal)) {
          if (!docVal.some((item) => reg.test(String(item)))) return false;
        } else {
          if (!reg.test(String(docVal || ''))) return false;
        }
      } else if (filterVal && typeof filterVal === 'object' && ('$gte' in filterVal || '$lte' in filterVal)) {
        const numDoc = Number(docVal) || 0;
        if ('$gte' in filterVal && numDoc < filterVal.$gte) return false;
        if ('$lte' in filterVal && numDoc > filterVal.$lte) return false;
      } else if (key === '_id' || key === 'id') {
        const idA = String(doc._id || doc.id);
        const idB = String(filterVal);
        if (idA !== idB) return false;
      } else if (key === 'user' || key === 'job') {
        const refA = String(docVal?._id || docVal || '');
        const refB = String(filterVal?._id || filterVal || '');
        if (refA !== refB) return false;
      } else {
        if (String(docVal).toLowerCase() !== String(filterVal).toLowerCase()) {
          return false;
        }
      }
    }
    return true;
  }
}

export const localStore = new LocalStore();
