const handlebars = require('handlebars');

// Register a custom Handlebars helper for notEqual
handlebars.registerHelper('notEqual', function (a, b, options) {
  if (a !== b) {
    return options.fn(this);
  } else {
    return options.inverse(this);
  }
});

handlebars.registerHelper('equal', function (a, b, options) {
  if (a == b) {
    return options.fn(this);
  } else {
    return options.inverse(this);
  }
});


module.exports = handlebars;
