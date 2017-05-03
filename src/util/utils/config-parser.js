var ConfigParser = {
  rounders: {
    '+': Math.ceil,
    '_': Math.floor,
    '~': Math.round
  },
  parseNumber: (value) => {
    let parse = {
      value: value,
      percent: false,
      rounding: null
    };
    if (!parse.value) {
      return parse;
    }
    let parseString = (typeof parse.value == 'string');
    if (parseString) {
      Object.keys(ConfigParser.rounders).some((key) => {
        if (parse.value.startsWith(key)) {
          parse.rounding = key;
          parse.value = parse.value.substr(key.length);
          parseString = (typeof parse.value == 'string');
          return true;
        }
      });
    }
    if (parseString && parse.value.slice(-1) == '%') {
      parse.percent = true;
      parse.value = parseFloat(parse.value)/100.0;
      parseString = (typeof parse.value == 'string');
    }
    else if (parse.value >= 0.0 && parse.value <= 1.0) {
      parse.percent = true;
    }
    if (typeof parse.value == 'string') {
      parse.value = parseFloat(parse.value);
    }
    return parse;
  },
  unparseNumber: (value, parse) => {
    if (parse.rounding && typeof ConfigParser.rounders[parse.rounding] == 'function') {
      value = ConfigParser.rounders[parse.rounding](value);
    }
    return value;
  }
};
export default ConfigParser;
