import { ErrorType, SettingsKey, UserRole } from '@repo/types';
import { Request, Response, Router } from 'express';
import * as RT from 'runtypes';
import { validateSchema } from '../middleware/schemaValidation';
import AuthenticationService from '../services/authenticationService';
import SettingsService from '../services/settingsService';

export const router = Router();

router.get('/', AuthenticationService.isAuthenticated, async (_: Request, res: Response) => {
	const settings = await SettingsService.getSettings();
	return res.json(SettingsService.toObject(settings));
});

// Some settings are public, for example the registration setting.
// For this reason, this route doesn't require authentication.
router.get('/:key', async (req: Request, res: Response) => {
	const key = req.params.key as unknown as SettingsKey;

	if (!SettingsService.isPublic(key) && !req.user) {
		return req.fail(ErrorType.UNAUTHORIZED, 401, 'unauthorized');
	}

	return res.json({
		[req.params.key]: await SettingsService.getSetting(key),
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
