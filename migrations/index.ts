import * as migration_20260717_115059_initial_schema from './20260717_115059_initial_schema';
import * as migration_20260721_200724_add_case_studies from './20260721_200724_add_case_studies';
import * as migration_20260722_203953_add_case_study_localization from './20260722_203953_add_case_study_localization';

export const migrations = [
  {
    up: migration_20260717_115059_initial_schema.up,
    down: migration_20260717_115059_initial_schema.down,
    name: '20260717_115059_initial_schema',
  },
  {
    up: migration_20260721_200724_add_case_studies.up,
    down: migration_20260721_200724_add_case_studies.down,
    name: '20260721_200724_add_case_studies',
  },
  {
    up: migration_20260722_203953_add_case_study_localization.up,
    down: migration_20260722_203953_add_case_study_localization.down,
    name: '20260722_203953_add_case_study_localization'
  },
];
