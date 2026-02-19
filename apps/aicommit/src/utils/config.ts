/**
 * Legacy config utilities - use ConfigService instead
 * @deprecated Use ConfigService from '../services/config.service'
 */

import { ConfigService } from '../services/config.service';

export const getConfig = ConfigService.getConfig;
export const setConfig = ConfigService.setConfig;
export const updateConfig = ConfigService.updateConfig;
