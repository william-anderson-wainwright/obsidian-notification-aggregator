# Obsidian Notification Aggregator

An Obsidian plugin that aggregates default in-app notifications into a single, expandable notification. This prevents multiple notifications from overwhelming the UI and distracting from the UX, while still allowing the user to read those notifications if desired.

## Features
- Intercepts and hides native Obsidian `.notice` elements as they are created.
- Aggregates multiple notices into a single "You have x notifications" bubble.
- Expanding the bubble reveals a scrollable list of all collected messages.
- Dismissing the aggregated notice clears the queue.

## Installation

### Using BRAT
Since this plugin is in beta, it can be installed using the [BRAT](https://github.com/TfTHacker/obsidian42-brat) plugin:
1. Install the BRAT plugin from the Community Plugins list.
2. Go to **Settings > BRAT > Add Beta plugin**.
3. Enter the repository path: `william-anderson-wainwright/obsidian-notification-aggregator`
4. Enable the plugin in your Community Plugins settings.

### Manual Installation
1. Download the latest release from the GitHub releases page.
2. Extract the files (`main.js`, `manifest.json`, `styles.css`) into your vault's plugins folder: `<vault>/.obsidian/plugins/obsidian-notification-aggregator/`
3. Reload Obsidian and enable the plugin.

## Development
To build the plugin locally:
```bash
npm install
npm run build
```
You can use `npm run dev` to continuously build the plugin in watch mode.

To deploy locally to a vault (assuming the vault is located at `../../notes`):
```bash
npm run deploy
```

## Releasing
Creating and pushing a Git tag (e.g., `1.0.0`) will automatically trigger the GitHub Actions release workflow to compile and attach the build artifacts for BRAT.
