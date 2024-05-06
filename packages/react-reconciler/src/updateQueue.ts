import { Action } from 'shared/ReactTypes';
/**
 * 触发更新的两种方式
 * this.setState({x:1});
 * this.setState(({x:1})=>({x:2}))
 * Update函数要兼容这2种方式
 */
export interface Update<State> {
	action: Action<State>;
}

export interface UpdateQueue<State> {
	shared: {
		pending: Update<State> | null;
	};
}

export const createUpdate = <State>(action: Action<State>): Update<State> => {
	return {
		action
	};
};

export const createUpdateQueue = <State>() => {
	// 该更新带来的状态变化
	return {
		shared: {
			pending: null
		}
	} as UpdateQueue<State>;
};

// queue/kju:/ n v line. enqueue  v排队

export const enqueueUpdate = <State>(
	updateQueue: UpdateQueue<State>,
	update: Update<State>
) => {
	updateQueue.shared.pending = update;
};

// 消费updateQueue
export const processUpdateQueue = <State>(
	baseState: State,
	pendingUpdate: Update<State> | null
): { memorizedState: State } => {
	const result: ReturnType<typeof processUpdateQueue<State>> = {
		memorizedState: baseState
	};
	if (pendingUpdate !== null) {
		const action = pendingUpdate.action;
		if (action instanceof Function) {
			// baseState 1, update (x)=>4x => memorizedState 1*4=4;
			result.memorizedState = action(baseState);
		} else {
			// baseState 1, update 2 => memorizedState 2
			result.memorizedState = action;
		}
	}
	return result;
};
