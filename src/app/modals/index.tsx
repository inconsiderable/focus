import { PageShell } from '../components/pageShell';
import { useMind } from '../useCases/useMind';
import { useContext, useEffect, useState } from 'react';
import { AppContext } from '../utils/appContext';
import Flow from '../components/flow';

const Index = () => {
  const { selectedKey } = useMind();

  const { colorScheme, graph, requestGraph, rankingFilter } =
    useContext(AppContext);

  const [peekGraphKey, setPeekGraphKey] = useState<string | null | undefined>();

  const whichKey =
    peekGraphKey ||
    selectedKey ||
    '0000000000000000000000000000000000000000000=';

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      if (whichKey) {
        requestGraph(whichKey);
      }
    }, 0);
    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [whichKey, requestGraph]);

  useEffect(() => {
    const resultHandler = (data: any) => {
      if (whichKey && data.detail) {
        requestGraph(whichKey);
      }
    };

    document.addEventListener('inv_view', resultHandler);

    return () => {
      document.removeEventListener('inv_view', resultHandler);
    };
  }, [whichKey, requestGraph]);

  return (
    <PageShell
      renderBody={() => (
        <>
          {!!whichKey && (
            <>
              {!!graph && (
                <Flow
                  forKey={whichKey}
                  nodes={graph.nodes ?? []}
                  links={graph.links ?? []}
                  setForKey={setPeekGraphKey}
                  rankingFilter={rankingFilter}
                  colorScheme={colorScheme}
                />
              )}
            </>
          )}
        </>
      )}
    />
  );
};

export default Index;
