import fs from 'fs';
import path from 'path';

export default class FileService {
	private static rootDir: string = path.join(process.cwd(), 'data');

	static getDirectoryPath(directory: string): string {
		const dirPath = path.join(this.rootDir, directory);
		fs.mkdirSync(dirPath, { recursive: true });
		return dirPath;
	}

	static readFile(directory: string, filePath: string): Buffer {
		return fs.readFileSync(path.join(this.getDirectoryPath(directory), filePath));
	}

	static readDir(directory: string): string[] {
		return fs.readdirSync(this.getDirectoryPath(directory));
	}

	static writeFile(
		directory: string,
		filePath: string,
		contents: string | NodeJS.ArrayBufferView,
		options?: fs.WriteFileOptions
	): void {
		this.makeDirectoryPath(directory);
		const fullFilePath = path.join(this.getDirectoryPath(directory), filePath);
		return fs.writeFileSync(fullFilePath, contents, options);
	}

	static appendFile(
		directory: string,
		filePath: string,
		contents: string | Uint8Array,
		options?: fs.WriteFileOptions
	): void {
		this.makeDirectoryPath(directory);
		const fullFilePath = path.join(this.getDirectoryPath(directory), filePath);
		return fs.appendFileSync(fullFilePath, contents, options);
	}

	static stat(directory: string, filePath: string) {
		return fs.statSync(path.join(this.getDirectoryPath(directory), filePath));
	}

	static createReadStream(
		directory: string,
		filePath: string,
		options?: { start: number; end: number }
	) {
		return fs.createReadStream(path.join(this.getDirectoryPath(directory), filePath), options);
	}

	private static makeDirectoryPath(directory: string): string {
		const dirPath = path.join(this.rootDir, directory);
		fs.mkdirSync(dirPath, { recursive: true });
		return dirPath;
	}
}
