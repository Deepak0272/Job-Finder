import { localStore } from '../config/localStore.js';
import { isUsingMongo } from '../config/db.js';
import bcrypt from 'bcryptjs';

export const createModelBridge = (collectionName, MongooseModel) => {
  const getCollection = () => {
    localStore.init();
    return localStore.data[collectionName] || (localStore.data[collectionName] = []);
  };

  const wrapDoc = (rawDoc) => {
    if (!rawDoc) return null;
    const doc = { ...rawDoc };
    doc._id = String(doc._id || doc.id);
    doc.id = String(doc._id);

    // Attach .save() method
    doc.save = async function () {
      const col = getCollection();
      const idx = col.findIndex((d) => String(d._id) === String(doc._id));
      if (idx !== -1) {
        doc.updatedAt = new Date().toISOString();
        col[idx] = { ...doc };
        localStore.persist();
      }
      return doc;
    };

    // Attach .toObject() method
    doc.toObject = function () {
      const obj = { ...doc };
      delete obj.save;
      delete obj.toObject;
      delete obj.comparePassword;
      return obj;
    };

    // User specific helper
    if (collectionName === 'users') {
      doc.comparePassword = async function (enteredPassword) {
        return await bcrypt.compare(enteredPassword, doc.password);
      };
    }

    return doc;
  };

  // Query chaining helper for arrays
  class ArrayQueryChain {
    constructor(items) {
      this.items = [...items];
    }

    sort(sortParam) {
      if (!sortParam) return this;
      const desc = sortParam.startsWith('-');
      const field = desc ? sortParam.slice(1) : sortParam;

      this.items.sort((a, b) => {
        let valA = a[field] ?? '';
        let valB = b[field] ?? '';
        if (field.toLowerCase().includes('date') || field.includes('At')) {
          valA = new Date(valA).getTime();
          valB = new Date(valB).getTime();
        }
        if (valA < valB) return desc ? 1 : -1;
        if (valA > valB) return desc ? -1 : 1;
        return 0;
      });
      return this;
    }

    skip(num) {
      const n = Number(num) || 0;
      this.items = this.items.slice(n);
      return this;
    }

    limit(num) {
      const n = Number(num) || this.items.length;
      this.items = this.items.slice(0, n);
      return this;
    }

    select(fields) {
      if (fields === '-password') {
        this.items = this.items.map((doc) => {
          const c = { ...doc };
          delete c.password;
          return c;
        });
      }
      return this;
    }

    populate(field) {
      if (field === 'job' && (collectionName === 'savedjobs' || collectionName === 'applications')) {
        const jobs = localStore.data.jobs || [];
        this.items = this.items.map((item) => {
          const jobId = String(item.job?._id || item.job || '');
          const foundJob = jobs.find((j) => String(j._id) === jobId);
          return {
            ...item,
            job: foundJob ? wrapDoc(foundJob) : null,
          };
        });
      }
      if (field === 'createdBy' && collectionName === 'jobs') {
        const users = localStore.data.users || [];
        this.items = this.items.map((item) => {
          const userId = String(item.createdBy?._id || item.createdBy || '');
          const foundUser = users.find((u) => String(u._id) === userId);
          return {
            ...item,
            createdBy: foundUser ? { _id: foundUser._id, name: foundUser.name, email: foundUser.email } : null,
          };
        });
      }
      return this;
    }

    then(resolve, reject) {
      try {
        resolve(this.items.map(wrapDoc));
      } catch (err) {
        if (reject) reject(err);
      }
    }

    catch(reject) {
      // standard promise catch
      return this.then(null, reject);
    }
  }

  // Single doc query chain
  class SingleDocQueryChain {
    constructor(doc) {
      this.doc = doc ? { ...doc } : null;
    }

    select(fields) {
      if (this.doc && fields === '-password') {
        delete this.doc.password;
      }
      return this;
    }

    populate(field) {
      if (!this.doc) return this;
      if (field === 'job') {
        const jobs = localStore.data.jobs || [];
        const jobId = String(this.doc.job?._id || this.doc.job || '');
        const foundJob = jobs.find((j) => String(j._id) === jobId);
        this.doc.job = foundJob ? wrapDoc(foundJob) : null;
      }
      if (field === 'createdBy') {
        const users = localStore.data.users || [];
        const userId = String(this.doc.createdBy?._id || this.doc.createdBy || '');
        const foundUser = users.find((u) => String(u._id) === userId);
        this.doc.createdBy = foundUser ? { _id: foundUser._id, name: foundUser.name, email: foundUser.email } : null;
      }
      return this;
    }

    then(resolve, reject) {
      try {
        resolve(this.doc ? wrapDoc(this.doc) : null);
      } catch (err) {
        if (reject) reject(err);
      }
    }

    catch(reject) {
      return this.then(null, reject);
    }
  }

  return {
    find(filter = {}) {
      if (isUsingMongo()) return MongooseModel.find(filter);
      const col = getCollection();
      const matched = col.filter((doc) => localStore.matchFilter(doc, filter));
      return new ArrayQueryChain(matched);
    },

    findById(id) {
      if (isUsingMongo()) return MongooseModel.findById(id);
      const col = getCollection();
      const doc = col.find((d) => String(d._id) === String(id));
      return new SingleDocQueryChain(doc);
    },

    findOne(filter = {}) {
      if (isUsingMongo()) return MongooseModel.findOne(filter);
      const col = getCollection();
      const doc = col.find((d) => localStore.matchFilter(d, filter));
      return new SingleDocQueryChain(doc);
    },

    async create(data) {
      if (isUsingMongo()) return MongooseModel.create(data);
      const col = getCollection();
      const id = localStore.generateId();
      const now = new Date().toISOString();

      let finalData = { ...data };

      // User password hashing
      if (collectionName === 'users' && finalData.password) {
        const salt = await bcrypt.genSalt(10);
        finalData.password = await bcrypt.hash(finalData.password, salt);
      }

      const doc = {
        _id: id,
        id,
        ...finalData,
        createdAt: now,
        updatedAt: now,
      };

      col.push(doc);
      localStore.persist();
      return wrapDoc(doc);
    },

    async insertMany(arr) {
      if (isUsingMongo()) return MongooseModel.insertMany(arr);
      const results = [];
      for (const item of arr) {
        const created = await this.create(item);
        results.push(created);
      }
      return results;
    },

    async findByIdAndUpdate(id, updates, options = {}) {
      if (isUsingMongo()) return MongooseModel.findByIdAndUpdate(id, updates, options);
      const col = getCollection();
      const idx = col.findIndex((d) => String(d._id) === String(id));
      if (idx === -1) return null;

      col[idx] = {
        ...col[idx],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      localStore.persist();
      return wrapDoc(col[idx]);
    },

    async findByIdAndDelete(id) {
      if (isUsingMongo()) return MongooseModel.findByIdAndDelete(id);
      const col = getCollection();
      const idx = col.findIndex((d) => String(d._id) === String(id));
      if (idx === -1) return null;
      const [deleted] = col.splice(idx, 1);
      localStore.persist();
      return wrapDoc(deleted);
    },

    async findOneAndDelete(filter) {
      if (isUsingMongo()) return MongooseModel.findOneAndDelete(filter);
      const col = getCollection();
      const idx = col.findIndex((d) => localStore.matchFilter(d, filter));
      if (idx === -1) return null;
      const [deleted] = col.splice(idx, 1);
      localStore.persist();
      return wrapDoc(deleted);
    },

    async deleteMany(filter = {}) {
      if (isUsingMongo()) return MongooseModel.deleteMany(filter);
      const col = getCollection();
      if (Object.keys(filter).length === 0) {
        localStore.data[collectionName] = [];
        localStore.persist();
        return { deletedCount: col.length };
      }
      const remaining = col.filter((doc) => !localStore.matchFilter(doc, filter));
      const deletedCount = col.length - remaining.length;
      localStore.data[collectionName] = remaining;
      localStore.persist();
      return { deletedCount };
    },

    async countDocuments(filter = {}) {
      if (isUsingMongo()) return MongooseModel.countDocuments(filter);
      const col = getCollection();
      return col.filter((doc) => localStore.matchFilter(doc, filter)).length;
    },

    async aggregate(pipeline = []) {
      if (isUsingMongo()) return MongooseModel.aggregate(pipeline);
      const col = getCollection();
      const groupStage = pipeline.find((p) => p.$group);
      if (groupStage) {
        const key = groupStage.$group._id.replace('$', '');
        const counts = {};
        col.forEach((doc) => {
          const val = doc[key] || 'Other';
          counts[val] = (counts[val] || 0) + 1;
        });
        return Object.entries(counts).map(([_id, count]) => ({ _id, count }));
      }
      return [];
    },
  };
};
