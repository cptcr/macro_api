"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PACKAGE_INFO = exports.VERSION = exports.ChatGPT = exports.DeepSeek = exports.Valorant = exports.SpotifyAPI = exports.YouTubeNotify = void 0;
var YouTubeNotify_1 = require("./classes/YouTubeNotify");
Object.defineProperty(exports, "YouTubeNotify", { enumerable: true, get: function () { return YouTubeNotify_1.YouTubeNotify; } });
var SpotifyAPI_1 = require("./classes/SpotifyAPI");
Object.defineProperty(exports, "SpotifyAPI", { enumerable: true, get: function () { return SpotifyAPI_1.SpotifyAPI; } });
var Valorant_1 = require("./classes/Valorant");
Object.defineProperty(exports, "Valorant", { enumerable: true, get: function () { return Valorant_1.Valorant; } });
var DeepSeek_1 = require("./classes/DeepSeek");
Object.defineProperty(exports, "DeepSeek", { enumerable: true, get: function () { return DeepSeek_1.DeepSeek; } });
var ChatGPT_1 = require("./classes/ChatGPT");
Object.defineProperty(exports, "ChatGPT", { enumerable: true, get: function () { return ChatGPT_1.ChatGPT; } });
exports.VERSION = '1.0.0';
exports.PACKAGE_INFO = {
    name: 'macro_api',
    version: exports.VERSION,
    description: 'A comprehensive API toolkit for various services',
    license: 'Apache-2.0',
    author: 'CPTCR',
    repository: 'https://github.com/cptcr/macro_api'
};
