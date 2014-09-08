/// <reference path="../typings/all.d.ts" />
"use strict";

import glob = require('glob');
import xpath = require('xpath');

import List = require('collections/list');
import Set = require('collections/set');

import misc = require('./misc');
import GmResource = require('./gm-resource');
import GmResourceGroup = require('./gm-resource-group');

function buildResourceTree<T extends GmResource>(pathRoot: string, ctor: {new(name: string, groupPath: Array<string>): T}) {

  // Build a hierarchy of all objects
  var allResources = new Set<T>();
  var rootResourceGroup = new GmResourceGroup<T>();

  // start by opening the root _resources file
  var unexploredGroups = new List<GmResourceGroup<T>>([rootResourceGroup]);

  var group;
  while (group = unexploredGroups.shift()) {
    var groupFsPath = misc.groupPathToFsPath(group.path);
    var globResult = glob.sync(pathRoot + '/' + groupFsPath + '/_resources.list.xml', misc.globOptions);
    var xml = misc.readFile(globResult[0]);
    var dom = misc.parseXml(xml);
    xpath.select('/resources/resource', dom).forEach((child:Node)=> {
      if (misc.attr(child, 'type') === 'RESOURCE') {
        // This is a resource
        var object = new ctor(misc.attr(child, 'name'), group.path);
        group.resources.add(object);
        allResources.add(object);
      } else {
        // This is a resource group, to be explored later
        var newGroupPath = group.path.slice();
        newGroupPath.push(misc.attr(child, 'name'));
        var newGroup = new GmResourceGroup<T>(newGroupPath);
        group.subGroups.add(newGroup);
        unexploredGroups.add(newGroup);
      }
    });
  }

  return {
    rootResourceGroup: rootResourceGroup,
    allResources: allResources
  };
}

export = buildResourceTree;
