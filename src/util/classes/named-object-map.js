import Component from '../../core/component.js';
/** NamedObjectMap manages a map of configurable typed-objects
Config options:
 - types: a map of ClassNames to their definition (ie. a singleton object, or a constructor function)
 - exclusiveIDs: boolean, if true will not attempt to auto-increment when adding an entry with existing id
 - #onAdd: function(s) to call when a new NamedObject entry has been initialized and added
 - #onRemove: function(s) to call when a NamedObject entry has been removed

 #onAdd/#onRemove function(s) may be defined as:
 - string: calls this function if it is a method on the added/removed item
 - function(entry, type): explicitly defined function (type argument only in #onAdd)
 - array(string|function): an array of strings and/or functions to be called in order
*/
export default class NamedObjectMap extends Component {
  constructor(SL, config) {
    super(SL, config);
    this.table = {};
  }
  get type() {
    return 'NamedObjectMap';
  }
  runCallback(callback, forEntry, type) {
    let cbOrig = callback;
    if (callback) {
      if (this.config[callback]) {
        callback = this.config[callback];
      }
      if (typeof callback == 'string' && typeof forEntry[callback] == 'function') {
        forEntry[callback]();
      }
      else if (typeof callback == 'function') {
        callback(forEntry, type);
      }
      else if (callback.constructor === Array) {
        callback.forEach((callback) => {
          this.runCallback(callback, forEntry, type);
        });
      }
    }
  }
  addEntry(type, id, config) {
    if (type.constructor === Array) {
      let added = [];
      type.forEach((type) => {
        if (typeof type == 'string') {
          added.push(this.addEntry(type));
        }
        else if (typeof type == 'object') {
          added.push(this.addEntry(type.type, type.id, type.config));
        }
      });
      return added;
    }
    else if (type && typeof type == 'string') {
      let allowed = this.config.types;
      if (allowed) {
        // generate a new id or force a unique ID if exclusiveIDs is not enabled
        if (!id || !this.config.exclusiveIDs) {
          let ID = this.SL.Utils.gets('Identity');
          if (ID) {
            id = ID.getUnique((id || type.toLowerCase()), this.table);
          }
        }
        if (allowed[type] && typeof allowed[type] == 'function') {
          if (!this.table[id] || !this.config.exclusiveIDs) {
            config = config || ((this.config.config && this.config.config[id]) ? this.config.config[id] : {});
            let newEntry = new allowed[type](this.SL, config);
            newEntry.id = id;
            this.table[id] = newEntry;
            this.runCallback('#onAdd', newEntry, type);
          }
          return this.table[id];
        }
        else if (allowed[type]) {
          // if it is a singleton object type, it always gets returned no matter what id
          return allowed[type];
        }
      }
    }
  }
  getEntry(id) {
    if (this.table) {
      return this.table[id];
    }
  }
  removeEntry(id='*') {
    if (id == '*') {
      id = Object.keys(this.table);
    }
    if (id.constructor === Array) {
      let removed = [];
      id.forEach((id) => {
        if (typeof id == 'string') {
          removed.push(this.removeEntry(id));
        }
        else if (typeof id == 'object' && id.id) {
          removed.push(this.removeEntry(id.id));
        }
      });
      return removed;
    }
    else if (id && typeof id == 'string') {
      if (this.table[id]) {
        let remove = this.table[id];
        this.runCallback('#onRemove', remove);
        this.table[id] = undefined;
        delete this.table[id];
        return remove;
      }
    }
  }
  readConfigured(config, addEntry) {
    for (let id in config) {
      let type = config[id].type || id.toCamelCase().capitalizeFirstLetter();
      if (this.getEntry(id)) {
        this.removeEntry(id);
      }
      if (typeof addEntry == 'function') {
        addEntry(type, id, config[id]);
      }
      else {
        this.addEntry(type, id, config[id]);
      }
    }
  }
}
