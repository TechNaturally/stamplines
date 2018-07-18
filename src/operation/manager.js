import Component from '../core/component.js';
import * as Ops from './ops/_index.js';
export default class OperationManager extends Component {
  constructor(SL, config) {
    super(SL, config);
    this.Timers = {};
    this.initialized = true;
    this.configure(config);
  }
  configure(config) {
    config = super.configure(config);
    if (!config.Ops) {
      config.Ops = {};
    }
    if (!config.Timer) {
      config.Timer = {};
    }
    if (!config.Timer.defaultInterval) {
      config.Timer.defaultInterval = (30 * 1000);
    }
    if (!config.Timer.Timers) {
      config.Timer.Timers = {};
    }
    this.initEventHandlers();
  }
  reset() {
    super.reset();
    this.resetEventHandlers();
    this.resetTimers(undefined, true);
  }

  initEventHandlers() {
    if (!this.initialized) {
      return;
    }
    if (!this.eventHandlers) {
      this.eventHandlers = {};
    }
    if (!this.eventHandlers.ResetAutoTimers) {
      this.eventHandlers.ResetAutoTimers = this.SL.Paper.on('Ops.ResetAutoTimers', undefined, (args, item) => {
        this.resetTimers();
        if (args && args.restart) {
          this.startTimers();
        }
      }, 'OpsResetAutoTimers');
    }
  }
  resetEventHandlers() {
    if (!this.initialized || !this.eventHandlers) {
      return;
    }
    if (this.eventHandlers.ResetAutoTimers) {
      this.SL.Paper.off('Ops.ResetAutoTimers', this.eventHandlers.ResetAutoTimers.id);
      delete this.eventHandlers.ResetAutoTimers;
      this.eventHandlers.ResetAutoTimers = undefined;
    }
  }


  canRun(operation, args={}) {
    return (Ops[operation] && Ops[operation].canRun(args) && (!this.config.Ops[operation] || !this.config.Ops[operation].disabled));
  }
  run(operation, args={}) {
    if (this.canRun(operation, args)) {
      return new Promise((resolve, reject) => {
        let opConfig = this.config.Ops[operation] || {};
        let op = new Ops[operation](this.SL, opConfig);
        if (op) {
          let ran = op.run(args);
          if (ran && ran.constructor.name == 'Promise') {
            ran.then(result => {
              resolve(result);
            })
            .catch(error => {
              reject(error);
            });
          }
          else {
            resolve(ran);
          }
        }
      });
    }
    else {
      throw `Operation "${operation}" not found!`;
    }
  }

  getTimer(timerID, createMissing=true) {
    if (timerID) {
      let Timer = this.Timers[timerID];
      if (!Timer && createMissing) {
        this.Timers[timerID] = {
          timerID: timerID,
          config: ((typeof createMissing === 'object' && createMissing) || this.config.Timer.Timers[timerID] || {})
        };
        Timer = this.Timers[timerID];
        Timer.interval = ((Timer.config && Timer.config.interval) || this.config.Timer.defaultInterval);
        Timer.maxCounter = (Timer.config.maxReps || -1); 
        Timer.counter = 0;
      }
      return Timer;
    }
  }

  startTimers(timers) {
    if (!timers) {
      timers = this.config.Timer.Timers;
    }
    for (let timerID in timers) {
      let Timer = this.getTimer(timerID, timers[timerID]);
      this.resetTimer(timerID);
      Timer.counter = 0;
      Timer.running = setInterval(() => {
        let operations = [];
        let resultContainers = {};
        if (Timer.config && Timer.config.operations) {
          for (let op of Timer.config.operations) {
            if (op.Op && this.canRun(op.Op, op.args)) {
              try {
                let operation = this.run(op.Op, op.args);
                if (operation) {
                  resultContainers[operations.length] = {
                    Op: op.Op,
                    args: op.args
                  };
                  operations.push(operation);
                }
              }
              catch (error) {}
            }
          }
        }
        Promise.all(operations)
          .then((results) => {
            let resultMap = [];
            for (let resultIndex in results) {
              let result = results[resultIndex];
              let resultContainer = resultContainers[resultIndex] || {};
              resultContainer.result = result;
              resultMap.push(resultContainer);
            }
            if (Timer.callbacks) {
              for (let callback of Timer.callbacks) {
                callback(resultMap);
              }
            }
          });

        Timer.counter++;
        if (Timer.maxCounter > 0 && Timer.counter >= Timer.maxCounter) {
          this.stopTimer(Timer.timerID);
        }
      }, Timer.interval);
    }
  }
  stopTimers(timerIDs, deleteTimer=false) {
    if (!timerIDs) {
      timerIDs = Object.keys(this.Timers);
    }
    if (Array.isArray(timerIDs)) {
      for (let timerID of timerIDs) {
        this.stopTimer(timerID, deleteTimer);
      }
    }
  }
  stopTimer(timerID, deleteTimer=false) {
    let Timer = this.getTimer(timerID, false);
    if (Timer) {
      if (Timer.running) {
        clearInterval(Timer.running);
        Timer.running = false;
      }
      if (deleteTimer) {
        delete this.Timers[timerID];
        this.Timers[timerID] = undefined;
      }
    }
  }
  resetTimers(timerIDs, deleteTimer=false) {
    if (!timerIDs) {
      timerIDs = Object.keys(this.Timers);
    }
    if (Array.isArray(timerIDs)) {
      for (let timerID of timerIDs) {
        this.resetTimer(timerID, deleteTimer);
      }
    }
  }
  resetTimer(timerID, deleteTimer=false) {
    let Timer = this.getTimer(timerID, false);
    if (Timer) {
      this.stopTimer(timerID, deleteTimer);
      Timer.counter = 0;
    }
  }

  addTimerCallback(timerID, callback) {
    if (timerID && callback) {
      let Timer = this.getTimer(timerID);
      if (!Timer.callbacks) {
        Timer.callbacks = [];
      }
      // allows duplicate callbacks, caution to callers
      Timer.callbacks.push(callback);
    }
  }
  dropTimerCallback(timerID, callback=undefined) {
    let Timer = this.getTimer(timerID, false);
    if (Timer && Timer.callbacks) {
      if (callback) {
        let callbackIndex = Timer.callbacks.indexOf(callback);
        let sanity = Timer.callbacks.length;
        while (callbackIndex != -1 && sanity) {
          Timer.callbacks.splice(callbackIndex, 1);
          callbackIndex = Timer.callbacks.indexOf(callback);
          sanity--;
        }
      }
      else {
        Timer.callbacks.length = 0;
      }
    }
  }
}
