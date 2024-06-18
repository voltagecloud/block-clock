# Block Clock

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
[![Latest Version](https://img.shields.io/npm/v/block-clock)](https://npmjs.org/package/block-clock)
[![npm](https://img.shields.io/npm/dm/block-clock)](https://www.npmjs.com/package/package-name)

A customizable, zero-dependency clock for your Bitcoin Core node.

![blockclock-gif](./src/assets/blockclock.gif)

## Table of Contents

- [Block Clock](#block-clock)
  - [Table of Contents](#table-of-contents)
  - [Quick Start](#quick-start)
    - [CDN](#cdn)
    - [NPM](#npm)
    - [Basic Usage (Pure HTML)](#basic-usage-pure-html)
  - [How it Works](#how-it-works)
    - [XState](#xstate)
    - [Creating a Bitcoin Core Node with Voltage](#creating-a-bitcoin-core-node-with-voltage)
  - [Usage](#usage)
    - [React](#react)
    - [Sveltekit](#sveltekit)
    - [Connecting to Bitcoin Core RPC locally](#connecting-to-bitcoin-core-rpc-locally)
  - [Reference](#reference)
  - [Storybook](#storybook)
  - [Contributing](#contributing)
  - [License](#license)

## Quick Start

### CDN

```html
<script
  type="module"
  src="https://unpkg.com/block-clock@0.0.4/dist/index.js"
></script>
```

### NPM

```bash
npm install block-clock
```

### Basic Usage (Pure HTML)

```html
<block-clock
  rpcUser="<YOUR_RPC_USER>"
  rpcPassword="<YOUR_RPC_PASSWORD>"
  rpcEndpoint="<YOUR_RPC_ENDPOINT>"
  darkMode
>
</block-clock>
```

## How it Works

`block-clock` is a working [web component](https://developer.mozilla.org/en-US/docs/Web/API/Web_components) implementation of the [Block Clock](https://bitcoincore.app/block-clock/) designed by the [Bitcoin Design Community](https://bitcoin.design/) for the [work-in-progress Bitcoin Core App design](https://bitcoincore.app/). The goal of that project is to provide a more intuitive and visually appealing frontend for Bitcoin Core nodes, and `block-clock` is a part of that effort.

The `block-clock` works by consuming a set of Bitcoin Core RPC credentials at an endpoint and a set of (optional) props. It can also accept a callback for Bitcoin Core nodes behind a proxy, so long as the response data returned by the proxy matches response returned by Bitcoin Core. Using these, it fetches block data and calculates the time between block confirmations to create a visual display of when each block was mined.

The visualization begins at blocks that were mined within the last 12 hour period. It shows the blocks mined starting from either 12 A.M. or 12 P.M. to the current local time. Therefore, the "fill" of the clock always represents the current local time down to the second. **Note**: There is also a 1-hour interval mode which can be turned on by setting `oneHourIntervals` on the `block-clock` component. This is useful if you want to see the past hour's block times. It is also highly recommended to use when connecting [Mutinynet](https://blog.mutinywallet.com/mutinynet/) nodes. Mutinynet is a fork of Bitcoin Core which uses 30-second block times to make developing applications easier. Because block times are so short, the clock may not function properly if using the default 12-hour intervals.

By default, unconfirmed blocks are shown in gray and confirmed blocks are shown in shades from red to yellow. The first 6 most recently confirmed blocks having a tint of red, with the most recently confirmed block being completely red, and the next 5 blocks being progressively more yellow, after which the color remains consistent. These colors are [fully configurable](#reference).

As block data is loaded, it is saved in [localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) in the browser, so that subsequent visits to the page or refreshes won't require data to be reloaded. Only blocks that have been mined since the last block saved to `localStorage` will need to be loaded.

### XState

`block-clock` uses [XState](https://xstate.js.org/) to create [state machines](https://stately.ai/docs/state-machines-and-statecharts) that make it easy to model how events change the state of the clock. This has the benefit of making the state changes in the clock easier to reason about, as well as import into other projects.

See the state machine [here](https://stately.ai/registry/editor/embed/402d1195-dae1-47eb-8243-61603229448c?machineId=f266798b-807d-4733-b6ae-80b62ff6d91d&mode=design).

### Creating a Bitcoin Core Node with Voltage

[Voltage](https://voltage.cloud) is a quick way to get a Bitcoin Core node up and running, and the `block-clock` is also integrated on our site. See our [docs]() for more info on creating a Bitcoin Core node.

## Usage

`block-clock` can be used anywhere web components can be used. When working with purely client-side frameworks like [React](https://react.dev/), you may import and use it directly, like so:

### React

```jsx
import "block-clock";

function App() {
  return (
    <div className="App">
      ...
      <div style={{ width: 200, height: 200 }}>
        <block-clock
          rpcUser="<YOUR_RPC_USER>"
          rpcPassword="<YOUR_RPC_PASSWORD>"
          rpcEndpoint="<YOUR_RPC_ENDPOINT>"
          darkMode
        ></block-clock>
      </div>
      ...
    </div>
  );
}

export default App;
```

In SSR frameworks like [Sveltekit](https://kit.svelte.dev/) or [NextJS](https://nextjs.org/), be sure to wait for the DOM to load first before importing:

### Sveltekit

```svelte
<script lang="ts">
	import { onMount } from 'svelte';
	onMount(() => {
		import('block-clock');
	});
</script>

<div style="display: flex; justify-content: center; align-items: center; height: 100vh">
	<div style="width: 200px; height: 200px;">
		<block-clock
			rpcUser="<YOUR_RPC_USER>"
			rpcPassword="<YOUR_RPC_PASSWORD>"
			rpcEndpoint="<YOUR_RPC_ENDPOINT>"
			darkMode
		>
		</block-clock>
	</div>
</div>
```

### Connecting to Bitcoin Core RPC locally

By default, Bitcoin Core RPC doesn't handle CORS headers so if you try to connect the blockclock from your browser to a locally running Bitcoin Core instance it will fail.
You can solve this putting the RPC endpoint behind a proxy, for example:

```bash
npx local-cors-proxy --proxyUrl http://localhost:8332
```

Where `8332` is the port of the bitcoin core RPC REST server.
Then use the proxy url provided in your node's `rpcEndpoint`.

As an example, here is some code you can use to run a pruned node locally to test the block clock:

```
~/your/path/to/bitcoin-core/bin/bitcoind \
-rpcuser=admin \
-rpcpassword=admin \
-rpcport=8332 \
-assumevalid=00000000000000000000b863b337fc0fa521dc17b25d1b7b22c78e0609316a6d \
-prune=600
```

This sets `admin` as the rpc user and password.
If you need instructions on how to install bitcoin core checkout [this video (Mac)](https://www.youtube.com/watch?v=hMo4QeHVXiI) or look for a tutorial for your specific operating system.

## Reference

| Attribute          | Type                                                                                                | Description | Default                                                                                                                                                                                                                                                                                                                                                                                                                                                | Example                                                                                                       |
| ------------------ | --------------------------------------------------------------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| `rpcUser `         | `string`                                                                                            | Required.   |                                                                                                                                                                                                                                                                                                                                                                                                                                                        | `<MY-USERNAME>`                                                                                               |
| `rpcPassword`      | `string`                                                                                            | Required.   |                                                                                                                                                                                                                                                                                                                                                                                                                                                        | `<MY-PASSWORD>`                                                                                               |
| `darkMode`         | `boolean`                                                                                           | Optional.   | `false`                                                                                                                                                                                                                                                                                                                                                                                                                                                | Whether the clock should display in dark mode.                                                                |
| `devMode`          | `boolean`                                                                                           | Optional.   | `false`                                                                                                                                                                                                                                                                                                                                                                                                                                                | devMode has some extra logging to simplify the development process.                                           |
| `oneHourIntervals` | `boolean`                                                                                           | Optional.   | Whether the clock should reset every hour. Defaults to `false`                                                                                                                                                                                                                                                                                                                                                                                         |
| (i.e. 12 hours).   |
| `theme`            | [`BlockClockTheme`](https://github.com/voltagecloud/block-clock/blob/master/src/lib/types.ts#L1-L5) | Optional.   | The color theme(s) for the blocks. The first color in the array represents the unconfirmed transactions. The index of the item between the first and the last items in the array represent the color of that block's confirmations + 1 (i.e., the color at i = 2 is the color of the block with 1 confirmation, i = 3 is the color of the block with 2 confirmations, etc.). The last color in the array represents the color of all remaining blocks. | See [`DEFAULT_THEME`](https://github.com/voltagecloud/block-clock/blob/master/src/utils/constants.ts#L5-L17). |

## Storybook

To see the [storybook](https://storybook.js.org/) and play around with the various attributes:

```bash
yarn storybook
```

## Contributing

If you find a problem, please [open an issue](https://github.com/voltagecloud/block-clock/issues/new). PRs welcome!

## License

MIT
