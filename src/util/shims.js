String.prototype.toDashCase = function() {
  return this
          .replace(/^[A-Z]/, ($1) => {
            return $1.toLowerCase();
          })
          .replace(/([A-Z])/g, ($1) => {
            return '-'+$1.toLowerCase();
          });
};
