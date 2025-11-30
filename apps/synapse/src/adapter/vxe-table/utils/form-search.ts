import { nextTick, toRaw, type Ref } from 'vue';

import { mergeWithArrayOverride } from '@vben/utils';

import { useDebounceFn } from '@vueuse/core';

/**
 * 处理表单选项，添加自动搜索功能
 * @param inputFormOptions 原始表单选项
 * @param gridApiRef 表格 API 的响应式引用
 * @returns 处理后的表单选项
 */
export function processFormOptions(
  inputFormOptions: any,
  gridApiRef: Ref<any>,
): any {
  if (!inputFormOptions) return inputFormOptions;

  // 如果 inputFormOptions 是函数，先调用获取配置对象
  const rawFormOptions =
    typeof inputFormOptions === 'function' ? inputFormOptions() : inputFormOptions;

  // 提取所有函数属性（structuredClone 无法克隆函数）
  const functionsMap = new Map<string, any>();

  // 递归提取函数并创建不包含函数的副本
  function extractFunctionsAndClone(obj: any, path = ''): any {
    if (obj === null || obj === undefined) return obj;

    if (typeof obj === 'function') {
      // 保存函数
      functionsMap.set(path, obj);
      return null; // 临时替换为 null
    }

    if (Array.isArray(obj)) {
      return obj.map((item, index) =>
        extractFunctionsAndClone(
          item,
          path ? `${path}[${index}]` : `[${index}]`,
        ),
      );
    }

    if (typeof obj === 'object') {
      const cloned: any = {};
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          const value = obj[key];
          const currentPath = path ? `${path}.${key}` : key;
          cloned[key] = extractFunctionsAndClone(value, currentPath);
        }
      }
      return cloned;
    }

    return obj;
  }

  // 恢复函数属性（使用相同的路径生成逻辑）
  function restoreFunctions(obj: any, path = ''): void {
    if (obj === null || obj === undefined) return;

    if (Array.isArray(obj)) {
      obj.forEach((item, index) => {
        const currentPath = path ? `${path}[${index}]` : `[${index}]`;
        // 先检查当前路径是否有函数（数组项本身可能是函数）
        if (functionsMap.has(currentPath)) {
          obj[index] = functionsMap.get(currentPath);
        } else if (
          item !== null &&
          item !== undefined &&
          typeof item === 'object'
        ) {
          restoreFunctions(item, currentPath);
        }
      });
      return;
    }

    if (typeof obj !== 'object') return;

    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const value = obj[key];
        const currentPath = path ? `${path}.${key}` : key;

        // 如果这个路径有保存的函数，恢复它（无论当前值是 null 还是其他）
        if (functionsMap.has(currentPath)) {
          obj[key] = functionsMap.get(currentPath);
        } else if (Array.isArray(value)) {
          value.forEach((item, index) => {
            if (item !== null && item !== undefined) {
              restoreFunctions(item, `${currentPath}[${index}]`);
            }
          });
        } else if (
          value !== null &&
          value !== undefined &&
          typeof value === 'object'
        ) {
          restoreFunctions(value, currentPath);
        }
      }
    }
  }

  // 提取函数并创建不包含函数的副本
  const clonedWithoutFunctions = extractFunctionsAndClone(rawFormOptions);

  // 深拷贝（现在不包含函数了）
  const formOptions = structuredClone(clonedWithoutFunctions);

  // 恢复函数
  restoreFunctions(formOptions);

  // 统一设置默认配置（用户配置会覆盖这些默认值）
  const defaultFormOptions = {
    resetButtonOptions: {
      show: true, // 默认显示重置按钮
    },
    submitButtonOptions: {
      show: false, // 默认隐藏搜索按钮，使用 blur 和 clear 事件自动搜索
    },
    submitOnChange: false, // 默认禁用自动提交，使用 blur 和 clear 事件自动搜索
    submitOnEnter: false, // 默认禁用回车提交
    // 搜索表单的通用配置：防止 label 换行，添加冒号
    commonConfig: {
      labelClass: 'whitespace-nowrap overflow-hidden text-ellipsis', // 防止标签换行，超出部分显示省略号
      colon: true, // 标签后显示冒号
    },
  };

  // 合并默认配置和用户配置（用户配置优先）
  Object.assign(formOptions, {
    resetButtonOptions: mergeWithArrayOverride(
      {},
      defaultFormOptions.resetButtonOptions,
      formOptions.resetButtonOptions || {},
    ),
    submitButtonOptions: mergeWithArrayOverride(
      {},
      defaultFormOptions.submitButtonOptions,
      formOptions.submitButtonOptions || {},
    ),
    submitOnChange:
      formOptions.submitOnChange === undefined
        ? defaultFormOptions.submitOnChange
        : formOptions.submitOnChange,
    submitOnEnter:
      formOptions.submitOnEnter === undefined
        ? defaultFormOptions.submitOnEnter
        : formOptions.submitOnEnter,
    // 合并 commonConfig（用户配置优先）
    commonConfig: mergeWithArrayOverride(
      {},
      defaultFormOptions.commonConfig,
      formOptions.commonConfig || {},
    ),
  });

  // 防重复执行标志
  let isSearching = false;

  // 创建自动搜索函数（使用闭包访问 gridApiRef）
  const performSearch = async () => {
    // 如果正在搜索，直接返回，避免重复请求
    if (isSearching) {
      return;
    }

    // 检查是否是 clear 操作触发的防抖搜索（延迟执行）
    // 如果已经有 clear 操作触发的搜索，且当前时间在 clear 操作的防抖窗口内，则跳过
    const now = Date.now();
    if (
      globalClearSearchId &&
      globalLastClearTime > 0 &&
      now - globalLastClearTime < 600
    ) {
      return;
    }

    try {
      isSearching = true;
      // 延迟执行，确保值已更新（对于 ApiSelect 等使用 v-model:value 的组件，需要额外延迟）
      await nextTick();
      await nextTick(); // 双重 nextTick 确保 ApiSelect 的值已同步到表单
      if (gridApiRef.value) {
        // 获取表单实例，直接访问 form.values 以确保获取到最新值
        // form.values 是响应式的，应该包含 ApiSelect 的最新值
        const form = await gridApiRef.value.formApi?.getForm();
        const formValues =
          form?.values ||
          (await gridApiRef.value.formApi?.getValues()) ||
          {};

        // 先设置最新提交值，这样 extendProxyOptions 中的 getFormValues 可以获取到最新值
        // 使用 toRaw 确保传递的是原始值，避免响应式对象导致的问题
        const rawFormValues = toRaw(formValues);
        gridApiRef.value.formApi?.setLatestSubmissionValues(rawFormValues);

        // 使用 query 方法触发查询，传入表单值作为参数
        // extendProxyOptions 包装了 query 方法，会将传入的 customValues 和 getFormValues() 合并
        // 注意：extendProxyOptions 中 customValues 会覆盖 formValues，确保传入的最新值优先
        // 这里传入 rawFormValues 作为 customValues，它会覆盖 getLatestSubmissionValues() 的值
        await gridApiRef.value.query(rawFormValues);
      }
    } catch (error) {
      console.error('搜索执行失败:', error);
      throw error;
    } finally {
      // 延迟重置标志，确保请求完成后再允许下一次搜索
      await nextTick();
      isSearching = false;
    }
  };

  // 使用防抖函数，延迟 300ms 执行搜索，避免频繁请求
  const debouncedSearch = useDebounceFn(performSearch, 300);

  // 全局的 clear 防重复机制（适用于所有组件）
  // 用于标记最近一次 clear 操作的时间戳，防止短时间内重复触发
  let globalLastClearTime = 0;
  const GLOBAL_CLEAR_DEBOUNCE_TIME = 500; // 500ms 内的 clear 相关事件都视为同一次操作
  // 用于标记正在处理 clear 事件的字段名
  const clearingFields = new Set<string>();
  // 用于标记最近一次 clear 操作触发的搜索 ID，防止防抖函数延迟执行时重复搜索
  let globalClearSearchId: string | null = null;

  // 创建自动搜索处理函数
  const createAutoSearchHandler = (
    originalHandler?: (...args: any[]) => any,
    immediate = false, // 是否立即执行（不清除按钮等需要立即执行）
    fieldName?: string, // 字段名，用于 clear 防重复
  ) => {
    return async (...args: any[]) => {
      // 执行原有的处理函数（如果有）
      if (originalHandler) {
        originalHandler(...args);
      }

      // 如果是 clear 相关的事件，检查防重复机制
      if (fieldName && clearingFields.has(fieldName)) {
        return;
      }

      const now = Date.now();
      if (
        fieldName &&
        now - globalLastClearTime < GLOBAL_CLEAR_DEBOUNCE_TIME
      ) {
        return;
      }

      // 根据 immediate 参数决定是立即执行还是防抖执行
      if (immediate) {
        await performSearch();
      } else {
        debouncedSearch();
      }
    };
  };

  // 创建通用的 clear 事件处理函数（适用于所有组件）
  const createUniversalClearHandler = (
    originalHandler?: (...args: any[]) => any,
    fieldName?: string,
  ) => {
    return async (...args: any[]) => {
      // 执行原有的处理函数（如果有）
      if (originalHandler) {
        originalHandler(...args);
      }

      if (!fieldName) {
        // 如果没有字段名，使用原来的逻辑
        await performSearch();
        return;
      }

      // 记录 clear 操作的时间戳
      globalLastClearTime = Date.now();
      // 标记正在处理 clear 事件
      clearingFields.add(fieldName);

      try {
        // clear 事件立即触发搜索
        await performSearch();
      } finally {
        // 延迟重置标志，确保 onChange 和 onUpdate:value 事件处理完成
        await nextTick();
        await nextTick();
        // 再延迟一段时间，确保所有 clear 相关的事件都处理完成
        setTimeout(() => {
          clearingFields.delete(fieldName);
        }, GLOBAL_CLEAR_DEBOUNCE_TIME);
      }
    };
  };

  // 为每个字段添加输入和清除事件处理（如果未禁用自动搜索）
  if (
    !formOptions.disableAutoSearch &&
    formOptions.schema &&
    Array.isArray(formOptions.schema)
  ) {
    formOptions.schema = formOptions.schema.map((field: any) => {
      console.log('[form-search] 处理字段:', {
        fieldName: field.fieldName,
        component: field.component,
        componentPropsType: typeof field.componentProps,
        componentPropsIsFunction: typeof field.componentProps === 'function',
        componentProps: field.componentProps,
      });
      
      const fieldConfig = { ...field };
      const originalComponentProps = fieldConfig.componentProps;
      const isComponentPropsFunction = typeof originalComponentProps === 'function';
      
      console.log('[form-search] originalComponentProps:', {
        type: typeof originalComponentProps,
        isFunction: isComponentPropsFunction,
        keys: typeof originalComponentProps === 'object' && originalComponentProps ? Object.keys(originalComponentProps) : 'N/A',
      });

      // 如果 componentProps 是函数，我们需要包装它
      // 如果 componentProps 是对象，直接使用
      const originalComponentPropsObj = isComponentPropsFunction ? {} : (originalComponentProps || {});

      const originalOnChange = originalComponentPropsObj.onChange;
      const originalOnClear = originalComponentPropsObj.onClear;
      const originalClear = originalComponentPropsObj.clear;
      const originalUpdateModelValue =
        originalComponentPropsObj['onUpdate:modelValue'];
      // Ant Design Vue Select 使用 update:value 事件（v-model:value）
      const originalUpdateValue = originalComponentPropsObj['onUpdate:value'];

      // 为 ApiSelect 等组件创建特殊处理函数，确保值正确更新到表单
      // 用于标记是否正在处理 clear 事件，避免 clear 和 onUpdate:value 重复触发搜索
      let isClearing = false;
      // 记录上一次的值，用于判断是否是 clear 操作
      let previousValue: any = undefined;
      // 用于标记最近一次 clear 操作的时间戳，防止短时间内重复触发
      let lastClearTime = 0;
      // 用于标记是否已经通过 clear 事件触发了搜索，防止 onUpdate:value 再次触发
      let searchTriggeredByClear = false;
      const CLEAR_DEBOUNCE_TIME = 600; // 600ms 内的 clear 相关事件都视为同一次操作（增加时间窗口）

      const createApiSelectHandler = (
        originalHandler?: (...args: any[]) => any,
        immediate = false,
      ) => {
        return async (value: any, ...args: any[]) => {
          // 执行原有的处理函数（如果有）
          if (originalHandler) {
            originalHandler(value, ...args);
          }

          // 判断是否是 clear 操作：值从有值变为 undefined/null
          const isClearOperation =
            previousValue !== undefined &&
            previousValue !== null &&
            (value === undefined || value === null);

          // 处理级联清空：当字段值变化时，清空依赖字段
          const cascadeClearFields = fieldConfig.cascadeClear;
          if (cascadeClearFields && Array.isArray(cascadeClearFields) && gridApiRef.value?.formApi) {
            const form = await gridApiRef.value.formApi.getForm();
            if (form) {
              // 检查值是否发生了变化（包括从有值变为其他值，或从有值变为空）
              const valueChanged = previousValue !== value;
              // 如果值发生了变化，清空依赖字段
              if (valueChanged && previousValue !== undefined) {
                for (const fieldName of cascadeClearFields) {
                  const currentValue = form.getFieldValue?.(fieldName);
                  if (currentValue !== undefined && currentValue !== null) {
                    form.setFieldValue(fieldName, undefined);
                  }
                }
              }
            }
          }

          const now = Date.now();
          const timeSinceLastClear = lastClearTime > 0 ? now - lastClearTime : 0;
          const shouldSkipSearch =
            isClearing ||
            isClearOperation ||
            searchTriggeredByClear ||
            (lastClearTime > 0 && timeSinceLastClear < CLEAR_DEBOUNCE_TIME);

          // 如果正在处理 clear 事件，或者在最近 600ms 内有过 clear 操作，或者检测到是 clear 操作
          // 或者已经通过 clear 事件触发了搜索，则完全跳过搜索，只更新表单值（搜索由 onClear 事件统一处理）
          if (shouldSkipSearch) {
            // 更新上一次的值，但不触发搜索
            previousValue = value;
            // 对于 ApiSelect，需要手动更新表单值
            if (gridApiRef.value?.formApi) {
              const form = await gridApiRef.value.formApi.getForm();
              if (form && fieldConfig.fieldName) {
                form.setFieldValue(fieldConfig.fieldName, value);
              }
            }
            // 完全返回，不触发任何搜索
            return;
          }

          // 更新上一次的值
          previousValue = value;

          // 对于 ApiSelect，需要手动更新表单值
          // 因为 ApiSelect 使用 v-model:value，表单系统可能没有正确捕获值的变化
          if (gridApiRef.value?.formApi) {
            const form = await gridApiRef.value.formApi.getForm();
            if (form && fieldConfig.fieldName) {
              // 手动设置表单字段值，确保值正确更新
              form.setFieldValue(fieldConfig.fieldName, value);
            }
          }

          // 根据 immediate 参数决定是立即执行还是防抖执行
          if (immediate) {
            await performSearch();
          } else {
            debouncedSearch();
          }
        };
      };

      // 创建 clear 事件处理函数
      const createClearHandler = (originalHandler?: (...args: any[]) => any) => {
        return async (...args: any[]) => {
          // 如果已经在处理 clear 事件，直接返回，避免重复处理
          if (isClearing) {
            return;
          }
          
          // 先立即更新标志和时间戳，防止 onUpdate:value 事件在 clear 处理之前或之后触发搜索
          const now = Date.now();
          lastClearTime = now;
          isClearing = true;
          searchTriggeredByClear = false; // 重置标志
          // 提前更新 previousValue，这样后续的 onUpdate:value 事件能被正确识别为 clear 操作
          const oldValue = previousValue;
          previousValue = undefined;
          
          // 执行原有的处理函数（如果有）
          if (originalHandler) {
            originalHandler(...args);
          }
          
          try {
            // 手动更新表单值为 undefined
            if (gridApiRef.value?.formApi) {
              const form = await gridApiRef.value.formApi.getForm();
              if (form && fieldConfig.fieldName) {
                form.setFieldValue(fieldConfig.fieldName, undefined);
              }
            }
            
            // 等待一个 tick，确保 onUpdate:value 事件已经处理完成（如果它先触发）
            await nextTick();
            
            // 标记搜索已由 clear 事件触发
            searchTriggeredByClear = true;
            
            // clear 事件立即触发搜索（只触发一次）
            // 注意：先执行搜索，再设置全局标志，防止 performSearch 中的检查跳过本次搜索
            await performSearch();
            
            // 搜索完成后，记录全局的 clear 搜索 ID，防止防抖函数延迟执行时重复搜索
            globalClearSearchId = `clear_search_${now}_${Math.random().toString(36).substr(2, 9)}`;
            globalLastClearTime = now;
          } catch (error) {
            // 如果搜索失败，恢复 previousValue
            previousValue = oldValue;
            searchTriggeredByClear = false;
            throw error;
          } finally {
            // 延迟重置标志，确保所有相关事件都处理完成
            // 使用更长的延迟，确保所有 clear 相关的事件都处理完成
            await nextTick();
            await nextTick();
            // 再延迟一段时间，确保所有 clear 相关的事件都处理完成
            setTimeout(() => {
              const resetTime = Date.now();
              isClearing = false;
              searchTriggeredByClear = false;
              // 清空时间戳，避免影响后续的正常操作
              if (resetTime - lastClearTime >= CLEAR_DEBOUNCE_TIME) {
                lastClearTime = 0;
              }
              // 清空全局 clear 搜索 ID，允许后续的正常搜索
              if (resetTime - globalLastClearTime >= CLEAR_DEBOUNCE_TIME) {
                globalClearSearchId = null;
                globalLastClearTime = 0;
              }
            }, CLEAR_DEBOUNCE_TIME);
          }
        };
      };

      // 为 SynapseInput 创建特殊处理函数，确保值正确更新到表单
      const createSynapseInputHandler = (
        originalHandler?: (...args: any[]) => any,
        immediate = false,
      ) => {
        return async (value: any, ...args: any[]) => {
          // 执行原有的处理函数（如果有）
          if (originalHandler) {
            originalHandler(value, ...args);
          }

          // 对于 SynapseInput，需要手动更新表单值
          // 因为 SynapseInput 使用 v-model，表单系统可能没有正确捕获值的变化
          if (gridApiRef.value?.formApi && fieldConfig.fieldName) {
            const form = await gridApiRef.value.formApi.getForm();
            if (form) {
              // 手动设置表单字段值，确保值正确更新
              form.setFieldValue(fieldConfig.fieldName, value);
            }
          }

          // 根据 immediate 参数决定是立即执行还是防抖执行
          if (immediate) {
            await performSearch();
          } else {
            debouncedSearch();
          }
        };
      };

      // 为 ApiTreeSelect 创建特殊处理函数，确保值正确更新到表单
      const createApiTreeSelectHandler = (
        originalHandler?: (...args: any[]) => any,
        immediate = false,
      ) => {
        return async (value: any, ...args: any[]) => {
          console.log('[form-search] ApiTreeSelect onUpdate:value 被调用:', {
            fieldName: fieldConfig.fieldName,
            value,
            timestamp: new Date().toISOString(),
          });

          // 执行原有的处理函数（如果有）
          if (originalHandler) {
            originalHandler(value, ...args);
          }

          // 对于 ApiTreeSelect，需要手动更新表单值
          // 因为 ApiTreeSelect 使用 v-model:value，表单系统可能没有正确捕获值的变化
          if (gridApiRef.value?.formApi && fieldConfig.fieldName) {
            const form = await gridApiRef.value.formApi.getForm();
            if (form) {
              console.log('[form-search] 更新表单字段值:', {
                fieldName: fieldConfig.fieldName,
                value,
                oldValue: form.getFieldValue?.(fieldConfig.fieldName),
              });
              // 手动设置表单字段值，确保值正确更新
              form.setFieldValue(fieldConfig.fieldName, value);
              
              // 验证值是否已更新
              await nextTick();
              const updatedValue = form.getFieldValue?.(fieldConfig.fieldName);
              console.log('[form-search] 表单字段值更新后:', {
                fieldName: fieldConfig.fieldName,
                updatedValue,
                valueMatch: updatedValue === value,
              });
            }
          }

          // 根据 immediate 参数决定是立即执行还是防抖执行
          if (immediate) {
            await performSearch();
          } else {
            debouncedSearch();
          }
        };
      };

      // 创建事件处理器对象
      const eventHandlers = {
        // 监听 onChange：用户输入时触发搜索（使用防抖，避免频繁请求）
        // 对于 ApiSelect、ApiTreeSelect 和 SynapseInput 组件，需要手动更新表单值
        onChange:
          fieldConfig.component === 'ApiSelect'
            ? createApiSelectHandler(originalOnChange, false)
            : fieldConfig.component === 'ApiTreeSelect'
              ? createApiTreeSelectHandler(originalOnChange, false)
              : fieldConfig.component === 'SynapseInput'
                ? createSynapseInputHandler(originalOnChange, false)
                : createAutoSearchHandler(
                    originalOnChange,
                    false,
                    fieldConfig.fieldName,
                  ),
        // VbenSelect 和 SynapseInput 使用 update:modelValue 事件，也需要监听
        'onUpdate:modelValue':
          fieldConfig.component === 'SynapseInput'
            ? createSynapseInputHandler(originalUpdateModelValue, false)
            : createAutoSearchHandler(
                originalUpdateModelValue,
                false,
                fieldConfig.fieldName,
              ),
        // Ant Design Vue Select 使用 update:value 事件（v-model:value），需要监听以确保值正确更新到表单
        // 对于 ApiSelect 和 ApiTreeSelect 组件，使用特殊处理函数确保值正确同步到表单
        'onUpdate:value':
          fieldConfig.component === 'ApiSelect'
            ? createApiSelectHandler(originalUpdateValue, false)
            : fieldConfig.component === 'ApiTreeSelect'
              ? createApiTreeSelectHandler(originalUpdateValue, false)
              : createAutoSearchHandler(
                  originalUpdateValue,
                  false,
                  fieldConfig.fieldName,
                ),
        // 如果字段支持 allowClear，添加 clear 事件：清除按钮点击时立即触发搜索
        // Ant Design Vue 的 Input/Select 组件清除事件可能是 onClear 或 clear
        // SynapseInput 和 VbenSelect 组件使用 onClear 事件
        // 对于所有组件，使用通用的 clear 处理函数，避免与 onChange/onUpdate:value 重复触发
        ...(originalComponentPropsObj.allowClear
          ? {
              onClear:
                fieldConfig.component === 'ApiSelect'
                  ? createClearHandler(originalOnClear)
                  : fieldConfig.component === 'SynapseInput'
                    ? createClearHandler(originalOnClear)
                    : createUniversalClearHandler(
                        originalOnClear,
                        fieldConfig.fieldName,
                      ),
              clear:
                fieldConfig.component === 'ApiSelect'
                  ? createClearHandler(originalClear)
                  : fieldConfig.component === 'SynapseInput'
                    ? createClearHandler(originalClear)
                    : createUniversalClearHandler(
                        originalClear,
                        fieldConfig.fieldName,
                      ),
            }
          : {}),
      };

      // 如果 componentProps 是函数，包装它以添加事件处理器
      if (isComponentPropsFunction) {
        fieldConfig.componentProps = (values: any, actions: any) => {
          console.log('[form-search] componentProps 函数被调用:', {
            fieldName: fieldConfig.fieldName,
            values,
            timestamp: new Date().toISOString(),
          });
          
          const originalProps = originalComponentProps(values, actions);
          console.log('[form-search] 原始 componentProps 返回:', {
            fieldName: fieldConfig.fieldName,
            originalProps,
            timestamp: new Date().toISOString(),
          });
          
          // 合并事件处理器
          const mergedProps = {
            ...originalProps,
            ...eventHandlers,
            // 如果原始 props 中有事件处理器，需要合并（保留原始处理器，但添加我们的处理器）
            onChange: originalProps?.onChange
              ? (...args: any[]) => {
                  originalProps.onChange(...args);
                  eventHandlers.onChange?.(...args);
                }
              : eventHandlers.onChange,
            'onUpdate:value': originalProps?.['onUpdate:value']
              ? (...args: any[]) => {
                  originalProps['onUpdate:value'](...args);
                  eventHandlers['onUpdate:value']?.(...args);
                }
              : eventHandlers['onUpdate:value'],
            'onUpdate:modelValue': originalProps?.['onUpdate:modelValue']
              ? (...args: any[]) => {
                  originalProps['onUpdate:modelValue'](...args);
                  eventHandlers['onUpdate:modelValue']?.(...args);
                }
              : eventHandlers['onUpdate:modelValue'],
          };
          
          console.log('[form-search] 合并后的 componentProps:', {
            fieldName: fieldConfig.fieldName,
            mergedProps,
            timestamp: new Date().toISOString(),
          });
          
          return mergedProps;
        };
      } else {
        // 如果 componentProps 是对象，直接合并
        fieldConfig.componentProps = {
          ...originalComponentPropsObj,
          ...eventHandlers,
        };
      }

      return fieldConfig;
    });
  }

  return formOptions;
}

/**
 * 创建设置字段值并触发搜索的函数
 * @param gridApi 表格 API 实例
 * @returns 设置字段值并触发搜索的函数
 */
export function createSetFieldValueAndSearch(gridApi: any) {
  return async (fieldName: string, value: any): Promise<void> => {
    // 检查 gridApi 是否有效
    if (!gridApi) {
      console.warn('gridApi 不可用');
      return;
    }

    // 等待 gridApi 初始化完成
    let retryCount = 0;
    const maxRetries = 10; // 最多重试 10 次
    const retryDelay = 100; // 每次重试延迟 100ms

    while (retryCount < maxRetries) {
      if (gridApi.formApi) {
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
      retryCount++;
    }

    // 再次检查 gridApi 和 formApi 是否有效
    if (!gridApi || !gridApi.formApi) {
      console.warn(
        `gridApi.formApi 在 ${maxRetries * retryDelay}ms 后仍未初始化`,
      );
      return;
    }

    try {
      const formApi = gridApi.formApi;

      // 使用 formApi 的公共方法设置字段值
      await formApi.setFieldValue(fieldName, value);

      // 等待表单值更新
      await nextTick();
      await nextTick();

      // 再次检查 gridApi 是否仍然有效（可能在等待期间组件已卸载）
      if (!gridApi || !gridApi.formApi) {
        return;
      }

      // 获取当前所有表单值（包含新设置的字段值）
      const formValues = (await formApi.getValues()) || {};

      // 确保新设置的字段值被包含在查询参数中
      const queryParams = {
        ...formValues,
        [fieldName]: value, // 明确设置，确保值正确
      };

      // 设置最新提交值，这样 query 方法可以获取到正确的值
      formApi.setLatestSubmissionValues(queryParams);

      // 最后一次检查 gridApi 和 query 方法是否有效
      if (!gridApi || !gridApi.query) {
        console.warn('gridApi.query 方法不可用');
        return;
      }

      // 使用 query 方法触发搜索，传入查询参数
      // query 方法会将 customValues 与 getLatestSubmissionValues() 合并
      await gridApi.query(queryParams);
    } catch (error) {
      // 忽略组件卸载后的错误（这些错误通常是因为组件已销毁）
      // 只记录其他类型的错误
      if (error && typeof error === 'object' && 'message' in error) {
        const errorMessage = String(error.message || '');
        // 如果错误信息包含 'flags' 或 'null'，可能是组件卸载导致的，忽略
        if (
          !errorMessage.includes('flags') &&
          !errorMessage.includes('Cannot read properties of null')
        ) {
          console.error('设置字段值并触发搜索失败:', error);
        }
      } else {
        console.error('设置字段值并触发搜索失败:', error);
      }
    }
  };
}

