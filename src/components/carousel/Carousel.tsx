import classNames from "classnames";
import React, {
  ComponentType,
  PropsWithChildren,
  ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import { debounce } from "./utils";

export type BaseCarouselProps = {
  items: ReactNode[];
  limit?: number;
  className?: string;
  NextButtonComponent: ComponentType<{ onClick: () => void }>;
  PrevButtonComponent: ComponentType<{ onClick: () => void }>;
};
export function BaseCarousel({
  items,
  className,
  NextButtonComponent,
  PrevButtonComponent,
  limit = 5,
}: BaseCarouselProps) {
  const [containerElement, setContainerElement] =
    useState<HTMLDivElement | null>(null);
  const [maxItemHeight, setMaxItemHeight] = useState<number | null>(null);
  const [visibleLimit, setVisibleLimit] = useState(limit);
  const [containeWidth, setContainerWidth] = useState<number | null>(null);
  const [enableAnimation, setEnableAnimation] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const totalPage = useMemo(
    () => (visibleLimit ? Math.ceil(items.length / visibleLimit) : 1),
    [items.length, visibleLimit]
  );

  const elementPages = useMemo(() => {
    const pageLimit = visibleLimit;

    const pages = Array(totalPage)
      .fill(1)
      .map((_, page) => {
        const startIndex = page * pageLimit;
        const endIndex = startIndex + pageLimit;
        return items.slice(startIndex, endIndex);
      });
    return pages;
  }, [items, visibleLimit, totalPage]);

  const prevPage = useCallback(() => {
    setActiveIndex((prev) => {
      const newVal = prev - 1;
      if (newVal < 0) {
        return totalPage - 1;
      }
      return newVal;
    });
  }, [totalPage]);

  const nextPage = useCallback(() => {
    setActiveIndex((prev) => {
      const newVal = prev + 1;
      if (newVal > totalPage - 1) {
        return 0;
      }
      return newVal;
    });
  }, [totalPage]);

  useEffect(() => {
    const childrenElement = containerElement?.querySelectorAll(
      '[id^="carousel-items-"]'
    );
    function calculateContainerWidth() {
      const containerWidth =
        containerElement?.getBoundingClientRect().width ?? 0;
      setContainerWidth(containerWidth);
    }

    function calculateLimitItems() {
      const containerWidth =
        containerElement?.getBoundingClientRect().width ?? 300;

      let measurementSize: number[] = [];
      let measurementHeight: number[] = [];
      childrenElement?.forEach((element) => {
        const size = element.getBoundingClientRect().width;
        const height = element.clientHeight;

        measurementSize.push(size);
        measurementHeight.push(height);
      });

      const visibleItems = measurementSize.reduce(
        (visibleSizes: number[], size) => {
          const totalWidth = visibleSizes.reduce((sum, s) => sum + s, 0);
          const newSize = totalWidth + size * 1.5;
          if (size > 0 && newSize < containerWidth) {
            return [...visibleSizes, size];
          }
          return visibleSizes;
        },
        []
      );

      const visibleItem =
        visibleItems.length > limit ? limit : visibleItems.length || 1;

      if (visibleItem < limit) {
        setVisibleLimit(visibleItem);
      } else {
        setVisibleLimit(limit);
      }

      const maxHeight = measurementHeight.reduce(
        (max, h) => (h > max ? h : max),
        0
      );

      setMaxItemHeight(maxHeight);
    }

    function measureElement() {
      setEnableAnimation(false);
      calculateContainerWidth();
      calculateLimitItems();
      debounce(() => {
        setEnableAnimation(true);
      }, 500)();
    }

    measureElement();
    window.addEventListener("resize", measureElement);
    return () => {
      window.removeEventListener("resize", measureElement);
    };
  }, [containerElement, limit]);

  useLayoutEffect(() => {
    setEnableAnimation(true);
  }, []);

  useEffect(() => {
    if (activeIndex + 1 > totalPage) {
      setActiveIndex(totalPage - 1);
    }
  }, [activeIndex, totalPage]);

  return (
    <div
      className={classNames(
        "w-full relative flex flex-row justify-center items-center"
      )}
      style={{
        animation: `fadeIn ${1}s ease-in-out forwards`,
      }}
    >
      {<PrevButtonComponent onClick={prevPage} />}
      <div
        ref={setContainerElement}
        id="carousel-container"
        className={classNames(
          "overflow-hidden w-full relative flex flex-row justify-center items-center",
          className
        )}
        style={{
          height: maxItemHeight ?? 0,
        }}
      >
        {elementPages?.map((elements, index) => (
          <CarouselPage
            key={index}
            width={containeWidth ?? 1000}
            index={index}
            activeIndex={activeIndex}
            enableAnimation={enableAnimation}
          >
            {elements?.map((element, elementIndex) => {
              const key = `carousel-items-${(index + 1) * elementIndex + 1}`;
              return (
                <div id={key} key={key}>
                  {element}
                </div>
              );
            })}
          </CarouselPage>
        ))}
      </div>
      {<NextButtonComponent onClick={nextPage} />}
    </div>
  );
}

type CarouselPageProps = {
  index: number;
  activeIndex: number;
  className?: string;
  width: number;
  enableAnimation?: boolean;
};
function CarouselPage({
  index,
  activeIndex,
  className,
  width,
  children,
  enableAnimation,
}: PropsWithChildren<CarouselPageProps>) {
  const carouselItemClassNames = classNames(
    "w-full flex justify-around items-center gap-2 h-full",
    "absolute",
    { "transition-all": enableAnimation },
    className
  );

  const offset = index - activeIndex;
  const contentWidth = width;

  return (
    <div
      id={`${index}`}
      className={carouselItemClassNames}
      style={{
        minWidth: contentWidth,
        left: 0,
        transform: `translateX(${offset * contentWidth}px)`,
      }}
    >
      {children}
    </div>
  );
}
