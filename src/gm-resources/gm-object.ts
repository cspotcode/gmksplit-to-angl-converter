/// <reference path="../../typings/all.d.ts" />
"use strict";

import fs = require('fs');
import _ = require('lodash');

import misc = require('../misc');
import GmResource = require('../gm-resource');
import GmEvent = require('../gm-event');

var template;
var init = function() {
  template = _.template(fs.readFileSync('./templates/object-template.tmpl.angl', 'utf-8'));
};
init = _.once(init);

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
  
  toAnglCode(): string {
    init();
    return template({
      object: this,
      misc: misc
    });
  }
}

export = GmObject;
