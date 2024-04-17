import { faker } from '@faker-js/faker';
import type { Page } from '@playwright/test';

import { createAuxContext } from '../fixtures/createAuxContext';
import { Users } from '../fixtures/userStates';
import { OmnichannelLiveChat, HomeOmnichannel } from '../page-objects';
import { test, expect } from '../utils/test';

test.describe('omnichannel-take-chat', () => {
	let poLiveChat: OmnichannelLiveChat;
	let newVisitor: { email: string; name: string };

	let agent: { page: Page; poHomeChannel: HomeOmnichannel };

	test.beforeAll(async ({ api, browser }) => {
		await Promise.all([
			await api.post('/livechat/users/agent', { username: 'user1' }).then((res) => expect(res.status()).toBe(200)),
			await api.post('/settings/Livechat_Routing_Method', { value: 'Manual_Selection' }).then((res) => expect(res.status()).toBe(200)),
		]);

		const { page } = await createAuxContext(browser, Users.user1);
		agent = { page, poHomeChannel: new HomeOmnichannel(page) };
	});

	test.afterAll(async ({ api }) => {
		await Promise.all([
			await api.delete('/livechat/users/agent/user1').then((res) => expect(res.status()).toBe(200)),
			await api.post('/settings/Livechat_Routing_Method', { value: 'Auto_Selection' }).then((res) => expect(res.status()).toBe(200)),
			await api.post('/settings/Livechat_enabled_when_agent_idle', { value: true }).then((res) => expect(res.status()).toBe(200)),
		]);

		await agent.page.close();
	});

	test.beforeEach('start a new livechat chat', async ({ page, api }) => {
		await agent.poHomeChannel.sidenav.switchStatus('online');

		newVisitor = {
			name: `${faker.person.firstName()} ${faker.string.uuid()}`,
			email: faker.internet.email(),
		};

		poLiveChat = new OmnichannelLiveChat(page, api);

		await page.goto('/livechat');
	});

	test.afterEach(async () => {
		await poLiveChat.closeChat();
	});

	test.describe('When agent is idle', async () => {
		test.beforeEach(async () => {
			await agent.poHomeChannel.sidenav.switchStatus('offline');
		});

		test.describe('When Livechat_enabled_when_agent_idle is true', async () => {
			test.beforeEach(async ({ api }) => {
				await api.post('/settings/Livechat_enabled_when_agent_idle', { value: true }).then((res) => expect(res.status()).toBe(200));
			});

			test('user should take the chat', async () => {
				await poLiveChat.openChatAndSendMessage(newVisitor, 'this_a_test_message_from_user');

				await agent.poHomeChannel.sidenav.getQueuedChat(newVisitor.name).click();

				await expect(agent.poHomeChannel.content.btnTakeChat).toBeVisible();
				await agent.poHomeChannel.content.btnTakeChat.click();

				await agent.poHomeChannel.sidenav.openChat(newVisitor.name);
				await expect(agent.poHomeChannel.content.btnTakeChat).not.toBeVisible();
				await expect(agent.poHomeChannel.content.inputMessage).toBeVisible();
			});
		});

		test.describe('Livechat_enabled_when_agent_idle is false', async () => {
			test.beforeEach(async ({ api }) => {
				await api.post('/settings/Livechat_enabled_when_agent_idle', { value: false }).then((res) => expect(res.status()).toBe(200));
			});

			test('user should not take the chat when offline status', async () => {
				await poLiveChat.openChatAndSendMessage(newVisitor, 'this_a_test_message_from_user');

				await agent.poHomeChannel.sidenav.getQueuedChat(newVisitor.name).click();

				await expect(agent.poHomeChannel.content.btnTakeChat).toBeVisible();

				await agent.poHomeChannel.content.btnTakeChat.click();
				await expect(agent.page.locator('role=alert')).toBeVisible();
			});
		});
	});

	test.describe('When agent is online', () => {
		test.beforeEach(async () => {
			await agent.poHomeChannel.sidenav.switchStatus('online');
		});
		test.describe('When Livechat_enabled_when_agent_idle is true', async () => {
			test.beforeEach(async ({ api }) => {
				await api.post('/settings/Livechat_enabled_when_agent_idle', { value: true }).then((res) => expect(res.status()).toBe(200));
			});

			test('user should take the chat', async () => {
				await poLiveChat.openChatAndSendMessage(newVisitor, 'this_a_test_message_from_user');

				await agent.poHomeChannel.sidenav.getQueuedChat(newVisitor.name).click();

				await expect(agent.poHomeChannel.content.btnTakeChat).toBeVisible();
				await agent.poHomeChannel.content.btnTakeChat.click();

				await agent.poHomeChannel.sidenav.openChat(newVisitor.name);
				await expect(agent.poHomeChannel.content.btnTakeChat).not.toBeVisible();
				await expect(agent.poHomeChannel.content.inputMessage).toBeVisible();
			});
		});

		test.describe('When Livechat_enabled_when_agent_idle is false', async () => {
			test.beforeEach(async ({ api }) => {
				await api.post('/settings/Livechat_enabled_when_agent_idle', { value: false }).then((res) => expect(res.status()).toBe(200));
			});

			test('user should take the chat', async () => {
				await poLiveChat.openChatAndSendMessage(newVisitor, 'this_a_test_message_from_user');

				await agent.poHomeChannel.sidenav.getQueuedChat(newVisitor.name).click();

				await expect(agent.poHomeChannel.content.btnTakeChat).toBeVisible();
				await agent.poHomeChannel.content.btnTakeChat.click();

				await agent.poHomeChannel.sidenav.openChat(newVisitor.name);
				await expect(agent.poHomeChannel.content.btnTakeChat).not.toBeVisible();
				await expect(agent.poHomeChannel.content.inputMessage).toBeVisible();
			});
		});
	});
});
