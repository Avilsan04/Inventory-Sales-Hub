import { useNavigate } from 'react-router-dom';

export interface IRoutingAdapter {
    readonly navigateTo: (path: string, replace?: boolean) => void;
}

export function useRoutingAdapter(): IRoutingAdapter {
    const navigate = useNavigate();

    return {
        navigateTo: (path: string, replace: boolean = false): void => {
            if (typeof path !== 'string' || path.trim().length === 0) {
                throw new Error('[Routing Exception] Invalid path provided to navigateTo.');
            }
            void navigate(path, { replace });
        }
    };
}