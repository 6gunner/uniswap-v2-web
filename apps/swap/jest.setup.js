// eslint-disable-next-line @typescript-eslint/no-var-requires
const { TextDecoder, TextEncoder } = require("util");
global.TextDecoder = TextDecoder;
global.TextEncoder = TextEncoder;
