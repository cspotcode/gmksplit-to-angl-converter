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

// Build a hierarchy of all objects
var objectsTemp = buildResourceTree('Objects', GmObject);
var allObjects = objectsTemp.allResources;
var rootObjectGroup= objectsTemp.rootResourceGroup;

var eventReader = new EventReader();
var actionReader = new ActionReader();

var objectTemplate: string = fs.readFileSync('./templates/object-template.tmpl.angl', 'utf-8');
var compiledObjectTemplate = _.template(objectTemplate);

allObjects.forEach((object) => {
  // Open the object's XML and pull out any important info
  var xml = misc.readFile('Objects/' + misc.groupPathToFsPath(object.groupPath) + '/' + misc.nameToFsName(object.name) + '.xml');
  var dom = misc.parseXml(xml);
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
  
  // try dumping this object's source code, just to see what it looks like
  var compiledAnglSource = compiledObjectTemplate({
    object: object,
    misc: misc
  });
  
  var outputDirectory = path.resolve(misc.outputDir, 'objects', misc.groupPathToFsPath(object.groupPath));
  var outputFilename = misc.nameToFsName(object.name) + '.angl';
  mkdirp.sync(outputDirectory);
  fs.writeFileSync(
    path.resolve(outputDirectory, outputFilename),
    compiledAnglSource);
});

// Build a hierarchy of all scripts
var scriptsTemp = buildResourceTree('Scripts', GmScript);
var rootScriptsGroup = scriptsTemp.rootResourceGroup;
var allScripts = scriptsTemp.allResources;

allScripts.forEach((script) => {
  
  // Read the script's source code from the .gml file
  script.code = misc.readFile('Scripts/' + misc.groupPathToFsPath(script.groupPath) + '/' + misc.nameToFsName(script.name) + '.gml');
  
  var anglSource = script.toAnglCode();
  
  var outputDirectory = path.resolve(misc.outputDir, 'scripts', misc.groupPathToFsPath(script.groupPath));
  var outputFilename = misc.nameToFsName(script.name) + '.angl';
  mkdirp.sync(outputDirectory);
  fs.writeFileSync(
    path.resolve(outputDirectory, outputFilename),
    anglSource);
});

// Convert constants.xml into a script that declares many global constants
var dom = misc.parseXml(misc.readFile('Constants.xml'));
var constantsAnglSource = xpath.select('//constant', dom).map((node: Node): string => 'export const ' + misc.attr(node, 'name') + ' = ' + misc.attr(node, 'value') + ';').join('\n');
fs.writeFileSync(path.resolve(misc.outputDir, 'constants.angl'), constantsAnglSource);
