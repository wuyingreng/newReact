import {
	appendInitialChild,
	createInstance,
	createTextInstance
} from 'hostConfig';
import { FiberNode } from './fiber';
import { HostComponent, HostRoot, HostText } from './workTags';
import { NoFlags } from './fiberFlags';

export const completeWork = (wip: FiberNode) => {
	// 递归中的归
	const newProps = wip.pendingProps;
	const current = wip.alternate;
	switch (wip.tag) {
		case HostComponent:
			if (current != null && wip.stateNode) {
				// update
			} else {
				/**
				 * 构建离屏DOM树
				 * 1. 构建DOM
				 * 2. 将DOM插入到DOM树种
				 */
				// 1. 构建DOM
				const instance = createInstance(wip.type, newProps);
				// 2. 将DOM插入到DOM树种
				appendAppChildren(instance, wip);
				wip.stateNode = instance;
				bubbleProperties(wip);
			}

			return null;
		case HostText:
			if (current != null && wip.stateNode) {
				// update
			} else {
				const instance = createTextInstance(newProps.content);
				wip.stateNode = instance;
				bubbleProperties(wip);
			}

			return null;
		case HostRoot:
			bubbleProperties(wip);
			return null;
		default:
			if (__DEV__) {
				console.warn('未处理的complete 情况', wip);
			}
			break;
	}
	return null;
};

/**
 * demo
 * function A(){
 * 	return <div></div>
 * }
 * <h3><div></div></h3> 实际上要的是A的div
 */
function appendAppChildren(parent: FiberNode, wip: FiberNode) {
	let node = wip.child;
	// 一直往下查找
	while (node !== null) {
		if (node.tag === HostComponent || node.tag === HostText) {
			appendInitialChild(parent, node?.stateNode);
		} else if (node.child !== null) {
			node.child.return = node;
			node = node.child;
			continue;
		}
	}
	// 一直回到自己就退出去了
	if (node === wip) {
		return;
	}

	while (node.sibling === null) {
		if (node.return === null || node.return === wip) {
			return;
		}
		node = node?.return;
	}
	node?.sibling.return = node?.return;
	node = node?.sibling;
}

// 只是为了判断子树中存不存在副作用
function bubbleProperties(wip: FiberNode) {
	const subtreeFlags = NoFlags;
	let child = wip.child;
	while (child != null) {
		subtreeFlags != child.subtreeFlags;
		subtreeFlags != child.flags;
		child.return = wip;
		child = child.sibling;
	}
	wip.subtreeFlags |= subtreeFlags;
}
