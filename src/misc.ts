/// <reference path="../typings/all.d.ts" />
"use strict";

import path = require('path');
import fs = require('fs');

import glob = require('glob');
import _ = require('lodash');
import xmldom = require('xmldom');
import xpath = require('xpath');

export var gmkToXmlBaseDir = '../Gang-Garrison-2/Source/gg2';

export var outputDir = '../gg2-transpiling/angl';

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

export function attrs(node: Node);
export function attrs(xpath: string, node: Node);
export function attrs(xpath: any, node?: Node) {
  var _node = getNode(xpath, node);
  if(!_node) return null;
  return <{[k: string]: string}>_(_node.attributes)
    .map((v: Attr) => [v.name, v.value])
    .zipObject()
    .value();
}

export function attr(node: Node, attrName: string): string;
export function attr(xpathExpr: string, node: Node, attrName: string): string;
export function attr(xpathExpr: any, node: any, attrName?: string): string {
  var _node: Node;
  if(typeof attrName === 'undefined') {
    // 2-argument signature
    attrName = node;
    _node = xpathExpr;
  } else {
    // 3-argument signature
    _node = getNode(xpathExpr, node);
  }
  if(!_node) return null;
  var attr = _node.attributes.getNamedItem(attrName);
  return attr ? attr.value : null;
}

export function innerText(node: Node): string;
export function innerText(xpathExpr: string, node: Node): string;
export function innerText(xpathExpr: any, node?: Node): string {
  var targetNode = getNode(xpathExpr, node);
  if(!targetNode) return null;
  var textNode = xpath.select1('text()', targetNode);
  if(!textNode) return null;
  return textNode.data;
}

function getNode(node: Node): Node;
function getNode(xpathExpr: string, node: Node): Node;
function getNode(xpathExpr: any, node?: Node): Node {
  // normalize arguments
  var _xpath: string,
    _node: Node;
  if(node) {
    _xpath = xpathExpr;
    _node = node;
  } else {
    _xpath = null;
    _node = xpathExpr;
  }
  return _xpath ? xpath.select1(_xpath, _node) : _node;
}

export function capsWithUnderscoresToCamelCase(identifier: string, initialCaps: boolean = false): string {
  var parts = identifier.split('_');
  return parts.map((v, i) => {
    var r = v.toLowerCase();
    if(i || initialCaps)
      r = r.replace(/^./, function(v) {return v.toUpperCase();});
    return r;
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
