import { FiberNode } from './fiber';

export const completeWork = (fiber: FiberNode) => {
	// 递归中的归
	console.log('fiber==>', fiber);
};
