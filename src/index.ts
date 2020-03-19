import {useCallback, useEffect, useRef, RefObject} from 'react';
import './styles.css';

type Lamda = () => void;
type Options = {
  offset: number;
  offsetNode: RefObject<HTMLElement>;
  throttle: (fn: Lamda) => Lamda;
  stickyClasses: string | string[];
};

export function useSticky(
  stickyNode: RefObject<HTMLElement>,
  options?: Options,
) {
  const {offset = 0, offsetNode, throttle, stickyClasses = []} = options || {};
  const isSticky = useRef(false);

  const calculateOffsetTop = useCallback(() => {
    const offsetNodeHeight =
      offsetNode && offsetNode.current
        ? offsetNode.current.getBoundingClientRect().height
        : 0;
    const offsetTop = offset + offsetNodeHeight;
    return offsetTop;
  }, [offset, offsetNode]);

  const measure = useCallback(() => {
    if (!stickyNode.current) return;

    const stickyNodeTop =
      stickyNode.current && stickyNode.current.getBoundingClientRect().top;
    const offsetTop = calculateOffsetTop();
    const shouldStick = stickyNodeTop <= offsetTop;
    const stickyClass = Array.isArray(stickyClasses)
      ? stickyClasses
      : [stickyClasses];

    if (shouldStick && !isSticky.current) {
      isSticky.current = true;
      stickyClass && stickyNode.current.classList.add(...stickyClass);
    } else if (!shouldStick && isSticky.current) {
      isSticky.current = false;
      stickyClass && stickyNode.current.classList.remove(...stickyClass);
    }
  }, [stickyNode, stickyClasses, calculateOffsetTop]);

  useEffect(() => {
    // Initial measure to init isSticky & apply classes
    measure();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!stickyNode.current) return;
    stickyNode.current.style.position = 'sticky';
    stickyNode.current.style.top = `${calculateOffsetTop()}px`;
  }, [stickyNode, calculateOffsetTop]);

  useEffect(() => {
    const callback = throttle ? throttle(measure) : measure;

    window.addEventListener('orientationchange', callback);
    window.addEventListener('resize', callback);
    document.addEventListener('scroll', callback);

    return () => {
      window.removeEventListener('orientationchange', callback);
      window.removeEventListener('resize', callback);
      document.removeEventListener('scroll', callback);
    };
  }, [measure, throttle]);
}
