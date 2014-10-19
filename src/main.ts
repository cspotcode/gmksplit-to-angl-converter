"use strict";
/// <reference path="../typings/all.d.ts" />

require('source-map-support').install();

import path = require('path');
import fs = require('fs');

import mkdirp = require('mkdirp');
import xmldom = require('xmldom');
import xpath = require('xpath');
import glob = require('glob');
import _ = require('lodash');

// TODO remove unused imports
import List = require('collections/list');
import Set = require('collections/set');
import Dict = require('collections/dict');
import MultiMap = require('collections/multi-map');

import misc = require('./misc');
var globOptions = misc.globOptions;
import buildResourceTree = require('./build-resource-tree');
import GmObject = require('./gm-object');
import GmScript = require('./gm-script');
import GmSprite = require('./gm-sprite');
import SpriteMaskShape = require('./sprite-mask-shape');
import SpriteBoundsMode = require('./sprite-bounds-mode');
import GmResourceGroup = require('./gm-resource-group');
import GmResource= require('./gm-resource');
import readevent = require('./read-event');
var EventReader = readevent.EventReader;
import readaction = require('./read-action');
var ActionReader = readaction.ActionReader;


/**
 * This allows code to register a callback to receive a reference to a resource, once that resource
 * has been instantiated.  This is useful because we may instantiate an object that refers to a sprite
 * before the sprite has been created.  The object can register a callback, knowing that it will
 * eventually be given a reference to the sprite.
 */
class ResourceReferenceDistributor {
  
  getResource<T extends GmResource>(type: string, name: string, callback: (resource: GmResource) => void) {
    var rtl = this.resourceTypesToListeners.get(type);
    var resource: GmResource = rtl.instantiatedResources.get(name);
    if(resource) {
      callback(resource);
    } else {
      var listener: ResourceListener = {
        callback: callback,
        name: name,
        type: type
      };
      rtl.listeners.add(name, listener);
    }
  }
  
  resourceInstantiated<T extends GmResource>(type: string, resource: T) {
    var rtl = this.resourceTypesToListeners.get(type);
    rtl.instantiatedResources.set(resource.name, resource);
    rtl.listeners.get(resource.name).forEach(function(listener) {
      listener.callback(resource);
    });
    rtl.listeners.delete(resource.name);
  }
  
  resourceTypesToListeners = new Map<string, ResourceTypeListeners>();
  
}

class ResourceTypeListeners {
  // a mapping from resource name to listeners
  listeners = new MultiMap<string, Array<ResourceListener>>();

  // A set of all resources of this type that have already been instantiated
  instantiatedResources = new Dict<GmResource>();
}

interface ResourceListener {
  callback: (resource: GmResource) => void;
  name: string;
  type: string;
}

function getDomForGmResource(resourceDirectory: string, gmResource: GmResource): Document {
  var xml = misc.readFile(resourceDirectory + '/' + misc.groupPathToFsPath(gmResource.groupPath) + '/' + misc.nameToFsName(gmResource.name) + '.xml');
  var dom = misc.parseXml(xml);
  return dom;
}

function writeOutputFileForGmResource(resourceDirectory: string, gmResource: GmResource, fileContent: string, fileExtension: string = '') {
  var outputDirectory = path.resolve(misc.outputDir, resourceDirectory, misc.groupPathToFsPath(gmResource.groupPath));
  var outputFilename = misc.nameToFsName(gmResource.name) + fileExtension;
  mkdirp.sync(outputDirectory);
  fs.writeFileSync(
    path.resolve(outputDirectory, outputFilename),
    fileContent);
}

// Build a hierarchy of all objects
var objectsTemp = buildResourceTree('Objects', GmObject);
var allObjects = objectsTemp.allResources;
var rootObjectGroup= objectsTemp.rootResourceGroup;

var eventReader = new EventReader();
var actionReader = new ActionReader();

allObjects.forEach((object) => {
  // Open the object's XML and pull out any important info
  var dom = getDomForGmResource('Objects', object);
  // fetch the name of this object's parent, if it has one
  var parentNameNode = xpath.select1('/object/parent/text()', dom);
  var parentName: string = parentNameNode ? parentNameNode.data : null;
  object.parentName = parentName;
  
  // Open all events for this object
  var eventFiles = glob.sync('Objects/' + misc.groupPathToFsPath(object.groupPath) + '/' + misc.nameToFsName(object.name) + '.events/*.xml', globOptions)
  eventFiles.forEach((file) => {
    var dom = misc.parseXml(misc.readFile(file));
    var eventNode = xpath.select1('event', dom);
    var event = eventReader.readEvent(eventNode);
    object.events.push(event);
    
    var actionNodes = xpath.select('actions/action', eventNode);
    actionNodes.forEach((actionNode) => {
      var action = actionReader.readAction(actionNode);
      event.actions.push(action);
    });
  });
  
  var compiledAnglSource = object.toAnglCode();

  writeOutputFileForGmResource('objects', object, compiledAnglSource, '.angl');
});

// Build a hierarchy of all scripts
var scriptsTemp = buildResourceTree('Scripts', GmScript);
var rootScriptsGroup = scriptsTemp.rootResourceGroup;
var allScripts = scriptsTemp.allResources;

allScripts.forEach((script) => {
  
  // Read the script's source code from the .gml file
  script.code = misc.readFile('Scripts/' + misc.groupPathToFsPath(script.groupPath) + '/' + misc.nameToFsName(script.name) + '.gml');
  
  var anglSource = script.toAnglCode();

  writeOutputFileForGmResource('scripts', script, anglSource, '.angl');
});

// Convert constants.xml into a script that declares many global constants
var dom = misc.parseXml(misc.readFile('Constants.xml'));
var constantsAnglSource = xpath.select('//constant', dom).map((node: Node): string => 'export const ' + misc.attr(node, 'name') + ' = ' + misc.attr(node, 'value') + ';').join('\n');
fs.writeFileSync(path.resolve(misc.outputDir, 'constants.angl'), constantsAnglSource);

// Convert all sprites into a directory of JSON structures.
var spritesTemp = buildResourceTree('Sprites', GmSprite);
var rootSpritesGroup = spritesTemp.rootResourceGroup;
var allSprites = spritesTemp.allResources;

function parseBoolean(str: string): boolean {
  var ret = {true: true, false: false}[str];
  if(ret == null) throw new Error('Expected "true" or "false", got "' + str + '"');
  return ret;
}

allSprites.forEach((sprite) => {
  var dom = getDomForGmResource('Sprites', sprite);
  
  var originAttrs = misc.attrs(xpath.select1('/sprite/origin', dom));
  sprite.origin.x = parseInt(originAttrs['x']);
  sprite.origin.y = parseInt(originAttrs['y']);
  sprite.mask.separate = parseBoolean(misc.innerText('sprite/mask/separate', dom));
  var shapeName, shape = SpriteMaskShape[shapeName = misc.innerText('sprite/mask/shape', dom)];
  if(typeof shape != 'number') throw new Error('Encountered unexpected sprite mask shape: ' + shapeName);
  sprite.mask.shape = shape;
  var boundsModeName, boundsMode = SpriteBoundsMode[boundsModeName = misc.attr('sprite/mask/bounds', dom, 'mode')];
  if(typeof boundsMode != 'number') throw new Error('Encountered unexpected sprite bounds mode: ' + boundsModeName);
  sprite.mask.bounds.mode = boundsMode;
  sprite.mask.bounds.alphaTolerance = parseInt(misc.attr('sprite/mask/bounds', dom, 'alphaTolerance'));
  ['left', 'right', 'top', 'bottom'].forEach((name) => {
    var num = parseInt(misc.innerText('sprite/mask/bounds/' + name, dom));
    sprite.mask.bounds[name] = _.isNaN(num) ? 0 : num;
  });
  sprite.preload = parseBoolean(misc.innerText('sprite/preload', dom));
  sprite.smoothEdges = parseBoolean(misc.innerText('sprite/smoothEdges', dom));
  sprite.transparent = parseBoolean(misc.innerText('sprite/transparent', dom));
  
  var json = sprite.toJson();

  writeOutputFileForGmResource('sprites', sprite, json, '.json');
});

// Write a JSON file listing the names of all sprites.  This can be easily loaded into the compiler to add a global
// variable for each sprite.
fs.writeFileSync(path.resolve(misc.outputDir, 'sprites.json'), JSON.stringify(allSprites.map((sprite) => sprite.name), null, '    '));
