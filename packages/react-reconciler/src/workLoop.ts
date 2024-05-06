import { beginWork } from './beginWork';
import { FiberNode, FiberRootNode, createWorkInProgress } from './fiber';
import { completeWork } from './completeWork';
import { HostRoot } from './workTags';

// 全局指针指向当前正在工作的fiberNode
let workInProgress: FiberNode | null = null;

function prepareFreshStack(root: FiberRootNode) {
	workInProgress = createWorkInProgress(root.current, {});
}

// 在Fiber中调度update
export function scheduleUpdateOnFiber(fiber: FiberNode) {
	// Todo 调度功能
	const root = markUpdateFromFiberToRoot(fiber);
	renderRoot(root);
}

function markUpdateFromFiberToRoot(fiber: FiberNode) {
	// 向上归的过程
	let node = fiber;
	let parent = node.return;
	while (parent != null) {
		node = parent;
		parent = node.return;
	}
	if (node.tag === HostRoot) {
		return node.stateNode;
	}
	return null;
}

// 归
function completeUnitOfWork(fiber: FiberNode) {
	let node: FiberNode | null = fiber;
	do {
		completeWork(node);
		const sibling = node.sibling;
		if (sibling !== null) {
			workInProgress = sibling;
			return;
		}
		// 父级节点
		node = node.return;
	} while (node != null);
}

function performUnitOfWork(fiber: FiberNode) {
	// next 子fiberNode
	const next = beginWork(fiber);
	fiber.memorizedProps = fiber.pendingProps;
	if (next === null) {
		// 归
		completeUnitOfWork(fiber);
	} else {
		// 继续向下遍历
		workInProgress = next;
	}
}

function workLoop() {
	while (workInProgress !== null) {
		performUnitOfWork(workInProgress);
	}
}

function renderRoot(root: FiberRootNode) {
	// 初始化，让workInProgress 执行需要遍历的第一个FiberNode
	prepareFreshStack(root);
	// 递归
	do {
		try {
			workLoop();
			break;
		} catch (e) {
			if (__DEV__) {
				// 发生错误，重置workInProgress
				console.warn('workLoop 发生错误', e);
			}

			workInProgress = null;
		}
	} while (true);
}
