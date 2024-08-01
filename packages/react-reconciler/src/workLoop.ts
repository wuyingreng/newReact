import { beginWork } from './beginWork';
import { FiberNode, FiberRootNode, createWorkInProgress } from './fiber';
import { completeWork } from './completeWork';
import { HostRoot } from './workTags';
import { MutationMask, NoFlags } from './fiberFlags';

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

function commitRoot(root: FiberRootNode) {
	const finishedWork = root.finishedWork;
	if (finishedWork === null) {
		return;
	}

	if (__DEV__) {
		console.warn('commit阶段开始', finishedWork);
	}

	// 重置 root.finishedWork变量不需要了，因为被保存在finishedWork变量中
	root.finishedWork = null;

	// 判断是否存在3个阶段需要执行的操作
	// root flags和root subtree flags
	const subtreeHasEffect =
		(finishedWork.subtreeFlags & MutationMask) !== NoFlags;

	const rootHasEffect = (finishedWork.flags & MutationMask) !== NoFlags;

	if (subtreeHasEffect || rootHasEffect) {
		// beforeMutation

		// mutation palcement

		// layout
		root.current = finishedWork;
	} else {
		root.current = finishedWork;
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
	const finishedWork = root.current.alternate;
	root.finishedWork = finishedWork;
	// wip fiberNode树 树中的flag执行具体的DOM操作
	commitRoot(root);
}
