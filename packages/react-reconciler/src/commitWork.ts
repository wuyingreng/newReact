import { FiberNode, FiberRootNode } from './fiber';
import { MutationMask, NoFlags, Placement } from './fiberFlags';
import { HostComponent, HostRoot, HostText } from './workTags';
import { Container } from 'hostConfig';

let nextEffect: FiberNode | null = null;

// 这段代码没有看懂。有点难
export const commitMutationEffects = (finishedWork: FiberNode) => {
	// 向下遍历
	nextEffect = finishedWork;
	const child: FiberNode | null = nextEffect.child;
	if ((nextEffect.subtreeFlags & MutationMask) !== NoFlags && child != null) {
		nextEffect = child;
	} else {
		// 向上遍历 DFS 遇到第一个不存在subtreeFlags是节点 这里没有看懂。1. up:是什么意思 2. 为什么是向上了，nextEffect !== null 是什么意思
		up: while (nextEffect !== null) {
			// 自己有mutation 自己先commit了
			commitMutationEffectsOnFiber(nextEffect);
			const sibling: FiberNode | null = nextEffect.sibling;
			// 先找兄弟节点，再找父节点
			if (sibling != null) {
				nextEffect = sibling;
				// 这里的break up是什么意思，up是什么意思
				break up;
			}
			nextEffect = nextEffect.return;
		}
	}
};

function getHostParent(fiber: FiberNode) {
	let parent = fiber.return;

	while (parent) {
		const parentTag = parent.tag;
		// HostComponent HostRoot
		if (parentTag === HostComponent) {
			return parent.stateNode as Container;
		}
		if (parentTag === HostRoot) {
			return (parent.stateNode as FiberRootNode).container;
		}
		parent = parent.return;
	}
	if (__DEV__) {
		console.warn('未找到 host parent');
	}
}

function appendPlacementNodeIntoContainer(
	finishedWork: FiberNode,
	hostParent: Container
) {
	// fiber host
	if (finishedWork.tag === HostComponent || finishedWork.tag === HostText) {
		// finishedWork.stateNode 宿主环境的节点
		appendChildToContainer(finishedWork.stateNode, hostParent);
		return;
	}
	// 向下遍历一层层挂载
	const child = finishedWork.child;
	if (child !== null) {
		appendPlacementNodeIntoContainer(child, hostParent);
		let sibling = child.sibling;
		// 这块要多看下
		while (sibling !== null) {
			appendPlacementNodeIntoContainer(sibling, hostParent);
			sibling = sibling.sibling;
		}
	}
}

const commitPlacement = (finishedWork: FiberNode) => {
	/***
	 * parent DOM, 将当前的节点插入到谁下面
	 * 当前finishedWork 对应的DOM节点  finishedWork ~~ DOM
	 */

	if (__DEV__) {
		console.warn('执行Placement操作', finishedWork);
	}
	// parent DOM, 将当前的节点插入到谁下面
	const hostParent = getHostParent(finishedWork);
	appendPlacementNodeIntoContainer(finishedWork, hostParent);
	// finishedWork 对应的DOM节点  finishedWork ~~ DOM ,append到parent DOM中
};

const commitMutationEffectsOnFiber = (finishedWork: FiberNode) => {
	const flags = finishedWork.flags;
	if ((flags & Placement) !== NoFlags) {
		commitPlacement(finishedWork);
		/**
		 * 从finishedWork.flags移除Placement。
		 * 总结就是执行commitPlacement,然后把对应的Plcaement从flags中删除
		 */

		finishedWork.flags &= ~Placement;
	}
};
