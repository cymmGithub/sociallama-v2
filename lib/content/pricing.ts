/**
 * The one price figure the site quotes out loud.
 *
 * Two surfaces state where professional management of a single profile starts:
 * the homepage FAQ's pricing answer and the `/uslugi/prowadzenie-social-media`
 * landing. The `seo-service-landing` spec requires the two to agree, so they
 * read one value rather than keeping two copies that drift the first time the
 * figure is revised.
 *
 * Locale-neutral by design — only the number is shared. Each locale writes its
 * own currency and period around it ("920 zł netto/mies." / "920 PLN net per
 * month"), so this module carries no copy and needs no English twin.
 */
export const STARTING_PRICE = '920'
