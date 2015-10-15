/**
 * schemaHelpers namespace contains helper functions for handling json-schema
 *
 */
(function (schemaHelpers) {
  'use strict';

  // read this: https://javascriptweblog.wordpress.com/2011/02/07/truth-equality-and-javascript/
  // and this: http://webreflection.blogspot.rs/2010/10/javascript-coercion-demystified.html
  // to fully understand code below

  function isNull(obj) {
    return obj == null;
  }

  function isNullOrEmpty(obj) {
    return obj == null || obj.toString() == '';
  }

  function notNull(obj) {
    return obj != null;
  }

  function notNullOrEmpty(obj) {
    return !isNullOrEmpty(obj)
  }

  function formatJson(obj) {
    return JSON.stringify(obj, null, ' ');
  }

  function capitalize(obj) {
    if (!isString(obj)) {
      return obj;
    }
    if (obj.length === 0) {
      return obj;
    }
    var
      find = obj[0],
      replace = find.toUpperCase();
    obj = obj.replace(find, replace);
    return obj;
  }

  function isString(obj) {
    return Object.prototype.toString.call(obj) === "[object String]";
  }

  schemaHelpers.isNull = isNull;
  schemaHelpers.isNullOrEmpty = isNullOrEmpty;
  schemaHelpers.notNull = notNull;
  schemaHelpers.notNullOrEmpty = notNullOrEmpty;
  schemaHelpers.formatJson = formatJson;
  schemaHelpers.capitalize = capitalize;

  var g_supported_types = ["string", "number", "daterange", "boolean", "object"];
  var g_supported_xtypes = ["password", "radio", "toggle", "enum", "lookup", "file", "image", "code", "marked", "date", "time", "datetime"];

  /**
   * For the given property definition it returns display type for that property
   * @param {Object} propertyDefinition - property definition
   * @return {String} display type
   */
  var getDisplayType = function (propertyDefinition) {
    var
      displayType = "string",
      type = propertyDefinition.type,
      xtype = propertyDefinition.xtype,
      hasEnum = !!propertyDefinition.enum;

    if (isNullOrEmpty(type)) {
      console.log("Type not declared or type is empty for property definition. Type string assigned by default.");
      console.log("Property definition: " + formatJson(propertyDefinition));
    } else {
      if (g_supported_types.indexOf(type) === -1) {
        console.log("Value " + type + " is not supported type value. Supported values are " + formatJson(g_supported_types) + ". Type string assigned by default.");
        console.log("Property definition: " + formatJson(propertyDefinition));
      } else {
        displayType = type;
        if (hasEnum) {
          displayType = "enum";
        } else if (notNullOrEmpty(xtype)) {
          if (g_supported_xtypes.indexOf(xtype) === -1) {
            console.log("Value " + xtype + " is not supported xtype value. Supported values are " + formatJson(g_supported_xtypes) + ". xtype is ignored.");
            console.log("Property definition: " + formatJson(propertyDefinition));
          } else {
            displayType = propertyDefinition.xtype;
          }
        }
      }
    }

    return displayType;
  }

  schemaHelpers.getDisplayType = getDisplayType;

}(window.schemaHelpers = window.schemaHelpers || {}));
