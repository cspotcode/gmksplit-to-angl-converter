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

