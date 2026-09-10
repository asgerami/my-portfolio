import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { NAME, SITE_DESCRIPTION } from "../consts";

export async function GET(context) {
  const posts = await getCollection("blog", ({ data }) => !data.draft);

  return rss({
    title: `${NAME} — Writing`,
    description: SITE_DESCRIPTION,
    site: context.site,
    items: posts
      .sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime())
      .map((post) => ({
        title: post.data.title,
        description: post.data.description,
        pubDate: post.data.pubDate,
        categories: post.data.tags,
        link: `/blog/${post.slug}/`,
      })),
    customData: "<language>en-us</language>",
  });
}
