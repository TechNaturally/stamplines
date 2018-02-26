String.prototype.capitalizeFirstLetter = function() {
  return this.charAt(0).toUpperCase() + this.slice(1);
};
String.prototype.toDashCase = function() {
  return this
          .replace(/^[A-Z]/, ($1) => {
            return $1.toLowerCase();
          })
          .replace(/([A-Z])/g, ($1) => {
            return '-'+$1.toLowerCase();
          });
};
String.prototype.toCamelCase = function() {
  return this
          .replace(/([\-_\.][a-z])/g, ($1) => {
            return $1.toUpperCase().replace('-','');
          });
};
Date.prototype.getDateTimeStamp = function() {
  let hours = this.getHours();
  let minutes = this.getMinutes();
  let seconds = this.getSeconds();
  return this.getDateStamp() + '-' + [
    (hours > 9 ? '' : '0') + hours,
    (minutes > 9 ? '' : '0') + minutes,
    (seconds > 9 ? '' : '0') + seconds
  ].join('');
};
Date.prototype.getDateStamp = function() {
  let month = this.getMonth()+1;
  let day = this.getDate();
  return [this.getFullYear(),
    (month > 9 ? '' : '0') + month,
    (day > 9 ? '' : '0') + day
  ].join('');
};
