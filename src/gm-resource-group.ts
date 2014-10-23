/// <reference path="../typings/all.d.ts" />
"use strict";

import Set = require('collections/set');

class GmResourceGroup<T> {
  
  constructor(path: Array<string> = []) {
    this.subGroups = new Set<GmResourceGroup<T>>();
    this.resources = new Set<T>();
    this.path = path.slice();
  }
  
  path: Array<string>;
  subGroups: Set<GmResourceGroup<T>>;
  resources: Set<T>;
}

export = GmResourceGroup;
