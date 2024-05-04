export default class Formatter {
	static seconds(seconds: number): string {
		const h = Math.floor(seconds / 3600);
		const m = Math.floor((seconds % 3600) / 60);
		const s = seconds % 60;

		const formattedHours = h > 0 ? `${h}:` : '';
		const formattedMinutes = m > 0 ? m.toString().padStart(2, '0') : '0';
		const formattedSeconds = Math.floor(s).toString().padStart(2, '0');

		return `${formattedHours}${formattedMinutes}:${formattedSeconds}`;
	}
}
