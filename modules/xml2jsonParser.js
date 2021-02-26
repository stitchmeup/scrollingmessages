const xml2jsonParser = require("xml2json")
//const formatXml = require("xml-formatter")
//const fs = require("fs");

xml2jsonParser.isTypeObject = (obj) => typeof obj == "object" && obj != null;


// Parse object, array, string, null in a same way (type agnostic)
// callback function is applied to all object of obj if it is an array or obj itself
xml2jsonParser.parseObj = function(obj, callback, args) {
  // If not of type Object, return the object
  if (!this.isTypeObject(obj)) return new Promise(resolve => resolve(obj));

  if (Array.isArray(obj)) {
    // Array of promises
    let ret = [];
    for (let key in obj) {
      // push promises with callback on every element in array
      ret.push(new Promise(
        resolve => resolve(callback.apply(this, [obj[key]].concat(args)))
      ));
    }
    // Removes undefined and null element
    return Promise.all(ret)
    .then((res) => res.filter((element) => element !== undefined && element !== null ));
  } else {
    return new Promise(
      resolve => resolve(callback.apply(this, [obj].concat(args))
    ));
  }
}

xml2jsonParser.parseForContent = function(obj, content) {
  if (content.includes(obj.$t)) return obj;
  return null;
}

xml2jsonParser.parseForAttr = function(str, attr) {
  // NOT SURE
  // NOT TESTED
  if (attr.includes(str)) return str;
  return null;
}

// Parse a xml object with a corresponding scheme
// Recursive function
//
// A XML document has one root section,
// so orignal xml obj has only one enumerable property
//
// scheme describe the result xml object wanted:
// exemple:
// scheme = { root: {
//  $strict: false,
//  tag1: { $content: ['value1', value2]},
//  tag2: true,
//  tag3: {
//    $strict: true,
//    tag4: { $attr: ['value']}
//    tag5: true,
//  }
//}}
//will return a xml object with all subsection tag2 and tag3 of root
// and only section tag1 with specified content
// and will return tag3 with tag4 and tag5 only if tag 4 attribute match value
//
// all content $t not describe in the scheme is kept
xml2jsonParser.modifyXmlObj = async function(obj, scheme) {
  // Sanity check
  if (!this.isTypeObject(obj) || Object.keys(obj).length === 0) return obj;
  if (!this.isTypeObject(scheme) || Object.keys(scheme).length === 0) return obj;

  // Begin parsing
  let newObj = {}
  // Loop though property (xml element) (one depth at a time)
  for (let element in obj) {
    // Content ($t) are kept automatically
    if (element === '$t') {
      newObj[element] = obj[element];
      continue;
    }

    // Check element is a property of scheme (one depth at a time)
    if (scheme.hasOwnProperty(element)) {
      // If it holds a boolean, and it is true, keep it
      if (typeof scheme[element] === 'boolean' && scheme[element]) {
        ret = obj[element];

        // Parse for content
      } else if (scheme[element].hasOwnProperty('$content')) {
        ret = await this.parseObj(obj[element],
          (obj, content) => this.parseForContent(obj, content),
          [scheme[element].$content]
        ).then((res) => res)

        // Parse for attribute
      } else if (scheme[element].hasOwnProperty('$attr')) {
        // TO DO /!\
        ret = obj[element];
        // TO DO /!\

        // else go one depth deeper into obj and kept
      } else {
        ret = await this.parseObj(obj[element],
          (obj, scheme) => this.modifyXmlObj(obj, scheme),
          [scheme[element]]
        ).then((res) => res)
      }
      newObj[element] = ret;

      // Else keep parsing
    } else {
      ret = await this.parseObj(obj[element],
        (obj, scheme) => this.modifyXmlObj(obj, scheme),
        [scheme]
      ).then((res) => res)
      newObj[element] = ret;
    }
  }

  // clean property with subproperty with null content
  // uses $strict to determine if we remove whole property or only the subproperty
  for (prop in newObj) {
    if (newObj[prop] === null
      || (Array.isArray(newObj[prop]) && newObj[prop].length === 0)
    ) {
      if (scheme.hasOwnProperty('$strict') && scheme.$strict) {
        newObj = null;
        break;
      } else {
        delete newObj[prop];
      }
    }
  }
  return newObj;
}

/*
let scheme = {
  scene: {
    $strict: true,
    title: true,
    numero: true,
    timing: {
      time: true,
      text: true,
      equipe: {
        $strict: true,
        id: {
          $content: ['01']
        },
        message: true
      }
    }
  }
}

let xmlFilePath = "./public/generic_xml.xml"
// Callback must be async too
fs.readFile(xmlFilePath, async function(err, data) {
  const xmlObj = xml2jsonParser.toJson(data, { reversible: true, object: true })
  const xmlObjModified = await xml2jsonParser.modifyXmlObj(xmlObj, scheme).then((res) => res);
  console.log(xmlObjModified['piece']['scene'][0]['timing']);
  const stringifiedXmlObj = JSON.stringify(xmlObjModified)
  const finalXml = xml2jsonParser.toXml(stringifiedXmlObj)
  console.log(formatXml(finalXml, { "collapseContent": true }));
})
*/
module.exports = xml2jsonParser;
