# Lake.js

The library is a rewrite of [lake.js](http://alligatr.co.uk/lake.js/).

## Install

```bash
npm i -S @yuheiy/lake.js
```

## Usage

```javascript
const lake = require('@yuheiy/lake.js')

const canvas = lake('path/to/image', {
  speed: 1,
  scale: 0.5,
  waves: 10,
})

document.body.appendChild(canvas)
```

## License

MIT
