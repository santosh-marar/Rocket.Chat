import { NavBarItem } from '@rocket.chat/fuselage';
import { useEffectEvent } from '@rocket.chat/fuselage-hooks';
import { useRouter, useLayout, useSetting, useCurrentRoutePath } from '@rocket.chat/ui-contexts';
import type { HTMLAttributes, VFC } from 'react';
import React from 'react';

export const NavBarPageHome: VFC<Omit<HTMLAttributes<HTMLElement>, 'is'>> = (props) => {
	const router = useRouter();
	const { sidebar } = useLayout();
	const showHome = useSetting('Layout_Show_Home_Button');
	const handleHome = useEffectEvent(() => {
		sidebar.toggle();
		router.navigate('/home');
	});
	const currentRoute = useCurrentRoutePath();

	return showHome ? <NavBarItem {...props} icon='home' onClick={handleHome} pressed={currentRoute?.includes('/home')} /> : null;
};
