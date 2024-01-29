import { useEffect } from 'react';
import { z } from 'zod';
import { useCurrentUser } from '~/hooks/useCurrentUser';
import useIsClient from '~/hooks/useIsClient';
import { closeRoutedContext } from '~/providers/RoutedContextProvider';
import Router, { useRouter } from 'next/router';
import { QS } from '~/utils/qs';

export type RoutedContext = {
  opened: boolean;
  close: () => void;
};

export type RoutedContextProps<TSchema extends z.AnyZodObject> = {
  context: RoutedContext;
  props: z.infer<TSchema>;
};

// TODO - handle optional schema/schema props that would make the Element props optional
export function createRoutedContext<TSchema extends z.AnyZodObject>({
  authGuard,
  schema,
  Element: BaseComponent,
}: {
  authGuard?: boolean;
  schema?: TSchema;
  Element:
    | React.ForwardRefExoticComponent<RoutedContextProps<TSchema>>
    | ((props: RoutedContextProps<TSchema>) => JSX.Element);
}) {
  function RoutedContext(props: z.infer<TSchema>) {
    const isClient = useIsClient();
    const user = useCurrentUser();
    const result = schema?.safeParse(props) ?? { success: true, data: {} };
    const router = useRouter();

    /*
      This is necessary in order to maintain scroll position on router.back
    */
    useEffect(() => {
      router.beforePopState((state) => {
        state.options.scroll = false;
        return true;
      });

      return () => router.beforePopState(() => true);
    }, []);

    if (!result.success) return null;
    if (!user && authGuard) {
      if (isClient) closeRoutedContext();
      return null;
    }

    return (
      <BaseComponent context={{ opened: true, close: closeRoutedContext }} props={result?.data} />
    );
  }

  return RoutedContext;
}
