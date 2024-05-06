import { Props, Key, Ref, ReactElementType } from 'shared/ReactTypes';
import { FunctionComponent, HostComponent, WorkTag } from './workTags';
import { Flags, NoFlags } from './fiberFlags';
// 不能这么写import { Container } from './hostConfig'
import { Container } from 'hostConfig';

export class FiberNode {
	// 对this的定义
	type: any;
	tag: WorkTag;
	pendingProps: Props;
	stateNode: any;
	key: any;
	return: FiberNode | null;
	sibling: FiberNode | null;
	child: FiberNode | null;
	// 如果同级的fibernode有好多个，比如ul下好多li，第一个就是0
	index: number;
	ref: Ref;
	memorizedProps: Props | null;
	memorizedState: any;

	// 当前是current,alternate 指向workInProgres。当前是workInProgres，alternate是current
	alternate: FiberNode | null;
	flags: Flags;
	updateQueue: unknown;
	constructor(
		tag: WorkTag,
		pendingProps: Props, // 接下来要改变的props
		key: Key
	) {
		// 实例的属性
		this.tag = tag;
		this.key = key;
		// Hostcomponent <div> div DOM
		this.stateNode = null;
		// FiberNode的类型 Function component 本身 ()=>{}
		this.type = null;

		/** 构成树状结构 */
		// 指向父partent，工作单元，当它工作完成，下一个工作的就是它的父工作单元
		this.return = null;
		// 指向右边的兄弟的fiber node
		this.sibling = null;
		this.child = null;
		// 如果同级的fibernode有好多个，比如ul下好多li，第一个就是0,第二个1，第三个2
		this.index = 0;

		/*** 工作单元 start **/
		// 刚开始准备工作的时候props是什么
		this.pendingProps = pendingProps;
		// 工作完成之后的props是什么
		this.memorizedProps = null;
		this.updateQueue = null;
		this.memorizedState = null;

		/*** 工作单元 end **/

		this.alternate = null;
		// 副作用
		this.flags = NoFlags;
	}
}

export class FiberRootNode {
	container: Container;
	current: FiberNode;
	// 已经完成整个递归流程的hoost root fiber
	finishedWork: FiberNode | null;
	constructor(container: Container, hostRootFiber: FiberNode | null) {
		this.container = container;
		this.current = hostRootFiber;
		hostRootFiber.stateNode = this;
		this.finishedWork = null;
	}
}

export const createWorkInProgress = (
	current: FiberNode,
	pendingProps: Props
): FiberNode => {
	/**
	 * 每次传进来一个FiberNode,最终经过一系列操作，返回它的alternate.
	 * 就是双缓存机制，每次都获取跟我相对应的另外一个FiberNode
	 */
	let wip = current.alternate;
	// 对于首屏渲染就是null
	if (wip === null) {
		// mount
		wip = new FiberNode(current.tag, pendingProps, current.key);
		wip.type = current.type;
		wip.stateNode = current.stateNode;

		wip.alternate = current;
		current.alternate = wip;
	} else {
		// update
		wip.pendingProps = pendingProps;
		// 清除上次更新遗留的副作用
		wip.flags = NoFlags;
	}
	// 不懂 UpdateQueue 的结构是为了current 和wip 共用一个updateQueue
	wip.type = current.type;
	wip.updateQueue = current.updateQueue;
	wip.child = current.child;
	wip.memorizedProps = current.memorizedProps;
	wip.memorizedState = current.memorizedState;
	return wip;
};

export function createFiberFromElement(element: ReactElementType) {
	const { type, key, props } = element;
	let fiberTag: WorkTag = FunctionComponent;
	if (typeof type === 'string') {
		// <div/> type:"div"
		fiberTag = HostComponent;
	} else if (typeof type !== 'function' && __DEV__) {
		console.warn('未定义的type类型', element);
	}
	const fiber = new FiberNode(fiberTag, props, key);
	fiber.type = type;
	return fiber;
}
