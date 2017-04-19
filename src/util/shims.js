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
