/**
 * schemaHelpers namespace contains helper functions for handling json-schema
 *
 */
(function(schemaHelpers) {
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

  var isPropertyNameValid = function(propertyName) {
    // propertyName should contain only lowercase letters, numbers and underscores. It should start with underscore or lowercase letter
    // regex should be used
    var result = isString(propertyName) && propertyName.indexOf(' ') === -1;
    if (!result) {
      console.log('Property name: ' + propertyName + ' is invalid. Property name can contain lowercase letters, numbers and underscores. It must start with a lowercase letter or an underscore.');
      console.log('See: schema-helepers.js -> isPropertyNameValid function');
    }
    return result;
  }
  schemaHelpers.isPropertyNameValid = isPropertyNameValid;

  /**
   * For the given property definition it returns display type for that property
   * @param {Object} propertyDefinition - property definition
   * @return {String} display type
   */
  var getDisplayType = function(propertyDefinition) {
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

  var AtFormFactory = {
    // creates an at-form-element based on property definition in schema.properties
    createElement: function(propertyName, displayType, propertyDefinition) {
      var
        element = AtFormFactory[displayType](propertyDefinition),
        label = notNull(propertyDefinition.title) ? propertyDefinition.title : capitalize(propertyName),
        required = Boolean(propertyDefinition.required),
        disabled = Boolean(propertyDefinition.disabled),
        description = notNull(propertyDefinition.description) ? propertyDefinition.description : ' ';

      if (propertyName.indexOf(' ') === -1) {
        Polymer.dom(element).classList.add(propertyName);
      }

      element.label = label;
      element.required = required;
      element.disabled = disabled;

      return element;
    },
    string: function(propertyDefinition) {
      var result = document.createElement('at-form-input');
      if (notNull(propertyDefinition.placeholder)) {
        result.placeholder = propertyDefinition.placeholder;
      }
      return result;
    },
    number: function(propertyDefinition) {
      var result = AtFormFactory['string'](propertyDefinition);
      result.type = 'number';
      return result;
    },
    password: function(propertyDefinition) {
      var result = document.createElement('at-form-password');
      if (notNull(propertyDefinition.placeholder)) {
        result.placeholder = propertyDefinition.placeholder;
      }
      return result;
    },
    boolean: function(propertyDefinition) {
      var result = document.createElement('at-form-checkbox');
      return result;
    },
    toggle: function(propertyDefinition) {
      var result = document.createElement('at-form-checkbox');
      result.toggle = true;
      return result;
    },
    enum: function(propertyDefinition) {
      var result = document.createElement('at-form-lookup');
      if (notNull(propertyDefinition.enum)) {
        result.available = propertyDefinition.enum;
      } else if (notNull(propertyDefinition.xvaluelist)) {
        result.available = propertyDefinition.xvaluelist;
      }
      return result;
    },
    lookup: function(propertyDefinition) {
      var result = document.createElement('at-form-lookup');
      if (notNullOrEmpty(propertyDefinition.xurl)) {
        result.url = propertyDefinition.xurl;
      }
      if (notNullOrEmpty(propertyDefinition.params)) {
        result.params = propertyDefinition.params;
      }
      result.noCredentials = Boolean(propertyDefinition.noCredentials);
      result.noPreload = Boolean(propertyDefinition.noPreload);
      return result;
    },
    code: function(propertyDefinition) {
      var result = document.createElement('at-form-codemirror');
      if (notNullOrEmpty(propertyDefinition.mode)) {
        result.mode = propertyDefinition.mode;
      }
      return result;
    },
    marked: function(propertyDefinition) {
      var result = document.createElement('at-form-markdown');
      return result;
    },
    file: function(propertyDefinition) {
      var result = document.createElement('at-form-file');
      result.icon = !!propertyDefinition.icon ? propertyDefinition.icon : result.icon;
      result.accept = !!propertyDefinition.accept ? propertyDefinition.accept : result.accept;
      result.directory = !!propertyDefinition.directory ? propertyDefinition.directory : result.directory;
      result.extensions = !!propertyDefinition.extensions ? propertyDefinition.extensions : result.extensions;
      result.maxFiles = !!propertyDefinition.maxFiles ? propertyDefinition.maxFiles : result.maxFiles;
      result.maxSize = !!propertyDefinition.maxSize ? propertyDefinition.maxSize : result.maxSize;
      result.minSize = !!propertyDefinition.minSize ? propertyDefinition.minSize : result.minSize;
      return result;
    },
    image: function(propertyDefinition) {
      var result = document.createElement('at-form-image');
      result.accept = !!propertyDefinition.accept ? propertyDefinition.accept : result.accept;
      result.directory = !!propertyDefinition.directory ? propertyDefinition.directory : result.directory;
      result.extensions = !!propertyDefinition.extensions ? propertyDefinition.extensions : result.extensions;
      result.maxFiles = !!propertyDefinition.maxFiles ? propertyDefinition.maxFiles : result.maxFiles;
      result.maxSize = !!propertyDefinition.maxSize ? propertyDefinition.maxSize : result.maxSize;
      result.minSize = !!propertyDefinition.minSize ? propertyDefinition.minSize : result.minSize;
      return result;
    },
    object: function(propertyDefinition) {
      var result = document.createElement('at-form-complex');
      if (notNull(propertyDefinition.properties)) {
        var schemaValues = convertPropertiesToSchemaValues(propertyDefinition.properties);
        result.schema = schemaValues.schema;
        result.value = schemaValues.values;
      }
      return result;
    },
    date: function(propertyDefinition) {
      var result = document.createElement('at-form-date');
      result.format = 'YYYY-MM-DD';
      return result;
    },
    time: function(propertyDefinition) {
      var result = document.createElement('at-form-date');
      result.format = 'hh:mm:ss';
      return result;
    },
    datetime: function(propertyDefinition) {
      var result = document.createElement('at-form-date');
      result.format = 'YY-MM-DD hh:mm:ss';
      return result;
    },
    daterange: function(propertyDefinition) {
      var result = document.createElement('at-form-daterange');
      return result;
    },
    radio: function(propertyDefinition) {
      var result = document.createElement('at-form-radio');
      if (notNull(propertyDefinition.xvaluelist)) {
        result.valuelist = propertyDefinition.xvaluelist;
      }
      return result;
    }
  };

  var convertPropertiesToSchemaValues = function(properties) {
    var result = {
        schema: {
          properties: {}
        },
        values: {}
      },
      propDef,
      propObj;

    Object.keys(properties).forEach(function(property) {
      propObj = result.schema.properties[property] = {};
      propDef = properties[property];
      Object.keys(propDef).forEach(function(innerProp) {
        if (innerProp === 'value') {
          result.values[property] = propDef[innerProp];
        } else {
          propObj[innerProp] = propDef[innerProp];
        }
      });
    });

    return result;
  };

  schemaHelpers.AtFormFactory = AtFormFactory;

}(window.schemaHelpers = window.schemaHelpers || {}));
