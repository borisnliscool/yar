import fs from 'fs';
import path from 'path';

export default class FileService {
	private static rootDir: string = path.join(process.cwd(), 'data');

	static getDirectoryPath(directory: string): string {
		return path.join(this.rootDir, directory);
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
		const fullFilePath = path.join(this.rootDir, directory, filePath);

		const parsedPath = path.parse(fullFilePath);
		const parsedDir = parsedPath.dir;

		fs.mkdirSync(parsedDir, {
			recursive: true,
		});

		return fs.writeFileSync(fullFilePath, contents, options);
	}
}
