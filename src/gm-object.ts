"use strict";

import GmResource = require('./gm-resource');
import GmEvent = require('./gm-event');

class GmObject implements GmResource {
  
  constructor(name: string, groupPath: Array<string>) {
    this.name = name;
    this.groupPath = groupPath.slice();
  }
  
  public name: string;
  public groupPath: Array<string>;
  public parentName: string;
  
  // TODO what is this?
  public events: Array<GmEvent> = [];
}

export = GmObject;
