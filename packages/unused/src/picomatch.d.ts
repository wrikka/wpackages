declare module 'picomatch' {
	function picomatch(glob: string | string[], options?: picomatch.Options): (test: string) => boolean;
	namespace picomatch {
		interface Options {
			dot?: boolean;
			[key: string]: any;
		}
	}
	export = picomatch;
}
