/// <reference path="../typings/all.d.ts" />
"use strict";

export enum Targets {
  SELF,
  OTHER,
  OBJECT
}

export class AppliesTo {
  constructor(target: Targets, objectName?: string) {
    this.target = target;
    if(this.target === Targets.OBJECT)
      this.objectName = objectName;
  }
  
  public target: Targets;
  public objectName: string;
  
  static Targets = Targets;
}

