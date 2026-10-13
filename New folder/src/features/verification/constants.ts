import { RoleNames } from '../../serverConfig';

export const VERIFY_BUTTON_ID = 'paradise:verify:confirm';

export const BANNER_ATTACHMENT_NAME = 'paradise-verify-banner.png';

export const VERIFY_GRANT_ROLES = [
  RoleNames.member,
  RoleNames.beginner,
] as const;
