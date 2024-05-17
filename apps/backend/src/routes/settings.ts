import { SettingsKey, UserRole } from '@repo/types';
import { Request, Response, Router } from 'express';
import * as RT from 'runtypes';
import { validateSchema } from '../middleware/schemaValidation';
import AuthenticationService from '../services/authenticationService';
import SettingsService from '../services/settingsService';

export const router = Router();

// Instance settings are public, so even unauthenticated users can see them.
// This is because settings like "Enable registration" are public.

router.get('/', async (_: Request, res: Response) => {
	const settings = await SettingsService.getSettings();
	return res.json(SettingsService.toObject(settings));
});

router.get('/:key', async (req: Request, res: Response) => {
	return res.json({
		[req.params.key]: await SettingsService.getSetting(
			req.params.key as unknown as SettingsKey
		),
	});
});

const UpdateSettingSchema = RT.Record({
	value: RT.String.Or(RT.Number).Or(RT.Boolean),
});

router.put(
	'/:key',
	AuthenticationService.isAuthenticated,
	AuthenticationService.hasRoles(UserRole.ADMIN),
	validateSchema(UpdateSettingSchema),
	async (req: Request, res: Response) => {
		await SettingsService.setSetting(req.params.key as unknown as SettingsKey, req.body.value);
		return res.json({});
	}
);
