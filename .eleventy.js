module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy({ "src/robots.txt": "robots.txt" });

  eleventyConfig.addCollection("posts", (api) =>
    api.getFilteredByGlob("src/posts/*.md").sort((a, b) => b.date - a.date)
  );

  eleventyConfig.addCollection("tagList", (api) => {
    const counts = {};
    api.getFilteredByGlob("src/posts/*.md").forEach((post) => {
      (post.data.tags || []).forEach((tag) => {
        if (tag === "posts") return;
        counts[tag] = (counts[tag] || 0) + 1;
      });
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([name, count]) => ({ name, count }));
  });

  eleventyConfig.addCollection("categoryList", (api) => {
    const groups = {};
    api.getFilteredByGlob("src/posts/*.md").forEach((post) => {
      (post.data.categories || []).forEach((cat) => {
        if (!groups[cat]) groups[cat] = [];
        groups[cat].push(post);
      });
    });
    return Object.entries(groups)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([name, posts]) => ({
        name,
        count: posts.length,
        posts: posts.sort((a, b) => b.date - a.date),
      }));
  });

  eleventyConfig.addCollection("archiveYears", (api) => {
    const years = {};
    api
      .getFilteredByGlob("src/posts/*.md")
      .sort((a, b) => b.date - a.date)
      .forEach((post) => {
        const y = post.date.getFullYear();
        if (!years[y]) years[y] = [];
        years[y].push(post);
      });
    return Object.entries(years)
      .sort((a, b) => Number(b[0]) - Number(a[0]))
      .map(([year, posts]) => ({ year: Number(year), posts }));
  });

  eleventyConfig.addFilter("dateFr", (value) => {
    const d = value instanceof Date ? value : new Date(value);
    return d.toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "Europe/Paris",
    });
  });

  eleventyConfig.addFilter("isoDate", (value) => {
    const d = value instanceof Date ? value : new Date(value);
    return d.toISOString();
  });

  eleventyConfig.addFilter("monthDayFr", (value) => {
    const d = value instanceof Date ? value : new Date(value);
    return d.toLocaleDateString("fr-FR", {
      month: "short",
      day: "2-digit",
      timeZone: "Europe/Paris",
    });
  });

  eleventyConfig.addGlobalData("currentYear", () => new Date().getFullYear());

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data",
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
};
