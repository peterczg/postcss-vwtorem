// Jasmine unit tests
// To run tests, run these commands from the project root:
// 1. `npm install -g jasmine-node`
// 2. `jasmine-node spec`

/* global describe, it, expect */

"use strict";
var postcss = require("postcss");
var vwtorem = require("..");
var basicCSS = ".rule { font-size: 4vw }";
var filterPropList = require("../lib/filter-prop-list");

describe("vwtorem", function () {
  it("should work on the readme example", function () {
    var input =
      "h1 { margin: 0 0 3vw; font-size: 5vw; line-height: 1.2; letter-spacing: 1vw; }";
    var output =
      "h1 { margin: 0 0 0.3rem; font-size: 0.5rem; line-height: 1.2; letter-spacing: 0.1rem; }";
    var processed = postcss(vwtorem()).process(input).css;

    expect(processed).toBe(output);
  });

  it("should replace the vw unit with rem", function () {
    var processed = postcss(vwtorem()).process(basicCSS).css;
    console.log('processed', processed);
    var expected = ".rule { font-size: 0.4rem }";

    expect(processed).toBe(expected);
  });

  it("should ignore non vw properties", function () {
    var expected = ".rule { font-size: 2em }";
    var processed = postcss(vwtorem()).process(expected).css;

    expect(processed).toBe(expected);
  });


  it("should ignore vw in custom property names", function () {
    var rules =
      ":root { --rem-14vw: 14vw; } .rule { font-size: var(--rem-14vw); }";
    var expected =
      ":root { --rem-14vw: 1.4rem; } .rule { font-size: var(--rem-14vw); }";
    var options = {
      propList: ["--*", "font-size"]
    };
    var processed = postcss(vwtorem(options)).process(rules).css;

    expect(processed).toBe(expected);
  });



  it("should not add properties that already exist", function () {
    var expected = ".rule { font-size: 4vw; font-size: 0.4rem; }";
    var processed = postcss(vwtorem()).process(expected).css;

    expect(processed).toBe(expected);
  });

  it("should remain unitless if 0", function () {
    var input = ".rule { font-size: 0vw; font-size: 0; }";
    var expected = ".rule { font-size: 0rem; font-size: 0; }";
    var processed = postcss(vwtorem()).process(input).css;
    expect(processed).toBe(expected);
  });
});

describe("value parsing", function () {
  it("should not replace values in double quotes or single quotes - legacy", function () {
    var options = {
      propWhiteList: []
    };
    var rules =
      ".rule { content: '16vw'; font-family: \"16vw\"; font-size: 16vw; }";
    var expected =
      ".rule { content: '16vw'; font-family: \"16vw\"; font-size: 1.6rem; }";
    var processed = postcss(vwtorem(options)).process(rules).css;

    expect(processed).toBe(expected);
  });

  it("should not replace values in double quotes or single quotes", function () {
    var options = {
      propList: ["*"]
    };
    var rules =
      ".rule { content: '16vw'; font-family: \"16vw\"; font-size: 16vw; }";
    var expected =
      ".rule { content: '16vw'; font-family: \"16vw\"; font-size: 1.6rem; }";
    var processed = postcss(vwtorem(options)).process(rules).css;

    expect(processed).toBe(expected);
  });

  it("should not replace values in `url()` - legacy", function () {
    var options = {
      propWhiteList: []
    };
    var rules = ".rule { background: url(16vw.jpg); font-size: 16vw; }";
    var expected = ".rule { background: url(16vw.jpg); font-size: 1.6rem; }";
    var processed = postcss(vwtorem(options)).process(rules).css;

    expect(processed).toBe(expected);
  });

  it("should not replace values in `url()`", function () {
    var options = {
      propList: ["*"]
    };
    var rules = ".rule { background: url(16vw.jpg); font-size: 16vw; }";
    var expected = ".rule { background: url(16vw.jpg); font-size: 1.6rem; }";
    var processed = postcss(vwtorem(options)).process(rules).css;

    expect(processed).toBe(expected);
  });

  it("should not replace values with an uppercase V or W", function () {
    var options = {
      propList: ["*"]
    };
    var rules =
      ".rule { margin: 12vw calc(100% - 14VW); height: calc(100% - 20vw); font-size: 12Vw; line-height: 16vw; }";
    var expected =
      ".rule { margin: 1.2rem calc(100% - 14VW); height: calc(100% - 2rem); font-size: 12Vw; line-height: 1.6rem; }";
    var processed = postcss(vwtorem(options)).process(rules).css;

    expect(processed).toBe(expected);
  });
});

describe("rootValue", function () {
  // Deprecate
  it("should replace using a root value of 10 - legacy", function () {
    var expected = ".rule { font-size: 0.2rem }";
    var options = {
      root_value: 20
    };
    var processed = postcss(vwtorem(options)).process(basicCSS).css;

    expect(processed).toBe(expected);
  });

  it("should replace using a root value of 10", function () {
    var expected = ".rule { font-size: 0.4rem }";
    var options = {
      rootValue: 10
    };
    var processed = postcss(vwtorem(options)).process(basicCSS).css;

    expect(processed).toBe(expected);
  });

  it("should replace using different root values with different files", function () {
    var css2 = ".rule { font-size: 8vw }";
    var expected = ".rule { font-size: 0.4rem }";
    var options = {
      rootValue: function (input) {
        if (input.from.indexOf("basic.css") !== -1) {
          return 10;
        }
        return 20;
      }
    };
    var processed1 = postcss(vwtorem(options)).process(basicCSS, {
      from: "/tmp/basic.css"
    }).css;
    var processed2 = postcss(vwtorem(options)).process(css2, {
      from: "/tmp/whatever.css"
    }).css;

    expect(processed1).toBe(expected);
    expect(processed2).toBe(expected);
  });
});

describe("unitPrecision", function () {
  // Deprecate
  it("should replace using a decimal of 2 places - legacy", function () {
    var expected = ".rule { font-size: 0.4rem }";
    var options = {
      unit_precision: 2
    };
    var processed = postcss(vwtorem(options)).process(basicCSS).css;

    expect(processed).toBe(expected);
  });

  it("should replace using a decimal of 2 places", function () {
    var expected = ".rule { font-size: 0.4rem }";
    var options = {
      unitPrecision: 2
    };
    var processed = postcss(vwtorem(options)).process(basicCSS).css;

    expect(processed).toBe(expected);
  });
});

describe("propWhiteList", function () {
  // Deprecate
  it("should only replace properties in the white list - legacy", function () {
    var expected = ".rule { font-size: 4vw }";
    var options = {
      prop_white_list: ["font"]
    };
    var processed = postcss(vwtorem(options)).process(basicCSS).css;

    expect(processed).toBe(expected);
  });

  it("should only replace properties in the white list - legacy", function () {
    var expected = ".rule { font-size: 4vw }";
    var options = {
      propWhiteList: ["font"]
    };
    var processed = postcss(vwtorem(options)).process(basicCSS).css;

    expect(processed).toBe(expected);
  });

  it("should only replace properties in the white list - legacy", function () {
    var css = ".rule { margin: 10vw; margin-left: 10vw }";
    var expected = ".rule { margin: 1rem; margin-left: 10vw }";
    var options = {
      propWhiteList: ["margin"]
    };
    var processed = postcss(vwtorem(options)).process(css).css;

    expect(processed).toBe(expected);
  });

  it("should only replace properties in the prop list", function () {
    var css =
      ".rule { font-size: 10vw; margin: 10vw; margin-left: 5vw; padding: 5vw; padding-right: 10vw }";
    var expected =
      ".rule { font-size: 1rem; margin: 1rem; margin-left: 5vw; padding: 5vw; padding-right: 1rem }";
    var options = {
      propWhiteList: ["*font*", "margin*", "!margin-left", "*-right", "pad"]
    };
    var processed = postcss(vwtorem(options)).process(css).css;

    expect(processed).toBe(expected);
  });

  it("should only replace properties in the prop list with wildcard", function () {
    var css =
      ".rule { font-size: 16vw; margin: 10vw; margin-left: 5vw; padding: 5vw; padding-right: 16vw }";
    var expected =
      ".rule { font-size: 16vw; margin: 1rem; margin-left: 5vw; padding: 5vw; padding-right: 16vw }";
    var options = {
      propWhiteList: ["*", "!margin-left", "!*padding*", "!font*"]
    };
    var processed = postcss(vwtorem(options)).process(css).css;

    expect(processed).toBe(expected);
  });

  it("should replace all properties when white list is empty", function () {
    var rules = ".rule { margin: 10vw; font-size: 15vw }";
    var expected = ".rule { margin: 1rem; font-size: 1.5rem }";
    var options = {
      propWhiteList: []
    };
    var processed = postcss(vwtorem(options)).process(rules).css;

    expect(processed).toBe(expected);
  });
});

describe("selectorBlackList", function () {
  // Deprecate
  it("should ignore selectors in the selector black list - legacy", function () {
    var rules = ".rule { font-size: 15vw } .rule2 { font-size: 15vw }";
    var expected = ".rule { font-size: 1.5rem } .rule2 { font-size: 15vw }";
    var options = {
      selector_black_list: [".rule2"]
    };
    var processed = postcss(vwtorem(options)).process(rules).css;

    expect(processed).toBe(expected);
  });

  it("should ignore selectors in the selector black list", function () {
    var rules = ".rule { font-size: 15vw } .rule2 { font-size: 15vw }";
    var expected = ".rule { font-size: 1.5rem } .rule2 { font-size: 15vw }";
    var options = {
      selectorBlackList: [".rule2"]
    };
    var processed = postcss(vwtorem(options)).process(rules).css;

    expect(processed).toBe(expected);
  });

  it("should ignore every selector with `body$`", function () {
    var rules =
      "body { font-size: 16vw; } .class-body$ { font-size: 16vw; } .simple-class { font-size: 16vw; }";
    var expected =
      "body { font-size: 1.6rem; } .class-body$ { font-size: 16vw; } .simple-class { font-size: 1.6rem; }";
    var options = {
      selectorBlackList: ["body$"]
    };
    var processed = postcss(vwtorem(options)).process(rules).css;

    expect(processed).toBe(expected);
  });

  it("should only ignore exactly `body`", function () {
    var rules =
      "body { font-size: 16vw; } .class-body { font-size: 16vw; } .simple-class { font-size: 16vw; }";
    var expected =
      "body { font-size: 16vw; } .class-body { font-size: 1.6rem; } .simple-class { font-size: 1.6rem; }";
    var options = {
      selectorBlackList: [/^body$/]
    };
    var processed = postcss(vwtorem(options)).process(rules).css;

    expect(processed).toBe(expected);
  });
});

describe("replace", function () {
  it("should leave fallback pixel unit with root em value", function () {
    var options = {
      replace: false
    };
    var processed = postcss(vwtorem(options)).process(basicCSS).css;
    var expected = ".rule { font-size: 4vw; font-size: 0.4rem }";

    expect(processed).toBe(expected);
  });
});

describe("mediaQuery", function () {
  // Deprecate
  it("should replace vw in media queries", function () {
    var options = {
      media_query: true
    };
    var processed = postcss(vwtorem(options)).process(
      "@media (min-width: 50vw) { .rule { font-size: 16vw } }"
    ).css;
    var expected = "@media (min-width: 5rem) { .rule { font-size: 1.6rem } }";

    expect(processed).toBe(expected);
  });

  it("should replace vw in media queries", function () {
    var options = {
      mediaQuery: true
    };
    var processed = postcss(vwtorem(options)).process(
      "@media (min-width: 50vw) { .rule { font-size: 16vw } }"
    ).css;
    var expected = "@media (min-width: 5rem) { .rule { font-size: 1.6rem } }";

    expect(processed).toBe(expected);
  });
});

describe("minPixelValue", function () {
  it("should not replace values below minPixelValue", function () {
    var options = {
      propWhiteList: [],
      minPixelValue: 2
    };
    var rules =
      ".rule { border: 1vw solid #000; font-size: 16vw; margin: 1vw 10vw; }";
    var expected =
      ".rule { border: 1vw solid #000; font-size: 1.6rem; margin: 1vw 1rem; }";
    var processed = postcss(vwtorem(options)).process(rules).css;

    expect(processed).toBe(expected);
  });
});

describe("filter-prop-list", function () {
  it('should find "exact" matches from propList', function () {
    var propList = [
      "font-size",
      "margin",
      "!padding",
      "*border*",
      "*",
      "*y",
      "!*font*"
    ];
    var expected = "font-size,margin";
    expect(filterPropList.exact(propList).join()).toBe(expected);
  });

  it('should find "contain" matches from propList and reduce to string', function () {
    var propList = [
      "font-size",
      "*margin*",
      "!padding",
      "*border*",
      "*",
      "*y",
      "!*font*"
    ];
    var expected = "margin,border";
    expect(filterPropList.contain(propList).join()).toBe(expected);
  });

  it('should find "start" matches from propList and reduce to string', function () {
    var propList = [
      "font-size",
      "*margin*",
      "!padding",
      "border*",
      "*",
      "*y",
      "!*font*"
    ];
    var expected = "border";
    expect(filterPropList.startWith(propList).join()).toBe(expected);
  });

  it('should find "end" matches from propList and reduce to string', function () {
    var propList = [
      "font-size",
      "*margin*",
      "!padding",
      "border*",
      "*",
      "*y",
      "!*font*"
    ];
    var expected = "y";
    expect(filterPropList.endWith(propList).join()).toBe(expected);
  });

  it('should find "not" matches from propList and reduce to string', function () {
    var propList = [
      "font-size",
      "*margin*",
      "!padding",
      "border*",
      "*",
      "*y",
      "!*font*"
    ];
    var expected = "padding";
    expect(filterPropList.notExact(propList).join()).toBe(expected);
  });

  it('should find "not contain" matches from propList and reduce to string', function () {
    var propList = [
      "font-size",
      "*margin*",
      "!padding",
      "!border*",
      "*",
      "*y",
      "!*font*"
    ];
    var expected = "font";
    expect(filterPropList.notContain(propList).join()).toBe(expected);
  });

  it('should find "not start" matches from propList and reduce to string', function () {
    var propList = [
      "font-size",
      "*margin*",
      "!padding",
      "!border*",
      "*",
      "*y",
      "!*font*"
    ];
    var expected = "border";
    expect(filterPropList.notStartWith(propList).join()).toBe(expected);
  });

  it('should find "not end" matches from propList and reduce to string', function () {
    var propList = [
      "font-size",
      "*margin*",
      "!padding",
      "!border*",
      "*",
      "!*y",
      "!*font*"
    ];
    var expected = "y";
    expect(filterPropList.notEndWith(propList).join()).toBe(expected);
  });
});

describe("exclude", function () {
  it("should ignore file path with exclude RegEx", function () {
    var options = {
      exclude: /exclude/i
    };
    var processed = postcss(vwtorem(options)).process(basicCSS, {
      from: "exclude/path"
    }).css;
    expect(processed).toBe(basicCSS);
  });

  it("should not ignore file path with exclude String", function () {
    var options = {
      exclude: "exclude"
    };
    var processed = postcss(vwtorem(options)).process(basicCSS, {
      from: "exclude/path"
    }).css;
    expect(processed).toBe(basicCSS);
  });

  it("should not ignore file path with exclude function", function () {
    var options = {
      exclude: function (file) {
        return file.indexOf("exclude") !== -1;
      }
    };
    var processed = postcss(vwtorem(options)).process(basicCSS, {
      from: "exclude/path"
    }).css;
    expect(processed).toBe(basicCSS);
  });

  it("should only replace properties in the prop list with wildcard", function () {
    var input =
      "h1 { margin: 0 0 20rpx; font-size: 32rpx; line-height: 1.2; letter-spacing: 1rpx; width: 30vw;}";
    var output =
      "h1 { margin: 0 0 2rem; font-size: 3.2rem; line-height: 1.2; letter-spacing: 0.1rem; width: 30vw;}";
    var options = {
      unit: "rpx",
      propList: ["*"]
    };
    var processed = postcss(vwtorem(options)).process(input).css;

    expect(processed).toBe(output);
  });
});
