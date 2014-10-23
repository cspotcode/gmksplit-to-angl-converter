/// <reference path="../../typings/all.d.ts" />
"use strict";

import fs = require('fs');
import path = require('path');

import glob = require('glob');
import xmldom = require('xmldom');
import xpath = require('xpath');

import misc = require('../misc');
var globOptions = misc.globOptions;
var readFile = misc.readFile;

var filenames = glob.sync('Objects/**/*.events/*.xml', globOptions);

var domParser = new xmldom.DOMParser();

interface Arrayish<T> {
  length: number;
  [i: number]: T;
}

var each = function<T>(array: Arrayish<T>, callback: (v: T, i: number, a: Arrayish<T>) => void) {
  return Array.prototype.forEach.call(array, callback);
}

var map = function<T>(array: Arrayish<T>, callback: (v: T, i: number, a: Arrayish<T>) => void) {
  return Array.prototype.map.call(array, callback);
}

var filter = function<T>(array: Arrayish<T>, callback: (v: T, i: number, a: Arrayish<T>) => void) {
  return Array.prototype.filter.call(array, callback);
}

interface Action {
  objectName: string;
  event: string;
  eventNonIdAttributes: string;
  actionId: string;
  actionOther: string;
  actionName: string;
  appliesTo: string;
}

var actions: Array<Action> = [];
filenames.forEach((filename) => {
  var dom = domParser.parseFromString(readFile(filename), 'text/xml');
  var objectName = filename.split('/').slice(-2, -1)[0].replace(/\.events$/, '');
  xpath.select('//event', dom).forEach((event: Node) => {
    var eventName: string = xpath.select('string(@category)', event) + ':' + xpath.select('string(@id)', event);
    var eventNonIdAttributes = filter(event.attributes, (v) => (!~['id', 'category'].indexOf(v.name))).map((v) => (v.nodeName + ':' + v.value));
    xpath.select('//action', event).forEach((action: Node) => {
      // Find any non-ID attributes
      var actionId = xpath.select('string(@library)', action) + ':' + xpath.select('string(@id)', action);
      var actionName = action.childNodes[1].nodeValue.replace('action name: ', '');
      var nonIdAttributes = filter(action.attributes, (v) => (!~['id', 'library'].indexOf(v.name))).map((v) => (v.nodeName + ':' + v.value));
      var appliesTo = xpath.select('string(appliesTo/text())', action);
      
      actions.push({
        objectName: objectName,
        event: eventName,
        eventNonIdAttributes: eventNonIdAttributes.join(';'),
        actionId: actionId,
        actionOther: nonIdAttributes.join(';'),
        actionName: actionName,
        appliesTo: appliesTo
      });
    });
  });
});

var csv = '';
actions.forEach((action) => {
  csv += [
    action.objectName,
    action.event, action.eventNonIdAttributes || 'N/A',
    action.actionId, action.actionOther, action.actionName,
    action.appliesTo
  ].join(',') + '\n';
});

fs.writeFileSync('actiondump.csv', csv);
