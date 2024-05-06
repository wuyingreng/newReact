import { ReactElementType } from 'shared/ReactTypes';
import { FiberNode } from './fiber';
import { UpdateQueue, processUpdateQueue } from './updateQueue';
import { HostComponent, HostRoot, HostText } from './workTags';
import { mountChildFibers, reconcilerChildFibers } from './childFibers';

// 递归中的递阶段
export const beginWork = (wip: FiberNode) => {
	// 比较，返回子 子fiberNode
	switch (wip.tag) {
		case HostRoot:
			return updateHostRoot(wip);
		case HostComponent:
			return updateHostComponent(wip);
		// 递到叶子节点就没有办法往下遍历了，就要开始归了
		case HostText:
			return null;
	}
};

function reconcileChildren(wip: FiberNode, children?: ReactElementType) {
	const current = wip.alternate;
	reconcileChildFibers(wip, current?.child, children);
	if (current !== null) {
		// update流程
		wip.child = reconcilerChildFibers(wip, current?.child, children);
	} else {
		// mount流程
		wip.child = mountChildFibers(wip, null, children);
	}
}

// 根<App/> 下面对应的
function updateHostRoot(wip: FiberNode) {
	// 首屏渲染的时候是不存在的
	const baseState = wip.memorizedState;
	const updateQueue = wip.updateQueue as UpdateQueue<Element>;
	const pending = updateQueue.shared.pending;
	updateQueue.shared.pending = null;
	// 这是个React Element
	const { memorizedState } = processUpdateQueue(baseState, pending);
	wip.memorizedState = memorizedState;

	// 子的（B）react element
	const nextChildren = wip.memorizedState;
	reconcileChildren(wip, nextChildren);
	return wip.child;
}

function updateHostComponent(wip: FiberNode) {
	const nextProps = wip.pendingProps;
	const nextChildren = nextProps.children;
	reconcileChildren(wip, nextChildren);
	return wip.child;
}
