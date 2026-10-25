/**
 * schema.org nodes shared across pages. Every page emits one JSON-LD @graph
 * holding the WebSite and Person below plus its own nodes, which point back
 * at the person by @id. That gives search engines and AI crawlers one
 * unambiguous entity ("this Amir Aman, at this URL, with these profiles")
 * rather than a loose name repeated on each page.
 */
import {
  ALMA_MATER,
  COMPANY,
  EMAIL,
  KNOWS_ABOUT,
  COUNTRY_CODE,
  LOCATION,
  NAME,
  ROLE,
  SITE_DESCRIPTION,
  SITE_TITLE,
  SITE_URL,
  SOCIALS,
} from "../consts";

export const PERSON_ID = `${SITE_URL}/#person`;
export const WEBSITE_ID = `${SITE_URL}/#website`;
export const COMPANY_ID = `${SITE_URL}/#company`;

export type SchemaNode = Record<string, unknown>;

export const personRef = { "@id": PERSON_ID };

const address = { "@type": "PostalAddress", addressCountry: COUNTRY_CODE };

/** How to reach the person behind the site (and behind the company). */
const contactPoint = {
  "@type": "ContactPoint",
  contactType: "founder",
  email: EMAIL,
  url: `${SITE_URL}/contact/`,
  availableLanguage: ["English"],
};

export const baseGraph: SchemaNode[] = [
  {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: `${SITE_URL}/`,
    name: SITE_TITLE,
    description: SITE_DESCRIPTION,
    inLanguage: "en",
    publisher: personRef,
  },
  {
    "@type": "Person",
    "@id": PERSON_ID,
    name: NAME,
    url: `${SITE_URL}/`,
    image: `${SITE_URL}/logo.png`,
    jobTitle: ROLE,
    description: SITE_DESCRIPTION,
    email: `mailto:${EMAIL}`,
    homeLocation: { "@type": "Country", name: LOCATION },
    address,
    contactPoint,
    alumniOf: { "@type": "CollegeOrUniversity", name: ALMA_MATER },
    worksFor: { "@id": COMPANY_ID },
    knowsAbout: KNOWS_ABOUT,
    sameAs: Object.values(SOCIALS),
  },
  {
    "@type": "Organization",
    "@id": COMPANY_ID,
    name: COMPANY.name,
    url: COMPANY.url,
    description: COMPANY.description,
    founder: personRef,
    contactPoint,
    address,
    sameAs: [`${SITE_URL}/projects/driftwatch/`],
  },
];

/** BreadcrumbList from root-relative paths, e.g. [["Projects", "/projects"]]. */
export function breadcrumbs(trail: [name: string, path: string][]): SchemaNode {
  return {
    "@type": "BreadcrumbList",
    itemListElement: [["Home", "/"], ...trail].map(([name, path], i) => ({
      "@type": "ListItem",
      position: i + 1,
      name,
      item: new URL(path, SITE_URL).href,
    })),
  };
}
