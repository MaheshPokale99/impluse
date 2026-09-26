import { useSyncExternalStore } from "react";

const MOBILE_QUERY = "(max-width: 767px)";

const subscribe = (callback: () => void) => {
    const media = window.matchMedia(MOBILE_QUERY);
    media.addEventListener("change", callback);
    return () => media.removeEventListener("change", callback);
};

/** True below the `md` breakpoint, where the sidebar becomes a slide-over sheet. */
export function useIsMobile() {
    return useSyncExternalStore(
        subscribe,
        () => window.matchMedia(MOBILE_QUERY).matches,
        () => false,
    );
}
