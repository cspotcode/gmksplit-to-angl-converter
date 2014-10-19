"use strict";

import _ = require('lodash');

import GmResource = require('./gm-resource');
import misc = require('./misc');
import SpriteBoundsMode = require('./sprite-bounds-mode');
import SpriteMaskShape = require('./sprite-mask-shape');

class GmSprite implements GmResource {
  
  constructor(name: string, groupPath: Array<string>) {
    this.name = name;
    this.groupPath = groupPath.slice();
  }
  
  name: string;
  groupPath: Array<string>;

  origin = {
    x: 0,
    y: 0
  };
  mask: {
    separate: boolean; // note: I don't know what data structure is necessary for separate collision masks.
    shape: SpriteMaskShape;
    bounds: {
      alphaTolerance: number;
      mode: SpriteBoundsMode;
      left: number;
      right: number;
      top: number;
      bottom: number;
    }
  } = {
    separate: false,
    shape: SpriteMaskShape.PRECISE,
    bounds: {
      alphaTolerance: 0,
      mode: SpriteBoundsMode.AUTO,
      left: 0,
      right: 0,
      top: 0,
      bottom: 0
    }
  };
  preload = false;
  smoothEdges = false;
  transparent = true;
 
  /**
   * Returns a string of JSON that represents this sprite.  This JSON can be written to a file and loaded by the game
   * at runtime, assuming we write a game component to load sprites from JSON
   */
  toJson(): string {
    var ret: any = _.pick(
      this,
      'origin',
      'mask',
      'preload',
      'smoothEdges',
      'transparent');
    ret = _.cloneDeep(ret);
    ret.mask.shape = SpriteMaskShape[ret.mask.shape];
    ret.mask.bounds.mode = SpriteBoundsMode[ret.mask.bounds.mode];
    return JSON.stringify(ret, null, '    ');
  }

}

export = GmSprite;
