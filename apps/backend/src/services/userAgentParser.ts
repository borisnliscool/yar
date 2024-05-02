import { UAParser } from 'ua-parser-js';

export default class UserAgentParser {
	static getDeviceName(userAgent: string) {
		const parsed = new UAParser(userAgent).getResult();
		return `${parsed.browser.name} ${parsed.browser.version} (${parsed.os.name} ${parsed.os.version})`;
	}
}
