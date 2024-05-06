import { ReactElementType } from 'shared/ReactTypes';
import { FiberNode, createFiberFromElement } from './fiber';
import { REACT_ELEMENT_TYPE } from 'shared/ReactSymbols';
import { HostText } from './workTags';
import { Placement } from './fiberFlags';

function ChildReconciler(shouldTrackEffect: boolean) {
	function reconcilerSingleElement(
		returnFiber: FiberNode,
		currentFiberNode: FiberNode | null,
		element: ReactElementType
	) {
		// 根据react element创建fiber并且返回
		const fiber = createFiberFromElement(element);
		fiber.return = returnFiber;
		return fiber;
	}

	function reconcilerSingleTextNode(
		returnFiber: FiberNode,
		currentFiberNode: FiberNode | null,
		content: string | number
	) {
		// 根据react element创建fiber并且返回
		const fiber = new FiberNode(HostText, { content }, null);
		fiber.return = returnFiber;
		return fiber;
	}

	// 插入单一节点
	function placeSingleChild(fiber: FiberNode) {
		// fiber.alternate===null ==> current.fiber===null 首屏渲染的情况
		if (shouldTrackEffect && fiber.alternate === null) {
			// 这是什么语法哦。好奇怪
			fiber.flags |= Placement;
		}
	}

	return function reconcilChildFibers(
		returnFiber: FiberNode,
		currentFiberNode: FiberNode | null,
		newChild: ReactElementType
	) {
		// 判断当前fiber的类型
		if (typeof newChild === 'object' && newChild != null) {
			switch (newChild.$$typeof) {
				case REACT_ELEMENT_TYPE:
					return placeSingleChild(
						reconcilerSingleElement(returnFiber, currentFiberNode, newChild)
					);
				default:
					if (__DEV__) {
						console.warn('未实现的reconciler 类型', newChild.$$typeof);
					}
			}
		}
		// Todo: 多节点的情况 ul>li*3
		// HosText
		if (typeof newChild === 'string' || typeof newChild === 'number') {
			return placeSingleChild(
				reconcilerSingleTextNode(returnFiber, currentFiberNode, newChild)
			);
		}
		if (__DEV__) {
			console.warn('未实现的reconciler 类型', newChild);
		}
		return null;
	};

	// return fiberNode
}

export const reconcilerChildFibers = ChildReconciler(true);
export const mountChildFibers = ChildReconciler(false);
