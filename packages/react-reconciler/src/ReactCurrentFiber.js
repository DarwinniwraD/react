/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import type {Fiber} from './ReactFiber';

import ReactSharedInternals from 'shared/ReactSharedInternals';
import {
  HostRoot,
  HostPortal,
  HostText,
  Fragment,
  ContextProvider,
  ContextConsumer,
} from 'shared/ReactWorkTags';
import describeComponentFrame from 'shared/describeComponentFrame';
import getComponentName from 'shared/getComponentName';

const ReactDebugCurrentFrame = ReactSharedInternals.ReactDebugCurrentFrame;

type LifeCyclePhase = 'render' | 'getChildContext';

function describeFiber(fiber: Fiber): string { //获取fiber类型
  switch (fiber.tag) {
    case HostRoot:
    case HostPortal:
    case HostText:
    case Fragment:
    case ContextProvider:
    case ContextConsumer:
      return '';
    default:
      const owner = fiber._debugOwner;
      const source = fiber._debugSource;
      const name = getComponentName(fiber.type);
      let ownerName = null;
      if (owner) {
        ownerName = getComponentName(owner.type);
      }
      return describeComponentFrame(name, source, ownerName);
  }
}

export function getStackByFiberInDevAndProd(workInProgress: Fiber): string { /* 获取fiber树 */
  let info = '';
  let node = workInProgress;
  do {
    info += describeFiber(node);
    node = node.return;
  } while (node);
  return info;
}

export let current: Fiber | null = null; /* 当前的Fiber树 */
export let phase: LifeCyclePhase | null = null; /* 调度进度 */

export function getCurrentFiberOwnerNameInDevOrNull(): string | null { /* 在开发环境中获取当前Fiber对应的组件 */
  if (__DEV__) {
    if (current === null) {
      return null; /* 在开发环境中，如果当前树为空，直接返回 */
    }
    const owner = current._debugOwner;
    if (owner !== null && typeof owner !== 'undefined') {
      return getComponentName(owner.type);
    }
  }
  return null;
}

export function getCurrentFiberStackInDev(): string { /* 在开发环境中获取当前的fiber树，如果当前存在fiber树，则表明存在调度，可以获取当前fiber树 */
  if (__DEV__) {
    if (current === null) {
      return '';
    }
    // Safe because if current fiber exists, we are reconciling,
    // and it is guaranteed to be the work-in-progress version.
    return getStackByFiberInDevAndProd(current);
  }
  return '';
}

export function resetCurrentFiber() { /* 清空当前调度状态 */
  if (__DEV__) {
    ReactDebugCurrentFrame.getCurrentStack = null;
    current = null;
    phase = null;
  }
}

export function setCurrentFiber(fiber: Fiber) { /* 获取当前fiber状态 */
  if (__DEV__) {
    ReactDebugCurrentFrame.getCurrentStack = getCurrentFiberStackInDev;
    current = fiber;
    phase = null;
  }
}

export function setCurrentPhase(lifeCyclePhase: LifeCyclePhase | null) { /* 设置调度进度 */
  if (__DEV__) {
    phase = lifeCyclePhase;
  }
}
