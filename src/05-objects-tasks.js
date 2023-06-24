/* ************************************************************************************************
 *                                                                                                *
 * Please read the following tutorial before implementing tasks:                                   *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object        *
 *                                                                                                *
 ************************************************************************************************ */

/**
 * Returns the rectangle object with width and height parameters and getArea() method
 *
 * @param {number} width
 * @param {number} height
 * @return {Object}
 *
 * @example
 *    const r = new Rectangle(10,20);
 *    console.log(r.width);       // => 10
 *    console.log(r.height);      // => 20
 *    console.log(r.getArea());   // => 200
 */
function Rectangle(width, height) {
  this.width = width;
  this.height = height;

  this.getArea = () => this.width * this.height;
}

/**
 * Returns the JSON representation of specified object
 *
 * @param {object} obj
 * @return {string}
 *
 * @example
 *    [1,2,3]   =>  '[1,2,3]'
 *    { width: 10, height : 20 } => '{"height":10,"width":20}'
 */
function getJSON(obj) {
  return JSON.stringify(obj);
}

/**
 * Returns the object of specified type from JSON representation
 *
 * @param {Object} proto
 * @param {string} json
 * @return {object}
 *
 * @example
 *    const r = fromJSON(Circle.prototype, '{"radius":10}');
 *
 */
function fromJSON(proto, json) {
  const obj = {};
  Object.setPrototypeOf(obj, proto);
  Object.assign(obj, JSON.parse(json));
  return obj;
}

/**
 * Css selectors builder
 *
 * Each complex selector can consists of type, id, class, attribute, pseudo-class
 * and pseudo-element selectors:
 *
 *    element#id.class[attr]:pseudoClass::pseudoElement
 *              \----/\----/\----------/
 *              Can be several occurrences
 *
 * All types of selectors can be combined using the combination ' ','+','~','>' .
 *
 * The task is to design a single class, independent classes or classes hierarchy
 * and implement the functionality to build the css selectors using the provided cssSelectorBuilder.
 * Each selector should have the stringify() method to output the string representation
 * according to css specification.
 *
 * Provided cssSelectorBuilder should be used as facade only to create your own classes,
 * for example the first method of cssSelectorBuilder can be like this:
 *   element: function(value) {
 *       return new MySuperBaseElementSelector(...)...
 *   },
 *
 * The design of class(es) is totally up to you, but try to make it as simple,
 * clear and readable as possible.
 *
 * @example
 *
 *  const builder = cssSelectorBuilder;
 *
 *  builder.id('main').class('container').class('editable').stringify()
 *    => '#main.container.editable'
 *
 *  builder.element('a').attr('href$=".png"').pseudoClass('focus').stringify()
 *    => 'a[href$=".png"]:focus'
 *
 *  builder.combine(
 *      builder.element('div').id('main').class('container').class('draggable'),
 *      '+',
 *      builder.combine(
 *          builder.element('table').id('data'),
 *          '~',
 *           builder.combine(
 *               builder.element('tr').pseudoClass('nth-of-type(even)'),
 *               ' ',
 *               builder.element('td').pseudoClass('nth-of-type(even)')
 *           )
 *      )
 *  ).stringify()
 *    => 'div#main.container.draggable + table#data ~ tr:nth-of-type(even)   td:nth-of-type(even)'
 *
 *  For more examples see unit tests.
 */

function CssSelector(value, type) {
  this.value = value;
  this.type = type;

  this.stringify = () => {
    switch (this.type) {
      case 'element':
        return this.value;
      case 'id':
        return `#${this.value}`;
      case 'class':
        return `.${this.value}`;
      case 'attr':
        return `[${this.value}]`;
      case 'pseudoClass':
        return `:${this.value}`;
      case 'pseudoElement':
        return `::${this.value}`;
      default:
        return `${this.value}`;
    }
  };
}

function ComplexCssSelector(value, type) {
  this.selectors = [new CssSelector(value, type)];
  this.idCount = (type === 'id') ? 1 : 0;
  this.pseudoElementCount = (type === 'pseudoElement') ? 1 : 0;
  this.wrongOrder = 'Selector parts should be arranged in the following order: element, id, class, attribute, pseudo-class, pseudo-element';
  this.doubleSelectors = 'Element, id and pseudo-element should not occur more then one time inside the selectorElement, id and pseudo-element should not occur more then one time inside the selector';
  this.order = ['element', 'id', 'class', 'attr', 'pseudoClass', 'pseudoElement'];

  this.add = (val, t) => {
    const lastType = this.selectors[this.selectors.length - 1].type;
    if (this.order.indexOf(lastType) > this.order.indexOf(t)) {
      throw new Error(this.wrongOrder);
    }
    this.selectors.push(new CssSelector(val, t));
    return this;
  };

  this.element = () => {
    const lastType = this.selectors[this.selectors.length - 1].type;
    if (lastType === 'element') {
      throw new Error(this.doubleSelectors);
    } else {
      throw new Error(this.wrongOrder);
    }
  };

  this.id = (val) => {
    if (this.idCount > 0) {
      throw new Error(this.doubleSelectors);
    }
    this.idCount += 1;
    return this.add(val, 'id');
  };

  this.class = (val) => this.add(val, 'class');

  this.attr = (val) => this.add(val, 'attr');

  this.pseudoClass = (val) => this.add(val, 'pseudoClass');

  this.pseudoElement = (val) => {
    if (this.pseudoElementCount > 0) {
      throw new Error(this.doubleSelectors);
    }
    this.pseudoElementCount += 1;
    return this.add(val, 'pseudoElement');
  };

  this.stringify = () => this.selectors.reduce((agg, item) => agg + item.stringify(), '');
}

function CombineCssSelector(selector1, operator, selector2) {
  this.selector1 = selector1;
  this.operator = operator;
  this.selector2 = selector2;

  this.stringify = () => `${this.selector1.stringify()} ${this.operator} ${this.selector2.stringify()}`;
}

const cssSelectorBuilder = {

  element(value) {
    return new ComplexCssSelector(value, 'element');
  },

  id(value) {
    return new ComplexCssSelector(value, 'id');
  },

  class(value) {
    return new ComplexCssSelector(value, 'class');
  },

  attr(value) {
    return new ComplexCssSelector(value, 'attr');
  },

  pseudoClass(value) {
    return new ComplexCssSelector(value, 'pseudoClass');
  },

  pseudoElement(value) {
    return new ComplexCssSelector(value, 'pseudoElement');
  },

  combine(selector1, combinator, selector2) {
    return new CombineCssSelector(selector1, combinator, selector2);
  },
};

module.exports = {
  Rectangle,
  getJSON,
  fromJSON,
  cssSelectorBuilder,
};
