import * as migration_20260717_115059_initial_schema from './20260717_115059_initial_schema';
import * as migration_20260721_200724_add_case_studies from './20260721_200724_add_case_studies';
import * as migration_20260722_203953_add_case_study_localization from './20260722_203953_add_case_study_localization';
import * as migration_20260725_190439_remove_case_study_period from './20260725_190439_remove_case_study_period';
import * as migration_20260726_075219_add_authors from './20260726_075219_add_authors';
import * as migration_20260726_212614_add_author_role from './20260726_212614_add_author_role';
import * as migration_20260726_220833_add_blog_hub from './20260726_220833_add_blog_hub';
import * as migration_20260727_212116_add_case_study_order from './20260727_212116_add_case_study_order';
import * as migration_20260728_163231_add_blog_localization from './20260728_163231_add_blog_localization';

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
    name: '20260722_203953_add_case_study_localization',
  },
  {
    up: migration_20260725_190439_remove_case_study_period.up,
    down: migration_20260725_190439_remove_case_study_period.down,
    name: '20260725_190439_remove_case_study_period',
  },
  {
    up: migration_20260726_075219_add_authors.up,
    down: migration_20260726_075219_add_authors.down,
    name: '20260726_075219_add_authors',
  },
  {
    up: migration_20260726_212614_add_author_role.up,
    down: migration_20260726_212614_add_author_role.down,
    name: '20260726_212614_add_author_role',
  },
  {
    up: migration_20260726_220833_add_blog_hub.up,
    down: migration_20260726_220833_add_blog_hub.down,
    name: '20260726_220833_add_blog_hub',
  },
  {
    up: migration_20260727_212116_add_case_study_order.up,
    down: migration_20260727_212116_add_case_study_order.down,
    name: '20260727_212116_add_case_study_order',
  },
  {
    up: migration_20260728_163231_add_blog_localization.up,
    down: migration_20260728_163231_add_blog_localization.down,
    name: '20260728_163231_add_blog_localization'
  },
];
