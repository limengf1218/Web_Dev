import { openConfirmModal } from '@mantine/modals';
import { useCallback, useEffect, useRef } from 'react';
import { EventType, FieldPath, UseFormReturn } from 'react-hook-form';
import { Subscription } from 'react-hook-form/dist/utils/createSubject';
import { z } from 'zod';
import { useDebouncer } from '~/utils/debouncer';
import { showErrorNotification } from '~/utils/notifications';
import { useTranslation } from 'react-i18next';
export function useFormStorage<TSchema extends z.AnyZodObject, TContext>({
  schema,
  timeout,
  form,
  key,
  watch,
}: {
  schema: TSchema;
  timeout: number;
  form: UseFormReturn<z.infer<TSchema>, TContext>;
  key: string;
  watch: (
    value: DeepPartial<z.infer<TSchema>>,
    info: {
      name?: FieldPath<z.infer<TSchema>>;
      type?: EventType;
    }
  ) => DeepPartial<z.infer<TSchema>> | void;
}) {
  const debouncer = useDebouncer(timeout);
  const { t } = useTranslation();
  const subscriptionRef = useRef<Subscription>();
  const createSubscription = () => {
    subscriptionRef.current = form.watch((value, info) => {
      const watchedValue = watch(value as any, info);
      if (!watchedValue) return;
      debouncer(() => {
        localStorage.setItem(key, JSON.stringify(watchedValue));
      });
    });
  };

  useEffect(() => {
    /**
     * assign a value to subscription immediately if there is no localstorage value
     * or assign a value to subscription after the user has closed the `restore-confirm` modal
     */
    const storedValue = localStorage.getItem(key);
    if (!storedValue) createSubscription();
    else {
      const initialValue = JSON.parse(storedValue);
      openConfirmModal({
        modalId: 'restore-confirm',
        centered: true,
        title: t('Restore unsaved changes?'),
        children: t('Would you like to restore the unsaved changes from your previous session'),
        labels: { cancel: `No`, confirm: `Yes` },
        closeOnConfirm: true,
        onClose: createSubscription,
        onConfirm: () => {
          const result = schema.safeParse({ ...form.getValues(), ...initialValue });
          if (!result.success)
            showErrorNotification({ error: new Error(t('could not restore unsaved changes')as string) });
          else form.reset(result.data);
        },
      });
    }

    return () => subscriptionRef.current?.unsubscribe();
  }, [key]);

  return useCallback(() => localStorage.removeItem(key), [key]);
}
