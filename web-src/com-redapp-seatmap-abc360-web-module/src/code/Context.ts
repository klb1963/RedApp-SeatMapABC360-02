
/*************************************/
/* Auto-generated file.              */
/* Do not modify it.                 */
/* You may remove it.                */
/* You may commit it.                */
/* You may push it.                  */
/* Remove it if module name changed. */
/* eslint:disable                    */
/*************************************/

import {IModuleContext} from "sabre-ngv-core/modules/IModuleContext";
import {ModuleContext} from "sabre-ngv-core/modules/ModuleContext";
import {I18nService, ScopedTranslator} from "sabre-ngv-app/app/services/impl/I18nService";

/** @internal **/
export const context: IModuleContext = new ModuleContext("com-redapp-seatmap-abc360-web-module");
/** @internal **/
export const cf: IModuleContext['cf'] = context.cf.bind(context);
/** @internal **/
export const registerService: IModuleContext['registerService'] = context.registerService.bind(context);
/** @internal **/
export const getService: IModuleContext['getService'] = context.getService.bind(context);
/** @internal **/
export const t: ScopedTranslator = getService(I18nService).getScopedTranslator('com-redapp-seatmap-abc360-web-module/translations');
