/// <reference path="../typings/all.d.ts" />
"use strict";

import path = require('path');
import fs = require('fs');

import glob = require('glob');
import _ = require('lodash');
import xmldom = require('xmldom');

export var gmkToXmlBaseDir = '../Gang-Garrison-2/Source/gg2';

export var outputDir = './output';

export var globOptions:glob.IOptions = {
  cwd: path.resolve(gmkToXmlBaseDir)
};

export var codeIndentation = '    ';

export function indentCode(code: string, levels: number = 1) {
  var lines = code.split('\n');
  var indentation = '';
  for(var i = levels; i > 0; i--) indentation += codeIndentation;
  return indentation + lines.join('\n' + indentation);
}

export function readFile(filePath: string): string {
  return fs.readFileSync(path.resolve(gmkToXmlBaseDir, filePath), 'utf-8');
}

export var domParser = new xmldom.DOMParser();

export function parseXml(xml: string): Document {
  return domParser.parseFromString(xml, 'text/xml');
}

export function attrs(node: Node) {
  return <{[k: string]: string}>_(node.attributes)
    .map((v: Attr) => [v.name, v.value])
    .zipObject()
    .value();
}

export function attr(node: Node, attrName: string) {
  var attr = node.attributes.getNamedItem(attrName);
  return attr ? attr.value : null;
}

export function capsWithUnderscoresToCamelCase(identifier: string, initialCaps: boolean = false): string {
  var parts = identifier.split('_');
  return parts.map((v, i) => {
    var r = v.toLowerCase();
    if(i || initialCaps)
      r[0] = r[0].toUpperCase();
  }).join('');
}

export function groupPathToFsPath(groupPath: Array<string>): string {
  return groupPath.map(nameToFsName).join('/');
}

/**
 * Sanitizes a name to be compatible with the filesystem.
 * This is used when you want to know the filename for a GM resource, such as an object.
 * @param name
 * @returns {string}
 */
export function nameToFsName(name: string): string {
  return name.replace(/\//g, '_');
}

var curlyBraceAtBeginning = /^\s*{/;
var curlyBraceAtEnd = /}\s*$/;
export function removeUnnecessaryIndentation(code: string): string {
  // Is this code prefixed by some comments?  Pull them off, then add them back after removing any wrapping curly braces.
  // TODO implement this.
  
  // Remove any curly braces wrapping the code
  // For example, "{\n    what\n}\n" should become "\n    what\n"
  var matchBegin = curlyBraceAtBeginning.exec(code);
  var matchEnd = curlyBraceAtEnd.exec(code);
  // Only remove curly braces if we found one at the beginning and end of the code
  if(matchBegin && matchEnd) {
    code = code.slice(matchBegin[0].length, matchEnd.index);
  }
  
  // Re-add any prefixing comments that we removed earlier (see above)
  // TODO implement this.
  
  // Find minimum indentation level for the code (level of indent that can be remove from *all* lines)
  var codeLines = code.split('\n');
  var minimumIndent = _(codeLines).map((line) => {
    // If this line is purely whitespace, we can exclude it from consideration
    if(line.match(/^\s*$/))
        return Infinity;
    // Otherwise, return the number of spaces at the start of the line (the indentation)
    return line.match(/ */)[0].length;
  }).min().value();
  
  // Remove minimum indent from each line and re-combine them
  return codeLines.map((line) => line.slice(minimumIndent)).join('\n');

}

/**
 * Convert all line endings to Unix-style (\n) from Windows-style (\r\n)
 * @param code
 * @returns {string}
 */
export function normalizeLineEndings(code: string): string {
  return code.replace(/\r\n/g, '\n');
}
