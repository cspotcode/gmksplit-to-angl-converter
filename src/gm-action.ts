/// <reference path="../typings/all.d.ts" />
"use strict";

/**
 * A single drag-and-drop action within an event
 */
class GmAction {
/**
 * Returns a string of Angl code that executes this action.
 * Base indentation level should be zero (though nested blocks can be indented)
 * Do not add empty lines before or after the code, and don't add a trailing newline.
 * Use unix-style newlines.
 */
  toCode(): string {
    throw new Error('Not implemented');
  }
}

export = GmAction;
