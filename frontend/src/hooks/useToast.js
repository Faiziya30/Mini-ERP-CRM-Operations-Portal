import { useCallback } from 'react';
import { useToastContext } from '../context/ToastContext';

const useToast = () => {
	const { pushToast } = useToastContext();

	const showToast = useCallback((message, type = 'success') => pushToast(message, type), [pushToast]);

	return Object.assign(showToast, { pushToast });
};

export default useToast;
