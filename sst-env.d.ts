/* This file is auto-generated by SST. Do not edit. */
/* tslint:disable */
/* eslint-disable */
/* deno-fmt-ignore-file */

declare module "sst" {
  export interface Resource {
    "MyBucket": {
      "name": string
      "type": "sst.aws.Bucket"
    }
    "Table": {
      "name": string
      "type": "sst.aws.Dynamo"
    }
    "api": {
      "name": string
      "type": "sst.aws.Function"
      "url": string
    }
    "auth": {
      "name": string
      "type": "sst.aws.Dynamo"
    }
    "authFunction": {
      "name": string
      "type": "sst.aws.Function"
      "url": string
    }
  }
}
/// <reference path="sst-env.d.ts" />

import "sst"
export {}