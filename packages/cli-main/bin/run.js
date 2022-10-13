#!/usr/bin/env node

process.removeAllListeners("warning");

import runCLI from "/Users/karreiro/src/github.com/Shopify/cli/dist/index.js";

runCLI({ development: false });
