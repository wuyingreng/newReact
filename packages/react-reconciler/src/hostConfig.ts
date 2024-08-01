/**
 * 针对不同的宿主环境，值是不一样的。
 * 针对浏览器Container type就是个DOM element，比如div这些
 */

export type Container = any;

export const createInstance = (..._args: any) => {
	console.log(_args);
	return {} as any;
};

export const appendInitialChild = (..._args: any) => {
	console.log(_args);
	return {} as any;
};

export const createTextInstance = (..._args: any) => {
	console.log(_args);
	return {} as any;
};

export const appendChildToContainer = (..._args: any) => {
	console.log(_args);
	return {} as any;
};
