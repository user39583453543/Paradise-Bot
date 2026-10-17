import { config } from '../../config';
import { RoleNames } from '../../serverConfig';

/** The secret name of the VERIFY button. */
export const VERIFY_BUTTON_ID = 'paradise:verify:confirm';

/** The file name Discord will see for the banner image. */
export const BANNER_ATTACHMENT_NAME = 'paradise-verify-banner.png';

/**
 * The ONLY roles the VERIFY button can ever give.
 * This list is fixed in code. Nothing a user sends can change it, so nobody can use the
 * button to get a staff role. The first entry must stay the Member role.
 */
export const VERIFY_GRANT_ROLES = [
  { name: RoleNames.member, overrideId: config.ids.memberRole },
  { name: RoleNames.beginner, overrideId: config.ids.beginnerRole },
] as const;
