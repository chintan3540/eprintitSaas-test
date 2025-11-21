/**
 * Dot Helper - Migration from dot-object
 * 
 * Pure CommonJS implementation with no external dependencies.
 * Provides backwards compatibility with dot-object API.
 */

/**
 * Flatten a nested object into dot notation
 * This replaces dot-object's dot.dot() method
 * 
 * @param {Object} obj - The object to flatten
 * @param {string} prefix - Internal use for recursion
 * @returns {Object} Flattened object with dot notation keys
 */
function flatten(obj, prefix = '') {
  const result = {};
  
  for (const key in obj) {
    if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;
    
    const value = obj[key];
    const newKey = prefix ? `${prefix}.${key}` : key;
    
    // Check if value is a plain object (not null, not array, not date, not other special objects)
    // We need to properly identify plain objects vs instances of classes like ObjectId, Date, etc.
    if (value !== null && 
        typeof value === 'object' && 
        !Array.isArray(value) &&
        !(value instanceof Date) &&
        !(value instanceof RegExp)) {
      
      // Additional check: is this a plain object or a special class instance?
      const proto = Object.getPrototypeOf(value);
      const isPlainObject = proto === null || 
                           proto === Object.prototype || 
                           (value.constructor && value.constructor === Object);
      
      if (isPlainObject) {
        // Recursively flatten nested plain objects
        Object.assign(result, flatten(value, newKey));
      } else {
        // Keep special objects (ObjectId, etc.) as-is
        result[newKey] = value;
      }
    } else {
      // Keep arrays, null, and primitive values as-is (dot.keepArray = true behavior)
      result[newKey] = value;
    }
  }
  
  return result;
}

/**
 * Remove a property from an object using dot notation
 * This replaces dot-object's dot.remove() method
 * 
 * @param {string} path - Dot notation path to the property
 * @param {Object} obj - The object to modify
 * @returns {boolean} True if property was deleted
 */
function remove(path, obj) {
  if (!obj || typeof obj !== 'object') {
    return false;
  }

  // First, try direct key match (for already-flattened objects)
  if (Object.prototype.hasOwnProperty.call(obj, path)) {
    delete obj[path];
    return true;
  }

  // Otherwise, navigate through nested structure
  const keys = path.split('.');
  const lastKey = keys.pop();
  
  // Navigate to the parent object
  let current = obj;
  for (const key of keys) {
    if (!current[key] || typeof current[key] !== 'object') {
      return false;
    }
    current = current[key];
  }
  
  // Delete the final property
  if (lastKey && Object.prototype.hasOwnProperty.call(current, lastKey)) {
    delete current[lastKey];
    return true;
  }
  
  return false;
}

/**
 * Get a property from an object using dot notation
 * This replaces dot-object's dot.pick() method
 * 
 * @param {string} path - Dot notation path to the property
 * @param {Object} obj - The object to read from
 * @returns {*} The value at the path
 */
function get(path, obj) {
  if (!obj || typeof obj !== 'object') {
    return undefined;
  }

  // First, try direct key match (for already-flattened objects)
  if (Object.prototype.hasOwnProperty.call(obj, path)) {
    return obj[path];
  }

  // Otherwise, navigate through nested structure
  const keys = path.split('.');
  let current = obj;
  
  for (const key of keys) {
    if (current === null || current === undefined) {
      return undefined;
    }
    current = current[key];
  }
  
  return current;
}

/**
 * Set a property in an object using dot notation
 * This replaces dot-object's dot.set() method
 * 
 * @param {string} path - Dot notation path to the property
 * @param {*} value - The value to set
 * @param {Object} obj - The object to modify
 */
function set(path, value, obj) {
  if (!obj || typeof obj !== 'object') {
    return;
  }

  const keys = path.split('.');
  const lastKey = keys.pop();
  
  // Navigate/create the path
  let current = obj;
  for (const key of keys) {
    if (!current[key] || typeof current[key] !== 'object') {
      current[key] = {};
    }
    current = current[key];
  }
  
  // Set the final value
  if (lastKey) {
    current[lastKey] = value;
  }
}

/**
 * Check if a property exists in an object using dot notation
 * This replaces dot-object's dot.has() method
 * 
 * @param {string} path - Dot notation path to the property
 * @param {Object} obj - The object to check
 * @returns {boolean} True if property exists
 */
function has(path, obj) {
  if (!obj || typeof obj !== 'object') {
    return false;
  }

  // First, try direct key match (for already-flattened objects)
  if (Object.prototype.hasOwnProperty.call(obj, path)) {
    return true;
  }

  // Otherwise, navigate through nested structure
  const keys = path.split('.');
  let current = obj;
  
  for (const key of keys) {
    if (!current || typeof current !== 'object' || !Object.prototype.hasOwnProperty.call(current, key)) {
      return false;
    }
    current = current[key];
  }
  
  return true;
}

// Export the helper with compatible API
module.exports = {
  // Main methods
  dot: flatten,        // dot.dot() -> flatten()
  remove,              // dot.remove(path, obj)
  get,                 // dot.pick(path, obj) -> get(path, obj)
  set,                 // dot.set(path, value, obj)
  has,                 // dot.has(path, obj)
  
  // Property for compatibility (dot.keepArray = true is now default behavior)
  keepArray: true
};
