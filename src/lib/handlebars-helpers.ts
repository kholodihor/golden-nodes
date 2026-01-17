import Handlebars from "handlebars";

// Register custom Handlebars helpers
export function registerHandlebarsHelpers() {
  // JSON helper to stringify objects
  Handlebars.registerHelper("json", function (context) {
    return JSON.stringify(context);
  });

  // Uppercase helper
  Handlebars.registerHelper("uppercase", function (str) {
    return str ? str.toString().toUpperCase() : "";
  });

  // Lowercase helper
  Handlebars.registerHelper("lowercase", function (str) {
    return str ? str.toString().toLowerCase() : "";
  });

  // Default value helper
  Handlebars.registerHelper("default", function (value, defaultValue) {
    return value !== undefined && value !== null && value !== ""
      ? value
      : defaultValue;
  });

  // Timestamp helper
  Handlebars.registerHelper("timestamp", function () {
    return new Date().toISOString();
  });

  // Math helper for basic operations
  Handlebars.registerHelper("math", function (lvalue, operator, rvalue) {
    lvalue = parseFloat(lvalue);
    rvalue = parseFloat(rvalue);

    switch (operator) {
      case "+":
        return lvalue + rvalue;
      case "-":
        return lvalue - rvalue;
      case "*":
        return lvalue * rvalue;
      case "/":
        return rvalue !== 0 ? lvalue / rvalue : 0;
      default:
        return lvalue;
    }
  });

  // Format date helper
  Handlebars.registerHelper("formatDate", function (date, format) {
    if (!date) return "";

    const d = new Date(date);
    if (isNaN(d.getTime())) return "";

    switch (format) {
      case "iso":
        return d.toISOString();
      case "date":
        return d.toDateString();
      case "time":
        return d.toTimeString();
      case "short":
        return d.toLocaleDateString();
      default:
        return d.toString();
    }
  });
}
