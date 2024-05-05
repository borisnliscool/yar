import { SettingsKey, UserRole } from '@repo/types';
import { Request, Response, Router } from 'express';
import * as RT from 'runtypes';
import { validateSchema } from '../middleware/schemaValidation';
import AuthenticationService from '../services/authenticationService';
import SettingsService from '../services/settingsService';

export const router = Router();

router.get('/', async (_: Request, res: Response) => {
	return res.json(await SettingsService.getSettings());
});

router.get('/:key', async (req: Request, res: Response) => {
	return res.json(await SettingsService.getSetting(req.params.key as unknown as SettingsKey));
});

const UpdateSettingSchema = RT.Record({
	value: RT.String,
});

router.put(
	'/:key',
	AuthenticationService.hasRoles(UserRole.ADMIN),
	validateSchema(UpdateSettingSchema),
	async (req: Request, res: Response) => {
		await SettingsService.setSetting(req.params.key as unknown as SettingsKey, req.body.value);
		return res.json({});
	}
);
