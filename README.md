# 📦 macro\_api

A comprehensive TypeScript-based toolkit that streamlines integration with popular APIs:

* **YouTube** – channel monitoring with Discord notifications
* **Spotify** – full-featured API client
* **Valorant** – player stats and match history
* **DeepSeek** – AI-powered chat and code generation
* **ChatGPT** – modern OpenAI interface with function-calling support ([github.com][1])

Licensed under Apache 2.0, written in TypeScript 4.9.5, and ideal for DevOps, CI/CD, DevSecOps, and production-ready environments.

---

## 🌟 Features by Module

### YouTube Notification System

Effortlessly polls YouTube channels for new uploads, with optional webhook-driven alerts to Discord or other platforms—perfect for building notification bots or automating updates.

### Spotify API

A TypeScript-first, comprehensive wrapper supporting OAuth2 flows, search, playlist management, playback control, and user account access—designed for full-scale Spotify integration.

### Valorant Stats

Retrieve player account info, competitive MMR, match history, K/D ratios, favorite agents, and aggregated statistics across ranked modes.

### DeepSeek AI

Leverage DeepSeek’s capabilities for prompt-based chat, code generation, and multi-message conversations via lightweight, promise-based interfaces.

### ChatGPT (OpenAI)

Advanced OpenAI support—offering `createChatCompletion`, function-calling tools, streaming responses, embeddings, model listing, and utility shortcuts like `chat()` and `conversation()`.

---

## 🚀 Why You Should Choose It

* **Unified API interface**: Work with multiple major platforms using a consistent, type-safe toolkit.
* **TypeScript-friendly**: Full typings boost developer productivity and reduce runtime errors.
* **Production-grade**: Supports real-time notifications, streaming, and OAuth flows.
* **Extensible modular design**: Pick and integrate only the services you need.
* **Trusted licensing**: Apache 2.0 ensures compatibility with commercial and open-source projects.

---

## 🧑‍💻 Installation & Setup

Install from npm:

```bash
npm install macro_api
# or
yarn add macro_api
```

Ensure you have valid API credentials for each chosen service—YouTube, Spotify, Valorant, DeepSeek, and OpenAI.

---

## 🧠 Core Concepts & Patterns

* **Modular classes**: Each API feature (e.g. `SpotifyAPI`, `Valorant`, `DeepSeek`, `ChatGPT`, `YouTubeNotify`) is exposed as its own class or utility.
* **Promise-based calls**: All operations use promises, allowing clean, async/await workflows.
* **OAuth & Webhooks**: Native support for Spotify’s OAuth2 and Discord webhook notifications for YouTube alerts.
* **Stream & Batch**: ChatGPT supports both streaming and batch messages, with embeddings and function-calling baked in.

---

## 📚 Documentation & References

Extensive docs and API references are available on the official site:
[https://macro.cptcr.dev/documentation](https://macro.cptcr.dev/documentation)

Explore method signatures, available options, environment-variable requirements, and idiomatic use-cases for each service:

* OAuth flow patterns
* Webhook setup guidelines
* Rate-limiting considerations
* Practical response parsing

---

## 🧪 Testing & Quality Assurance

Comes bundled with TypeScript definitions, ESLint and Prettier configs, and a test suite under `__tests__`. Ensures reliability across CI/CD pipelines, static analysis, and pre-commit checks.

---

## ⚙️ Use Cases

* **Bots & automation**: New video alerts, Spotify playlist sync, Valorant performance bots.
* **AI-powered tools**: DeepSeek/ChatGPT multi-step interactions, function calling, and streaming data handling.
* **Analytics dashboards**: Combine Spotify, Valorant, and YouTube data in admin panels or internal tools.
* **Hybrid AI apps**: Create conversational tools using OpenAI while enriching responses with specialized data sources.

---

## 🤝 Contributing

Contributions welcome! Whether you're adding new API support, improving docs, writing tests, or addressing issues:

1. Fork the repository
2. Create a feature or fix branch
3. Implement changes with types, tests, and lint
4. Submit a PR with context and justification

Refer to CHANGELOG.md for release notes and breaking changes.

---

## 📜 License

Licensed under [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0). See LICENSE file for full terms.

---

## 🔗 Useful Links

* GitHub repo: `cptcr/macro_api` ([github.com][1])
* Live documentation: [https://macro.cptcr.dev/documentation](https://macro.cptcr.dev/documentation)
* Release notes: see `CHANGELOG.md` in the repo
