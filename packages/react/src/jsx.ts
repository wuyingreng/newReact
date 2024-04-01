/* eslint-disable @typescript-eslint/no-explicit-any */
// ReactElement
import { REACT_ELEMENT_TYPE } from 'shared/ReactSymbols';
import {
	Type,
	Key,
	Ref,
	Props,
	ReactElementType,
	ElementType
} from 'shared/ReactTypes';

const ReactElement = function (
	type: Type,
	key: Key,
	ref: Ref,
	props: Props
): ReactElementType {
	const element = {
		$$typeof: REACT_ELEMENT_TYPE,
		type,
		key,
		ref,
		props,
		__mark: 'KaSong' // 与真实的react区分
	};
	return element;
};

export const jsx = (type: ElementType, config: any, ...maybeChildren: any) => {
	let key: Key = null;
	const props: Props = {};
	let ref: Ref = null;
	for (const prop in config) {
		const val = config[prop];
		if (prop === 'key') {
			if (val !== 'undefined') {
				key = '' + val; // key的值是个字符串
			}
			continue;
		}
		if (prop === 'ref') {
			if (val !== 'undefined') {
				ref = val;
			}
			continue;
		}
		// 是它自己而不是原型上的就赋值给props 不懂？？？
		if ({}.hasOwnProperty.call(config, prop)) {
			props[prop] = val;
		}

		const maybeChildrenLength = maybeChildren?.length;
		if (maybeChildrenLength) {
			if (maybeChildrenLength === 1) {
				props.children = maybeChildren[0];
			} else {
				props.children = maybeChildren;
			}
		}
	}
	return ReactElement(type, key, ref, props);
};

/**
 * 本例中代码中开发环境的的jsx和生产环境的jsx是一个实现。
 * react库实际上不是
 */

export const jsxDEV = (type: ElementType, config: any) => {
	let key: Key = null;
	const props: Props = {};
	let ref: Ref = null;
	for (const prop in config) {
		const val = config[prop];
		if (prop === 'key') {
			if (val !== 'undefined') {
				key = '' + val; // key的值是个字符串
			}
			continue;
		}
		if (prop === 'ref') {
			if (val !== 'undefined') {
				ref = val;
			}
			continue;
		}
		// 是它自己而不是原型上的就赋值给props 不懂？？？
		if ({}.hasOwnProperty.call(config, prop)) {
			props[prop] = val;
		}
	}
	return ReactElement(type, key, ref, props);
};
