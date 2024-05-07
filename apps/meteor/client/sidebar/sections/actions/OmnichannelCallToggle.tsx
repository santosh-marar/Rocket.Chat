import type { ReactElement } from 'react';
import React from 'react';

import { useIsCallReady, useIsCallError } from '../../../contexts/CallContext';
import { OmnichannelCallToggleError } from './OmnichannelCallToggleError';
import { OmnichannelCallToggleLoading } from './OmnichannelCallToggleLoading';
import { OmnichannelCallToggleReady } from './OmnichannelCallToggleReady';

/**
 * @deprecated Moved to NavBar
 * @description duplicated in apps/meteor/client/NavBar/Omnichannel/OmnichannelCallToggle.tsx until feature is ready
 * @memberof newNavigation
 */
export const OmnichannelCallToggle = ({ ...props }): ReactElement => {
	const isCallReady = useIsCallReady();
	const isCallError = useIsCallError();
	if (isCallError) {
		return <OmnichannelCallToggleError {...props} />;
	}

	if (!isCallReady) {
		return <OmnichannelCallToggleLoading {...props} />;
	}

	return <OmnichannelCallToggleReady {...props} />;
};
