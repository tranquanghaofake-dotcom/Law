/**
 * Note: When using the Node.JS APIs, the config file
 * doesn't apply. Instead, pass options directly to the APIs.
 *
 * All configuration options: https://remotion.dev/docs/config
 */

import { Config } from "@remotion/cli/config";

Config.setRspack(true);
Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.setDefaultPremountInSeconds(2);

// Container cloud có sẵn Chromium; máy khác bỏ trống để Remotion tự tải chrome-headless-shell.
const chromium = process.env.PW_CHROMIUM ?? "/opt/pw-browsers/chromium";
import { existsSync } from "node:fs";
if (existsSync(chromium)) Config.setBrowserExecutable(chromium);
