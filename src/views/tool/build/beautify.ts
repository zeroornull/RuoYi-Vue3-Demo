import jsBeautify from "js-beautify";
import type { CSSBeautifyOptions, HTMLBeautifyOptions, JSBeautifyOptions } from "js-beautify";

/**
 * Maps the legacy 1.x beautifierConf (stringy indent/wrap values, HTML e4x)
 * onto js-beautify 2.x typed options. Unknown keys are dropped, not forwarded.
 * HTML 2.x has no `e4x`; JS keeps it. `indent_scripts: "separate"` matches 1.x
 * and still splits `import { reactive } from "vue"` across lines.
 */
export const HTML_BEAUTIFY_OPTIONS: HTMLBeautifyOptions = {
  indent_size: 2,
  indent_char: " ",
  max_preserve_newlines: -1,
  preserve_newlines: false,
  indent_scripts: "separate",
  wrap_line_length: 110,
  indent_inner_html: true,
  end_with_newline: true,
  indent_empty_lines: true,
};

export const JS_BEAUTIFY_OPTIONS: JSBeautifyOptions = {
  indent_size: 2,
  indent_char: " ",
  max_preserve_newlines: -1,
  preserve_newlines: false,
  keep_array_indentation: false,
  break_chained_methods: false,
  brace_style: "end-expand",
  space_before_conditional: true,
  unescape_strings: false,
  jslint_happy: true,
  end_with_newline: true,
  wrap_line_length: 110,
  comma_first: false,
  e4x: true,
  indent_empty_lines: true,
};

export const CSS_BEAUTIFY_OPTIONS: CSSBeautifyOptions = {
  indent_size: 2,
  indent_char: " ",
  end_with_newline: true,
  indent_empty_lines: true,
};

export function beautifyHtml(source: string): string {
  return jsBeautify.html(source, HTML_BEAUTIFY_OPTIONS);
}

export function beautifyJs(source: string): string {
  return jsBeautify.js(source, JS_BEAUTIFY_OPTIONS);
}

export function beautifyCss(source: string): string {
  return jsBeautify.css(source, CSS_BEAUTIFY_OPTIONS);
}

export function beautifyVueSfc(source: string): string {
  return beautifyHtml(source);
}
