/**
 * UUID generator since `crypto.randomUUID()` is only supported on Safari 15.4+ (https://caniuse.com/mdn-api_crypto_randomuuid)
 * @see: https://stackoverflow.com/a/2117523/191902
 */
export function uuid() {
	return '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, (c) => {
		const n = Number(c);
		return (n ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (n / 4)))).toString(16);
	});
}
