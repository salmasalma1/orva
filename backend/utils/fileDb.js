const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../data');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const readJSON = (filename) => {
  const filePath = path.join(dataDir, filename);
  if (!fs.existsSync(filePath)) {
    return [];
  }
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filename}:`, error);
    return [];
  }
};

const writeJSON = (filename, data) => {
  const filePath = path.join(dataDir, filename);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error(`Error writing ${filename}:`, error);
    return false;
  }
};

const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

class FileDB {
  constructor(filename) {
    this.filename = filename;
  }

  find(query = {}) {
    const data = readJSON(this.filename);
    if (Object.keys(query).length === 0) {
      return data;
    }
    return data.filter(item => {
      return Object.keys(query).every(key => {
        if (typeof query[key] === 'object' && query[key] !== null) {
          return JSON.stringify(item[key]) === JSON.stringify(query[key]);
        }
        return item[key] === query[key];
      });
    });
  }

  findOne(query) {
    const results = this.find(query);
    return results.length > 0 ? results[0] : null;
  }

  findById(id) {
    return this.findOne({ _id: id });
  }

  create(data) {
    const allData = readJSON(this.filename);
    const newItem = {
      _id: generateId(),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    allData.push(newItem);
    writeJSON(this.filename, allData);
    return newItem;
  }

  update(id, updates) {
    const allData = readJSON(this.filename);
    const index = allData.findIndex(item => item._id === id);
    if (index === -1) return null;
    
    allData[index] = {
      ...allData[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    writeJSON(this.filename, allData);
    return allData[index];
  }

  delete(id) {
    const allData = readJSON(this.filename);
    const filtered = allData.filter(item => item._id !== id);
    if (filtered.length === allData.length) return false;
    writeJSON(this.filename, filtered);
    return true;
  }

  deleteOne(query) {
    const item = this.findOne(query);
    if (!item) return false;
    return this.delete(item._id);
  }
}

module.exports = { FileDB, generateId };
