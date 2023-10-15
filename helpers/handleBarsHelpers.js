const handlebars = require('handlebars');
const moment = require('moment'); 

// Register a custom helper for formatting dates
handlebars.registerHelper('formatDate', function (date, format) {
  return moment(date).format(format);
});

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
handlebars.registerHelper('increment', function (value) {
  return parseInt(value) + 1;
});
handlebars.registerHelper('decrement', function (value) { 
  return parseInt(value) - 1;
});

module.exports = handlebars;
