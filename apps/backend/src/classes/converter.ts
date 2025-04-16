export default abstract class Converter<T, U> {
	abstract convert(input: T): U;
}
