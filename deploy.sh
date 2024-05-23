#!/bin/sh

pnpm build && firebase deploy --only hosting:gymtools
