import { TokenList } from "@repo/token-lists";
import schema from "@repo/token-lists/src/tokenlist.schema.json";
import Ajv from "ajv";

/**
 * Given a URI that may be ipfs, ipns, http, or https protocol, return the fetch-able http(s) URLs for the same content
 * @param uri to convert to fetch-able http url
 */
function uriToHttp(uri: string): string[] {
  const protocol = uri.split(":")[0].toLowerCase();
  const hash = protocol === "ipfs" ? uri.match(/^ipfs:(\/\/)?(.*)$/i)?.[2] : undefined;
  const name = protocol === "ipns" ? uri.match(/^ipns:(\/\/)?(.*)$/i)?.[2] : undefined;
  switch (protocol) {
    case "https":
      return [uri];
    case "http":
      return ["https" + uri.substr(4), uri];
    case "ipfs":
      return [`https://cloudflare-ipfs.com/ipfs/${hash}/`, `https://ipfs.io/ipfs/${hash}/`];
    case "ipns":
      return [`https://cloudflare-ipfs.com/ipns/${name}/`, `https://ipfs.io/ipns/${name}/`];
    default:
      return [];
  }
}

const tokenListValidator = new Ajv({ allErrors: true }).compile(schema);

/**
 * Contains the logic for resolving a list URL to a validated token list
 * @param listUrl list url
 */
export default async function getTokenList(listUrl: string): Promise<TokenList> {
  const urls = uriToHttp(listUrl);
  if (urls.length === 0) {
    throw new Error("Unrecognized list URL protocol.");
  }

  let lastError: Error | undefined;

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to download list ${listUrl}`);
      }

      const json = await response.json();
      if (!tokenListValidator(json)) {
        const validationErrors: string =
          tokenListValidator.errors?.reduce<string>((memo, error) => {
            const add = `${error.dataPath} ${error.message ?? ""}`;
            return memo.length > 0 ? `${memo}; ${add}` : `${add}`;
          }, "") ?? "unknown error";
        throw new Error(`Token list failed validation: ${validationErrors}`);
      }
      return json;
    } catch (error) {
      console.debug("Failed to fetch list", url, error);
      lastError = error as Error;
      continue;
    }
  }

  throw lastError || new Error(`Failed to fetch list ${listUrl}`);
}
