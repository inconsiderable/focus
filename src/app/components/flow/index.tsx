import {
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import {
  IonBadge,
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonIcon,
  IonItem,
  IonList,
  IonRange,
  IonSearchbar,
  IonToggle,
  useIonModal,
  useIonViewWillEnter,
  useIonViewWillLeave,
} from '@ionic/react';
import ForceGraph3D from 'react-force-graph-3d';
import {
  CSS2DRenderer,
  CSS2DObject,
} from 'three/examples/jsm/renderers/CSS2DRenderer';
import { useKeyBriefer } from '../keyBriefer';
import {
  arrowBackOutline,
  optionsOutline,
  ellipseOutline,
  chevronCollapseOutline,
  discOutline,
} from 'ionicons/icons';
import { AppContext } from '../../utils/appContext';
import { shortenB64 } from '../../utils/compat';
import { GraphLink, GraphNode } from '../../utils/appTypes';
import View from '../../modals/view';
import Point from '../../modals/point';

const NODE_R = 3;
const extraRenderers = [new CSS2DRenderer()];

function FlowMap({
  forKey,
  setForKey,
  nodes,
  links,
  rankingFilter,
}: {
  forKey: string;
  setForKey: (pk: string) => void;
  nodes: GraphNode[];
  links: GraphLink[];
  rankingFilter: number;
  colorScheme: 'light' | 'dark';
}) {
  const [presentKV] = useKeyBriefer(forKey);

  const [presentViewModal, dismissView] = useIonModal(View, {
    onDismiss: (data: string, role: string) => dismissView(data, role),
  });

  const [presentPointModal, dismissPoint] = useIonModal(Point, {
    onDismiss: (data: string, role: string) => dismissPoint(data, role),
    forKey,
  });

  const handleNodeFocus = useCallback(
    (node: any, clicked: boolean = false) => {
      if (node?.pubkey === forKey && clicked) {
        presentKV({
          initialBreakpoint: 0.75,
          breakpoints: [0, 0.75, 1],
        });
      } else {
        if (node?.id === -1) {
          presentPointModal();
        } else {
          setForKey(node?.pubkey);
        }
      }
    },
    [forKey, setForKey, presentKV, presentPointModal],
  );

  const initialNode = useMemo(
    () => nodes.find((n) => n.pubkey === forKey),
    [nodes, forKey],
  );

  useEffect(() => {
    handleNodeFocus(initialNode);
  }, [initialNode, handleNodeFocus]);

  const forceRef = useRef<any>();

  const maxWeight = useMemo(
    () => Math.max(...links.map((l) => l.value)),
    [links],
  );

  const [present, dismiss] = useIonModal(Filters, {
    onDismiss: () => dismiss(),
    value: rankingFilter,
  });

  const handleSearch = (ev: Event) => {
    const target = ev.target as HTMLIonSearchbarElement;
    if (!target) return;

    const value = target.value!;

    if (!value) {
      return;
    }

    if (new RegExp('[A-Za-z0-9/+]{43}=').test(value)) {
      setForKey(value);
    } else {
      //remove non Base64 characters eg: @&!; etc and pad with 00000
      const query = `${value.replace(/[^A-Za-z0-9/+]/gi, '').padEnd(43, '0')}=`;
      setForKey(query);
    }
  };

  const placeholderRef = useRef<HTMLDivElement>(null);
  const [rect, setRect] = useState<DOMRect | null>(null);

  // Update rect on mount and when window resizes
  useLayoutEffect(() => {
    function updateRect() {
      if (placeholderRef.current) {
        setRect(placeholderRef.current.getBoundingClientRect());
      }
    }
    updateRect();
    window.addEventListener('resize', updateRect);
    return () => window.removeEventListener('resize', updateRect);
  }, []);

  // Force a re-measure after initial paint
  useEffect(() => {
    setTimeout(() => {
      if (placeholderRef.current) {
        setRect(placeholderRef.current.getBoundingClientRect());
      }
    }, 0);
  }, []);

  useIonViewWillEnter(() => {
    const container = document.getElementById('fg-portal');
    if (container !== null) {
      container.style.display = 'block'; // Show portal container
    }
  }, []);

  useIonViewWillLeave(() => {
    const container = document.getElementById('fg-portal');
    if (container !== null) {
      container.style.display = 'none'; // Remove portal container
    }
  }, []);

  return (
    <IonCard>
      <IonCardHeader className="ion-padding-horizontal">
        <IonCardSubtitle
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <IonSearchbar
            debounce={1000}
            placeholder="Beginning"
            //searchIcon={discOutline}
            clearIcon={discOutline}
            cancelButtonIcon={arrowBackOutline}
            showCancelButton="focus"
            showClearButton="always"
            value={forKey}
            type="url"
            enterkeyhint="go"
            onIonChange={(ev) => handleSearch(ev)}
            onIonCancel={() => setForKey('0'.padEnd(43, '0') + '=')}
            onIonClear={() => setForKey('0'.padEnd(43, '0') + '=')}
          />
        </IonCardSubtitle>
        <IonCardSubtitle className="ion-no-padding">
          <IonButton
            className="ion-no-padding"
            fill="clear"
            onClick={(e) => {
              e.stopPropagation();
              present({
                initialBreakpoint: 0.75,
                breakpoints: [0, 0.75, 1],
              });
            }}
          >
            <IonIcon color="primary" slot="icon-only" icon={optionsOutline} />
            <IonBadge
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                opacity: 0.9,
              }}
              className="ion-no-padding"
              color="danger"
            >
              2
            </IonBadge>
          </IonButton>
          <IonButton onClick={() => presentViewModal()} fill="clear">
            <IonIcon
              className="ion-no-padding"
              color="primary"
              slot="icon-only"
              icon={ellipseOutline}
            />
          </IonButton>
          <IonButton onClick={() => presentPointModal()} fill="clear">
            <IonIcon
              className="ion-no-padding"
              color="primary"
              slot="icon-only"
              icon={chevronCollapseOutline}
            />
          </IonButton>
        </IonCardSubtitle>
      </IonCardHeader>
      <IonCardContent className="ion-no-padding">
        <div
          ref={placeholderRef}
          className="flow-graph-container"
          style={{
            width: '100%',
            height: 'calc(100vh - 220px)',
            position: 'relative',
            zIndex: 1,
            background: 'transparent',
          }}
        />
        {rect
          ? createPortal(
              <div
                style={{
                  position: 'fixed',
                  left: rect.left,
                  top: rect.top,
                  width: rect.width,
                  height: rect.height,
                  pointerEvents: 'auto',
                }}
              >
                <ForceGraph3D
                  ref={forceRef}
                  nodeRelSize={NODE_R}
                  extraRenderers={extraRenderers}
                  width={rect.width}
                  height={rect.height}
                  graphData={{ nodes, links }}
                  linkWidth={(link) => 1}
                  linkDirectionalParticles={(link) =>
                    scaleEdgeWeight(link.value, maxWeight) * 5
                  }
                  linkDirectionalParticleSpeed={(link) =>
                    scaleEdgeWeight(link.value, maxWeight) * 0.01
                  }
                  nodeThreeObject={(node) => {
                    //label, pubkey, locale, ranking, imbalance
                    //{Number((forKey?.ranking ?? 0 / 1) * 100).toFixed(2)}%
                    const parent = document.createElement('ion-badge');

                    if (node.id === -1) {
                      parent.color = 'danger';
                    }

                    const nodeEl = document.createElement('code');
                    nodeEl.className = 'force-node-badge';
                    nodeEl.textContent = node.label || shortenB64(node.pubkey);
                    nodeEl.style.color = node.color;
                    nodeEl.addEventListener('click', function (e) {
                      e.stopPropagation();
                      handleNodeFocus(node, true);
                    });
                    nodeEl.style.cursor = 'pointer';
                    nodeEl.style.pointerEvents = 'auto'; // Ensure badge is clickable

                    parent.appendChild(nodeEl);
                    return new CSS2DObject(parent);
                  }}
                  nodeThreeObjectExtend={true}
                  //onNodeClick={(p) => handleNodeFocus(p, true)}
                />
              </div>,
              document.getElementById('fg-portal')!,
            )
          : null}
      </IonCardContent>
    </IonCard>
  );
}

const scaleEdgeWeight = (weight: number, maxWeight: number) => {
  return Math.log2(2 + weight) / Math.log2(2 + maxWeight);
};

export default FlowMap;

export const Filters = ({
  onDismiss,
  value,
}: {
  onDismiss: () => void;
  value: string;
}) => {
  const { rankingFilter, setRankingFilter } = useContext(AppContext);

  return (
    <div className="ion-padding">
      <IonList>
        <IonItem>
          <IonRange
            aria-label="Attention filter"
            labelPlacement="start"
            label={`Filter < ${value}%`}
            pin={true}
            pinFormatter={(value: number) => `${value}%`}
            onIonChange={({ detail }) => setRankingFilter(Number(detail.value))}
            value={rankingFilter}
          />
        </IonItem>
        <IonItem>
          <IonToggle>Toggle inflow/outflow</IonToggle>
        </IonItem>
        <IonItem>
          <IonToggle>Toggle snapshots</IonToggle>
        </IonItem>
        <IonItem>
          <IonToggle>Toggle knowledge/flow trees</IonToggle>
        </IonItem>
      </IonList>
    </div>
  );
};
