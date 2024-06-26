# postcss-vw2rem 

A plugin for [PostCSS](https://github.com/ai/postcss) that generates rem units from vw units.

This project is forked from [postcss-pxtorem](https://github.com/cuth/postcss-pxtorem) under the MIT license.

## Why

In some tablet or android fold devices, someone may think that arbitrarily scalling the size is inappropriate and that the size needs to be limited. `vw` is directly related to screen width, while `rem` can be restricted. 

## Install

```shell
$ npm install postcss postcss-vw2rem --save-dev
```

## Usage

Pixels are the easiest unit to use (*opinion*). The only issue with them is that they don't let browsers change the default font size of 16. This script converts every vw value to a rem from the properties you choose to allow the browser to set the font size.


### Note

`rootValue` below is set to `16`, so you can relate to the examples of `postcss-pxtorem`.

While the default value is set to `10` in real project⚠️.

### Input/Output

*With the default settings, only font related properties are targeted.*

```css
// input
h1 {
    margin: 0 0 20vw;
    font-size: 32vw;
    line-height: 1.2;
    letter-spacing: 1vw;
}

// output
h1 {
    margin: 0 0 20vw;
    font-size: 2rem;
    line-height: 1.2;
    letter-spacing: 0.0625rem;
}
```

### Example

```js
var fs = require('fs');
var postcss = require('postcss');
var vw2rem = require('postcss-vw2rem');
var css = fs.readFileSync('main.css', 'utf8');
var options = {
    replace: false
};
var processedCss = postcss(vw2rem(options)).process(css).css;

fs.writeFile('main-rem.css', processedCss, function (err) {
  if (err) {
    throw err;
  }
  console.log('Rem file written.');
});
```

### options

Type: `Object | Null`  
Default:
```js
{
    rootValue: 16,
    unitPrecision: 5,
    propList: ['font', 'font-size', 'line-height', 'letter-spacing', 'word-spacing'],
    selectorBlackList: [],
    replace: true,
    mediaQuery: false,
    minPixelValue: 0,
    exclude: /node_modules/i
}
```

- `rootValue` (Number | Function) Represents the root element font size or returns the root element font size based on the [`input`](https://api.postcss.org/Input.html) parameter
- `unitPrecision` (Number) The decimal numbers to allow the REM units to grow to.
- `propList` (Array) The properties that can change from vw to rem.
    - Values need to be exact matches.
    - Use wildcard `*` to enable all properties. Example: `['*']`
    - Use `*` at the start or end of a word. (`['*position*']` will match `background-position-y`)
    - Use `!` to not match a property. Example: `['*', '!letter-spacing']`
    - Combine the "not" prefix with the other prefixes. Example: `['*', '!font*']`
- `selectorBlackList` (Array) The selectors to ignore and leave as vw.
    - If value is string, it checks to see if selector contains the string.
        - `['body']` will match `.body-class`
    - If value is regexp, it checks to see if the selector matches the regexp.
        - `[/^body$/]` will match `body` but not `.body`
- `replace` (Boolean) Replaces rules containing rems instead of adding fallbacks.
- `mediaQuery` (Boolean) Allow vw to be converted in media queries.
- `minPixelValue` (Number) Set the minimum pixel value to replace.
- `exclude` (String, Regexp, Function) The file path to ignore and leave as vw.
    - If value is string, it checks to see if file path contains the string.
        - `'exclude'` will match `\project\postcss-vw2rem\exclude\path`
    - If value is regexp, it checks to see if file path matches the regexp.
        - `/exclude/i` will match `\project\postcss-vw2rem\exclude\path`
    - If value is function, you can use exclude function to return a true and the file will be ignored.
        - the callback will pass the file path as  a parameter, it should returns a Boolean result.
        - `function (file) { return file.indexOf('exclude') !== -1; }`
- `unit` (String) Set the default unit to convert, default is `vw`.

### Use with gulp-postcss and autoprefixer

```js
var gulp = require('gulp');
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var vw2rem = require('postcss-vw2rem');

gulp.task('css', function () {

    var processors = [
        autoprefixer({
            browsers: 'last 1 version'
        }),
        vw2rem({
            replace: false
        })
    ];

    return gulp.src(['build/css/**/*.css'])
        .pipe(postcss(processors))
        .pipe(gulp.dest('build/css'));
});
```

### A message about ignoring properties
Currently, the easiest way to have a single property ignored is to use a capital in the pixel unit declaration.

```css
// `vw` is converted to `rem`
.convert {
    font-size: 16vw; // converted to 1rem
}

// `Vx` or `VW` is ignored by `postcss-vw2rem` but still accepted by browsers
.ignore {
    border: 1vw solid; // ignored
    border-width: 2vw; // ignored
}
```
