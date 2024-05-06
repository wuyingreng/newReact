export const FunctionComponent = 0;
/**
 * 项目挂载的根节点，比如ReactDom.render。比如id='root'
 */
// 是不是都只指根节点？
export const HostRoot = 3;

// <div>123</div>中的div
export const HostComponent = 5;

// <div>123</div>中的123
export const HostText = 6;

export type WorkTag =
	| typeof FunctionComponent
	| typeof HostRoot
	| typeof HostComponent
	| typeof HostText;
