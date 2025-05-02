"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PACKAGE_INFO = exports.VERSION = exports.GitHubAPI = exports.StripeAPI = exports.PayPalAPI = exports.NotionAPI = exports.FootballAPI = exports.ChatGPT = exports.DeepSeek = exports.Valorant = exports.SpotifyAPI = exports.YouTubeNotify = void 0;
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
var APIFootball_1 = require("./classes/APIFootball");
Object.defineProperty(exports, "FootballAPI", { enumerable: true, get: function () { return APIFootball_1.FootballAPI; } });
var Notion_1 = require("./classes/Notion");
Object.defineProperty(exports, "NotionAPI", { enumerable: true, get: function () { return Notion_1.NotionAPI; } });
var PayPal_1 = require("./classes/PayPal");
Object.defineProperty(exports, "PayPalAPI", { enumerable: true, get: function () { return PayPal_1.PayPalAPI; } });
var Stripe_1 = require("./classes/Stripe");
Object.defineProperty(exports, "StripeAPI", { enumerable: true, get: function () { return Stripe_1.StripeAPI; } });
var GitHub_1 = require("./classes/GitHub");
Object.defineProperty(exports, "GitHubAPI", { enumerable: true, get: function () { return GitHub_1.GitHubAPI; } });
exports.VERSION = '2.1.0';
exports.PACKAGE_INFO = {
    name: 'macro_api',
    version: exports.VERSION,
    description: 'A comprehensive API toolkit for various services including YouTube, Spotify, Valorant, DeepSeek, ChatGPT, and GitHub',
    license: 'Apache-2.0',
    author: 'CPTCR',
    repository: 'https://github.com/cptcr/macro_api'
};
